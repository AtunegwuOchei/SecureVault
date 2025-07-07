import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClipboard } from "@/hooks/use-clipboard";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Star,
  MoreVertical,
  ExternalLink,
  Share2,
} from "lucide-react";
import { decryptData } from "@/lib/encryption";
import { Password } from "@shared/schema";

interface PasswordItemProps {
  password: Password;
  onEdit: (password: Password) => void;
}

const PasswordItem: React.FC<PasswordItemProps> = ({ password, onEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string>("");
  const [shareData, setShareData] = useState({
    sharedWithUserId: "",
    permissions: "view" as "view" | "edit" | "admin",
    expiresAt: ""
  });

  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/passwords/${password.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !password.isFavorite }),
      });
      if (!response.ok) throw new Error("Failed to update favorite status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: password.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${password.title} has been ${password.isFavorite ? "removed from" : "added to"} your favorites.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    },
  });

  const sharePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/passwords/${password.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sharedWithUserId: parseInt(shareData.sharedWithUserId),
          permissions: shareData.permissions,
          expiresAt: shareData.expiresAt || undefined
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to share password");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsShareOpen(false);
      setShareData({ sharedWithUserId: "", permissions: "view", expiresAt: "" });
      toast({
        title: "Password shared",
        description: `${password.title} has been shared successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/passwords/${password.id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Delete failed");
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

  const handleCopyPassword = () => {
    copyToClipboard(password.encryptedPassword);
    toast({
      title: "Password copied",
      description: "Password has been copied to clipboard",
    });
  };

  const renderStrengthBadge = () => {
    if (password.strength >= 80) return <Badge variant="success">Strong</Badge>;
    if (password.strength >= 60) return <Badge variant="info">Good</Badge>;
    if (password.strength >= 40) return <Badge variant="warning">Fair</Badge>;
    return <Badge variant="destructive">Weak</Badge>;
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-secondary w-10 h-10 flex items-center justify-center">
              <span className="text-sm font-medium text-secondary-foreground">
                {password.title.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{password.title}</h3>
              <p className="text-sm text-muted-foreground">{password.username}</p>
            </div>
          </div>
          {renderStrengthBadge()}
        </div>

        <div>
          <div className="flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              value={password.encryptedPassword}
              readOnly
            />
            <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopyPassword}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {password.url && (
            <Button variant="link" asChild>
              <a
                href={password.url.startsWith('http') ? password.url : `https://${password.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
              >
                Visit Site
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(password)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFavoriteMutation.mutate()}>
                <Star className={`mr-2 h-4 w-4 ${password.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {password.isFavorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => deletePasswordMutation.mutate()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Share Dialog (unchanged) */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{password.title}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID to share with</Label>
              <Input
                id="userId"
                type="number"
                value={shareData.sharedWithUserId}
                onChange={(e) => setShareData(prev => ({ ...prev, sharedWithUserId: e.target.value }))}
                placeholder="Enter user ID"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Note: In a production app, this would be an email search
              </p>
            </div>

            <div>
              <Label htmlFor="permissions">Permissions</Label>
              <Select 
                value={shareData.permissions} 
                onValueChange={(value: "view" | "edit" | "admin") => 
                  setShareData(prev => ({ ...prev, permissions: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expiresAt">Expires At (optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={shareData.expiresAt}
                onChange={(e) => setShareData(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsShareOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => sharePasswordMutation.mutate()}
                disabled={sharePasswordMutation.isPending || !shareData.sharedWithUserId}
              >
                {sharePasswordMutation.isPending ? "Sharing..." : "Share Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PasswordItem;
