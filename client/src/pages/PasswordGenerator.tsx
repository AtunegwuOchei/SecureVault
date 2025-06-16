import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generatePassword, generatePassphrase, calculatePasswordStrength, getStrengthLabel } from "@/lib/passwordUtils";

const PasswordGenerator: React.FC = () => {
  // State for password generator
  const [passwordType, setPasswordType] = useState<"random" | "passphrase">("random");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Random password options
  const [randomOptions, setRandomOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  
  // Passphrase options
  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 4,
    separator: "-",
    includeNumber: true,
    includeSymbol: false,
  });
  
  const { onCopy, hasCopied } = useClipboard();
  const { toast } = useToast();

  // Generate password mutation
  const generatePasswordMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/generate-password', params);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setPassword(data.password);
      setPasswordStrength(data.strength);
    },
    onError: (error) => {
      console.error('Password generation error:', error);
      // Fallback to client-side generation
      handleGeneratePassword();
    },
  });

  // Generate password client-side
  const handleGeneratePassword = () => {
    let newPassword = "";
    let strength = 0;
    
    if (passwordType === "random") {
      // Try server-side generation first
      generatePasswordMutation.mutate({
        length: randomOptions.length,
        includeUppercase: randomOptions.uppercase,
        includeLowercase: randomOptions.lowercase,
        includeNumbers: randomOptions.numbers,
        includeSymbols: randomOptions.symbols,
      });
      return;
    } else {
      // Generate passphrase
      newPassword = generatePassphrase(
        passphraseOptions.wordCount,
        passphraseOptions.separator
      );
      
      // Add a number if selected
      if (passphraseOptions.includeNumber) {
        newPassword += passphraseOptions.separator + Math.floor(Math.random() * 100);
      }
      
      // Add a symbol if selected
      if (passphraseOptions.includeSymbol) {
        const symbols = "!@#$%^&*";
        newPassword += symbols.charAt(Math.floor(Math.random() * symbols.length));
      }
      
      strength = calculatePasswordStrength(newPassword);
      setPassword(newPassword);
      setPasswordStrength(strength);
    }
  };
  
  // Handle random option changes
  const handleRandomOptionChange = (option: keyof typeof randomOptions, value: any) => {
    // Ensure at least one character type is selected
    if (option !== "length" && !value) {
      const currentOptions = { ...randomOptions, [option]: value };
      if (!Object.values(currentOptions).slice(1).some(Boolean)) {
        toast({
          title: "Invalid Selection",
          description: "At least one character type must be selected",
          variant: "destructive",
        });
        return;
      }
    }
    
    setRandomOptions((prev) => ({ ...prev, [option]: value }));
  };
  
  // Handle passphrase option changes
  const handlePassphraseOptionChange = (option: keyof typeof passphraseOptions, value: any) => {
    setPassphraseOptions((prev) => ({ ...prev, [option]: value }));
  };
  
  // Handle copy
  const handleCopy = () => {
    if (!password) {
      toast({
        title: "No password to copy",
        description: "Generate a password first",
        variant: "destructive",
      });
      return;
    }
    
    onCopy(password);
    toast({
      title: "Copied to clipboard",
      description: "Password has been copied to your clipboard",
    });
  };
  
  // Generate a password on component mount
  React.useEffect(() => {
    handleGeneratePassword();
  }, []);
  
  // Get strength label and color
  const strengthInfo = getStrengthLabel(passwordStrength);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Password Generator</h1>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Passwords generated in this app do not automatically change existing site passwords. You'll need to manually update your passwords on websites with existing accounts.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate a Strong Password</CardTitle>
          <CardDescription>
            Create a secure, unique password for your accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="generated-password">Generated Password</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-sm"
              >
                {hasCopied ? "Copied!" : "Copy"}
                <Copy className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Input
                id="generated-password"
                value={password}
                type={showPassword ? "text" : "password"}
                readOnly
                className="mono pr-20 text-base"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleGeneratePassword}
                  className="h-8 w-8"
                >
                  <RefreshCw size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <PasswordStrengthMeter strength={passwordStrength} />
              <div className="flex justify-end mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Strength: {strengthInfo.label}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <Tabs defaultValue="random" onValueChange={(value) => setPasswordType(value as "random" | "passphrase")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="random">Random Password</TabsTrigger>
                <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
              </TabsList>
              
              <TabsContent value="random" className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Length: {randomOptions.length}</Label>
                  </div>
                  <Slider
                    min={8}
                    max={64}
                    step={1}
                    value={[randomOptions.length]}
                    onValueChange={(value) => handleRandomOptionChange("length", value[0])}
                    className="slider w-full"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="uppercase">Include uppercase letters (A-Z)</Label>
                    <Switch
                      id="uppercase"
                      checked={randomOptions.uppercase}
                      onCheckedChange={(checked) => handleRandomOptionChange("uppercase", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowercase">Include lowercase letters (a-z)</Label>
                    <Switch
                      id="lowercase"
                      checked={randomOptions.lowercase}
                      onCheckedChange={(checked) => handleRandomOptionChange("lowercase", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="numbers">Include numbers (0-9)</Label>
                    <Switch
                      id="numbers"
                      checked={randomOptions.numbers}
                      onCheckedChange={(checked) => handleRandomOptionChange("numbers", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="symbols">Include symbols (!@#$%&*)</Label>
                    <Switch
                      id="symbols"
                      checked={randomOptions.symbols}
                      onCheckedChange={(checked) => handleRandomOptionChange("symbols", checked)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="passphrase" className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Number of words: {passphraseOptions.wordCount}</Label>
                  </div>
                  <Slider
                    min={3}
                    max={8}
                    step={1}
                    value={[passphraseOptions.wordCount]}
                    onValueChange={(value) => handlePassphraseOptionChange("wordCount", value[0])}
                    className="slider w-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="separator" className="mb-2 block">Word Separator</Label>
                    <RadioGroup 
                      id="separator" 
                      value={passphraseOptions.separator}
                      onValueChange={(value) => handlePassphraseOptionChange("separator", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="-" id="separator-hyphen" />
                        <Label htmlFor="separator-hyphen">Hyphen (-)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="." id="separator-dot" />
                        <Label htmlFor="separator-dot">Dot (.)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="_" id="separator-underscore" />
                        <Label htmlFor="separator-underscore">Underscore (_)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="separator-none" />
                        <Label htmlFor="separator-none">None</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeNumber">Include a number</Label>
                      <Switch
                        id="includeNumber"
                        checked={passphraseOptions.includeNumber}
                        onCheckedChange={(checked) => handlePassphraseOptionChange("includeNumber", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeSymbol">Include a symbol</Label>
                      <Switch
                        id="includeSymbol"
                        checked={passphraseOptions.includeSymbol}
                        onCheckedChange={(checked) => handlePassphraseOptionChange("includeSymbol", checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <Button
                onClick={handleGeneratePassword}
                className="w-full"
                disabled={generatePasswordMutation.isPending}
              >
                {generatePasswordMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Password"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">What makes a strong password?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>At least 12 characters—the more characters, the better</li>
              <li>A mixture of both uppercase and lowercase letters</li>
              <li>A mixture of letters and numbers</li>
              <li>Inclusion of at least one special character, e.g., ! @ # ? ]</li>
              <li>Not a word that can be found in a dictionary or the name of a person, character, product, or organization</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Why use a passphrase?</h3>
            <p>Passphrases are easier to remember but still provide security. A sequence of random words with special characters and numbers can be both strong and memorable.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Tips for password security</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use a different password for each of your important accounts</li>
              <li>Use a password manager to store your passwords securely</li>
              <li>Enable two-factor authentication when available</li>
              <li>Change passwords periodically, especially if you suspect they've been compromised</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
