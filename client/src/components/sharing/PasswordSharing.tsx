import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Share2, Eye, Edit, Shield, Users, Clock, ExternalLink, Plus } from "lucide-react";

interface SharedPassword {
  id: number;
  passwordId: number;
  title: string;
  username?: string;
  url?: string;
  category?: string;
  strength: number;
  permissions: string;
  sharedBy?: string;
  sharedByEmail?: string;
  sharedWith?: string;
  sharedWithEmail?: string;
  expiresAt?: string;
  createdAt: string;
}

interface SharedPasswords {
  sharedWithMe: SharedPassword[];
  sharedByMe: SharedPassword[];
}

const PasswordSharing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'shared'>('received');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareForm, setShareForm] = useState({
    passwordId: '',
    sharedWithUserEmail: '',
    permissions: 'view',
    expiresAt: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sharedPasswords, isLoading } = useQuery<SharedPasswords>({
    queryKey: ['/api/shared-passwords'],
  });

  const { data: passwords } = useQuery({
    queryKey: ['/api/passwords'],
  });

  const sharePasswordMutation = useMutation({
    mutationFn: async (shareData: any) => {
      const response = await fetch('/api/password-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to share password');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shared-passwords'] });
      setIsShareDialogOpen(false);
      setShareForm({
        passwordId: '',
        sharedWithUserEmail: '',
        permissions: 'view',
        expiresAt: ''
      });
      toast({
        title: "Success",
        description: "Password shared successfully!",
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

  const handleSharePassword = () => {
    if (!shareForm.passwordId || !shareForm.sharedWithUserEmail) {
      toast({
        title: "Error",
        description: "Please select a password and enter an email address",
        variant: "destructive",
      });
      return;
    }

    const shareData = {
      passwordId: shareForm.passwordId,
      sharedWithUserEmail: shareForm.sharedWithUserEmail,
      permissions: shareForm.permissions,
      ...(shareForm.expiresAt && { expiresAt: shareForm.expiresAt })
    };

    sharePasswordMutation.mutate(shareData);
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'admin':
        return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'edit':
        return <Badge variant="secondary"><Edit className="h-3 w-3 mr-1" />Edit</Badge>;
      case 'view':
        return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />View</Badge>;
      default:
        return <Badge variant="outline">{permission}</Badge>;
    }
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 80) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Strong</Badge>;
    } else if (strength >= 60) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Good</Badge>;
    } else if (strength >= 40) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Fair</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Weak</Badge>;
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading shared passwords...</div>;
  }

  const sharedWithMe = sharedPasswords?.sharedWithMe || [];
  const sharedByMe = sharedPasswords?.sharedByMe || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Password Sharing</h2>
          <p className="text-muted-foreground">
            Manage passwords shared with you and by you
          </p>
        </div>

        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Share Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="passwordSelect">Select Password</Label>
                <Select
                  value={shareForm.passwordId}
                  onValueChange={(value) => setShareForm(prev => ({ ...prev, passwordId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a password to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {passwords?.map((password: any) => (
                      <SelectItem key={password.id} value={password.id.toString()}>
                        {password.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={shareForm.sharedWithUserEmail}
                  onChange={(e) => setShareForm(prev => ({ ...prev, sharedWithUserEmail: e.target.value }))}
                  placeholder="Enter user's email address"
                />
              </div>

              <div>
                <Label htmlFor="permissions">Permissions</Label>
                <Select
                  value={shareForm.permissions}
                  onValueChange={(value) => setShareForm(prev => ({ ...prev, permissions: value }))}
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
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={shareForm.expiresAt}
                  onChange={(e) => setShareForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsShareDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSharePassword}
                  className="flex-1"
                  disabled={sharePasswordMutation.isPending}
                >
                  {sharePasswordMutation.isPending ? "Sharing..." : "Share Password"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-1 ${activeTab === 'received' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('received')}
        >
          Shared with Me ({sharedWithMe.length})
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'shared' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('shared')}
        >
          Shared by Me ({sharedByMe.length})
        </button>
      </div>

      {activeTab === 'received' && (
        <div className="space-y-4">
          {sharedWithMe.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No passwords shared with you</h3>
              <p className="text-muted-foreground">
                When others share passwords with you, they'll appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedWithMe.map((item) => (
                <Card key={item.id} className={`hover:shadow-md transition-shadow ${isExpired(item.expiresAt) ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {getPermissionBadge(item.permissions)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Shared by {item.sharedBy}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.username && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Username</span>
                        <span className="text-sm font-mono">{item.username}</span>
                      </div>
                    )}

                    {item.url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Website</span>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" 
                           className="text-sm text-blue-500 hover:underline flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Strength</span>
                      {getStrengthBadge(item.strength)}
                    </div>

                    {item.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expires</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className={`text-sm ${isExpired(item.expiresAt) ? 'text-red-500' : ''}`}>
                            {new Date(item.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      disabled={isExpired(item.expiresAt)}
                      onClick={() => window.location.href = `/passwords/${item.passwordId}`}
                    >
                      {isExpired(item.expiresAt) ? 'Expired' : 'View Password'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shared' && (
        <div className="space-y-4">
          {sharedByMe.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No passwords shared yet</h3>
              <p className="text-muted-foreground">
                Share passwords with trusted contacts from your vault
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/vault'}>
                Go to Password Vault
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedByMe.map((item) => (
                <Card key={item.id} className={`hover:shadow-md transition-shadow ${isExpired(item.expiresAt) ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {getPermissionBadge(item.permissions)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Shared with {item.sharedWith || item.sharedWithEmail}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Shared on</span>
                      <span className="text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expires</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className={`text-sm ${isExpired(item.expiresAt) ? 'text-red-500' : ''}`}>
                            {new Date(item.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => window.location.href = `/passwords/${item.passwordId}`}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordSharing;