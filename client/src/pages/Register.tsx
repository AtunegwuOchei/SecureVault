import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Info } from "lucide-react";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { calculatePasswordStrength } from "@/lib/passwordUtils";

const Register: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Form validation with react-hook-form and zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    //resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      masterKeyHash: "", // Will be set in onSubmit
      salt: "", // Will be set in onSubmit
    }
  });

  // Watch password for strength calculation
  const watchPassword = watch("password");

  // Calculate password strength when password changes
  React.useEffect(() => {
    if (watchPassword) {
      const strength = calculatePasswordStrength(watchPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchPassword]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create your account",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (data: any) => {
    // For this demo, we'll just use password as masterKeyHash and a placeholder for salt
    // In a real app, you'd generate a proper salt and hash
    const submitData = {
      ...data,
      masterKeyHash: data.password, // This is just for the demo, in reality you'd hash this properly
      salt: "placeholder-salt-value", // This is just for the demo
    };

    await registerMutation.mutateAsync(submitData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SecureVault</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your secure password vault</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create a new account to securely store your passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  {...register("username")}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email")}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...register("name")}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Master Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong master password"
                    {...register("password")}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message?.toString()}</p>
                )}
                <PasswordStrengthMeter strength={passwordStrength} />
                <div className="flex items-start mt-2">
                  <Info className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your master password is used to encrypt all your data. Make sure it's strong and you remember it. We cannot recover it if you forget.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Master Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your master password"
                    {...register("confirmPassword")}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message?.toString()}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || registerMutation.isPending}
              >
                {(isSubmitting || registerMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
