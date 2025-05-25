import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { maskPassword } from "@/lib/utils";
import { Eye, EyeOff, Copy, Edit, Trash, Star, StarOff } from "lucide-react";
import { Password } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PasswordItemProps {
  password: Password;
  onEdit: (password: Password) => void;
}

const PasswordItem: React.FC<PasswordItemProps> = ({ password, onEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { onCopy } = useClipboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Favorites mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "PUT", 
        `/api/passwords/${password.id}`, 
        { isFavorite: !password.isFavorite }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: password.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${password.title} has been ${password.isFavorite ? "removed from" : "added to"} your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Action failed",
        description: "Could not update favorite status",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deletePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "DELETE", 
        `/api/passwords/${password.id}`, 
        undefined
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: "Password deleted",
        description: `${password.title} has been deleted from your vault`,
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete the password",
        variant: "destructive",
      });
    },
  });

  // Handle copy password
  const handleCopyPassword = () => {
    onCopy(password.encryptedPassword);
    toast({
      title: "Password copied",
      description: "Password has been copied to clipboard",
    });
  };

  // Handle toggle favorite
  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  // Handle edit
  const handleEdit = () => {
    onEdit(password);
  };

  // Render strength badge
  const renderStrengthBadge = () => {
    if (password.strength >= 80) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Strong</span>;
    } else if (password.strength >= 60) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Good</span>;
    } else if (password.strength >= 40) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Fair</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Weak</span>;
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="text-sm font-medium text-primary">
              {password.title.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{password.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{password.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {renderStrengthBadge()}
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <div className="relative flex-1">
          <input
            type={showPassword ? "text" : "password"}
            value={showPassword ? password.encryptedPassword : maskPassword(password.encryptedPassword)}
            readOnly
            className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm text-sm mono"
          />
        </div>
        <div className="ml-2 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyPassword}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Copy size={18} />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <div>
          {password.url && (
            <a
              href={password.url.startsWith('http') ? password.url : `https://${password.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-dark"
            >
              Visit Site
            </a>
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {password.isFavorite ? (
              <Star size={18} className="fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff size={18} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Edit size={18} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
              >
                <Trash size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Password</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this password? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deletePasswordMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};

export default PasswordItem;
