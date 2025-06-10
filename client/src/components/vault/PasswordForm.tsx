import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPasswordSchema, updatePasswordSchema, type Password } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculatePasswordStrength } from "@/lib/passwordUtils";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { z } from "zod";

interface PasswordFormProps {
  open: boolean;
  onClose: () => void;
  password?: Password;
  onGeneratePassword?: () => void;
  generatedPassword?: string;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  open,
  onClose,
  password,
  onGeneratePassword,
  generatedPassword
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = !!password;
  const title = isEditing ? "Edit Password" : "Add Password";

  // Extended schema with client-side validation
  const formSchema = isEditing
    ? updatePasswordSchema.extend({
        confirmPassword: z.string().optional(),
      }).refine(data => !data.encryptedPassword || !data.confirmPassword || data.encryptedPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    : insertPasswordSchema.extend({
        confirmPassword: z.string().min(1, "Please confirm your password"),
      }).refine(data => data.encryptedPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: password?.title || "",
      username: password?.username || "",
      encryptedPassword: password?.encryptedPassword || "",
      confirmPassword: password?.encryptedPassword || "",
      url: password?.url || "",
      notes: password?.notes || "",
      category: password?.category || "",
      isFavorite: password?.isFavorite || false
    }
  });

  // Watch the password field to calculate strength
  const watchPassword = watch("encryptedPassword");

  // Calculate password strength when password changes
  useEffect(() => {
    if (watchPassword) {
      const strength = calculatePasswordStrength(watchPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchPassword]);

  // Set generated password if provided
  useEffect(() => {
    if (generatedPassword) {
      setValue("encryptedPassword", generatedPassword);
      setValue("confirmPassword", generatedPassword);
      const strength = calculatePasswordStrength(generatedPassword);
      setPasswordStrength(strength);
    }
  }, [generatedPassword, setValue]);

  // Reset form when dialog opens/closes or password changes
  useEffect(() => {
    if (open) {
      if (password) {
        // Editing existing password
        setValue("title", password.title);
        setValue("username", password.username || "");
        setValue("encryptedPassword", password.encryptedPassword);
        setValue("confirmPassword", password.encryptedPassword);
        setValue("url", password.url || "");
        setValue("notes", password.notes || "");
        setValue("category", password.category || "");
        setValue("isFavorite", password.isFavorite || false);
      } else {
        // Adding new password
        reset({
          title: "",
          username: "",
          encryptedPassword: generatedPassword || "",
          confirmPassword: generatedPassword || "",
          url: "",
          notes: "",
          category: "",
          isFavorite: false
        });
      }
    }
  }, [open, password, generatedPassword, setValue, reset]);

  // Create password mutation
  const createPasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/passwords", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: "Password created",
        description: "Your password has been saved successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save password",
        description: error.message || "An error occurred while saving your password",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/passwords/${password?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update password",
        description: error.message || "An error occurred while updating your password",
        variant: "destructive",
      });
    },
  });

  // Handle close
  const handleClose = () => {
    reset();
    setPasswordStrength(0);
    onClose();
  };

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      // Remove confirm password field before sending to server
      const { confirmPassword, ...submitData } = data;

      if (isEditing) {
        await updatePasswordMutation.mutateAsync(submitData);
      } else {
        await createPasswordMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Google, Amazon, Netflix"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message?.toString()}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input
                id="username"
                placeholder="Email or username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message?.toString()}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="encryptedPassword">Password *</Label>
              <div className="relative">
                <Input
                  id="encryptedPassword"
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  className="pr-20"
                  {...register("encryptedPassword")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                  {onGeneratePassword && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onGeneratePassword}
                      className="h-8 w-8"
                    >
                      <RefreshCw size={16} />
                    </Button>
                  )}
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
              {errors.encryptedPassword && (
                <p className="text-sm text-red-500">{errors.encryptedPassword.message?.toString()}</p>
              )}
              <PasswordStrengthMeter strength={passwordStrength} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="Confirm password"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message?.toString()}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...register("url")}
              />
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url.message?.toString()}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Work, Personal, Finance"
                {...register("category")}
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message?.toString()}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes here"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message?.toString()}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavorite"
                {...register("isFavorite")}
              />
              <Label htmlFor="isFavorite">Mark as favorite</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Saving..."}
                </span>
              ) : (
                isEditing ? "Update Password" : "Save Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordForm;