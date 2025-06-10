import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { generatePassword, calculatePasswordStrength } from "@/lib/passwordUtils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PasswordGeneratorProps {
  onSelect?: (password: string) => void;
  className?: string;
  title?: string;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onSelect,
  className,
  title = "Password Generator",
}) => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [strength, setStrength] = useState(0);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const { onCopy, hasCopied } = useClipboard();

  // Generate password mutation (fallback to server-side if available)
  const generatePasswordMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/generate-password', params);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setPassword(data.password);
      setStrength(data.strength);
    },
    onError: (error) => {
      console.error('Server password generation failed, using client-side:', error);
      // Fallback to client-side generation if server fails
      generatePasswordLocally();
    },
  });

  // Generate password locally as fallback
  const generatePasswordLocally = () => {
    const newPassword = generatePassword(
      length,
      options.uppercase,
      options.lowercase,
      options.numbers,
      options.symbols
    );
    setPassword(newPassword);
    setStrength(calculatePasswordStrength(newPassword));
  };

  // Handle password generation with server API or local fallback
  const handleGeneratePassword = () => {
    // Try server-side generation first, with client-side fallback
    if (process.env.NODE_ENV === 'development') {
      generatePasswordMutation.mutate({
        length,
        includeUppercase: options.uppercase,
        includeLowercase: options.lowercase,
        includeNumbers: options.numbers,
        includeSymbols: options.symbols,
      });
    } else {
      // In production or if server is not available, use client-side
      generatePasswordLocally();
    }
  };

  // Handle option changes
  const handleOptionChange = (option: keyof typeof options, value: boolean) => {
    // Ensure at least one option is selected
    if (!value && Object.values(options).filter(Boolean).length === 1 && options[option]) {
      return;
    }

    const newOptions = { ...options, [option]: value };
    setOptions(newOptions);

    // Regenerate password with new options
    if (password) {
      const newPassword = generatePassword(
        length,
        newOptions.uppercase,
        newOptions.lowercase,
        newOptions.numbers,
        newOptions.symbols
      );
      setPassword(newPassword);
      setStrength(calculatePasswordStrength(newPassword));
    }
  };

  // Handle length change
  const handleLengthChange = (newLength: number) => {
    setLength(newLength);

    // Regenerate password with new length
    if (password) {
      const newPassword = generatePassword(
        newLength,
        options.uppercase,
        options.lowercase,
        options.numbers,
        options.symbols
      );
      setPassword(newPassword);
      setStrength(calculatePasswordStrength(newPassword));
    }
  };

  // Handle copy button click
  const handleCopy = () => {
    if (password) {
      onCopy(password);
    }
  };

  // Handle select button click
  const handleSelect = () => {
    if (onSelect && password) {
      onSelect(password);
    }
  };

  // Generate password on component mount
  useEffect(() => {
    generatePasswordLocally();
  }, []);

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="password">Generated Password</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-sm text-primary hover:text-primary-dark"
            >
              {hasCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              value={password}
              readOnly
              className="font-mono block w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-primary focus:border-primary"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleGeneratePassword}
              disabled={generatePasswordMutation.isPending}
            >
              <RefreshCw className={`h-5 w-5 text-gray-500 ${generatePasswordMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="mt-2">
            <PasswordStrengthMeter strength={strength} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="length">Length: {length}</Label>
            </div>
            <Slider
              id="length"
              min={8}
              max={32}
              step={1}
              value={[length]}
              onValueChange={(value) => handleLengthChange(value[0])}
              className="w-full"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="flex-1">Include uppercase letters (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={(checked) => handleOptionChange("uppercase", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="flex-1">Include lowercase letters (a-z)</Label>
              <Switch
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={(checked) => handleOptionChange("lowercase", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="flex-1">Include numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={options.numbers}
                onCheckedChange={(checked) => handleOptionChange("numbers", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="flex-1">Include symbols (!@#$%&*)</Label>
              <Switch
                id="symbols"
                checked={options.symbols}
                onCheckedChange={(checked) => handleOptionChange("symbols", checked)}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button
              className="w-full"
              onClick={handleGeneratePassword}
              disabled={generatePasswordMutation.isPending}
            >
              {generatePasswordMutation.isPending ? "Generating..." : "Generate Password"}
            </Button>

            {onSelect && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSelect}
                disabled={!password}
              >
                Use This Password
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordGenerator;