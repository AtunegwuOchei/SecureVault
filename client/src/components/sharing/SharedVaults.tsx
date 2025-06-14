
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Lock, Share2, Eye, Edit, Shield } from "lucide-react";

interface SharedVault {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  isOwner: boolean;
  permissions: string;
  passwordCount: number;
  createdAt: string;
}

const SharedVaults: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVault, setNewVault] = useState({
    name: "",
    description: "",
    isPublic: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaults, isLoading } = useQuery<SharedVault[]>({
    queryKey: ['/api/shared-vaults'],
  });

  const createVaultMutation = useMutation({
    mutationFn: async (vaultData: typeof newVault) => {
      const response = await fetch('/api/shared-vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaultData),
      });
      if (!response.ok) throw new Error('Failed to create vault');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shared-vaults'] });
      setIsCreateDialogOpen(false);
      setNewVault({ name: "", description: "", isPublic: false });
      toast({
        title: "Vault created",
        description: "Your shared vault has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create vault",
        variant: "destructive",
      });
    },
  });

  const handleCreateVault = () => {
    if (!newVault.name.trim()) {
      toast({
        title: "Error",
        description: "Vault name is required",
        variant: "destructive",
      });
      return;
    }
    createVaultMutation.mutate(newVault);
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading shared vaults...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shared Vaults</h2>
          <p className="text-muted-foreground">
            Collaborate on password collections with teams and trusted contacts
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Vault
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shared Vault</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vaultName">Vault Name</Label>
                <Input
                  id="vaultName"
                  value={newVault.name}
                  onChange={(e) => setNewVault(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter vault name"
                />
              </div>
              <div>
                <Label htmlFor="vaultDescription">Description</Label>
                <Textarea
                  id="vaultDescription"
                  value={newVault.description}
                  onChange={(e) => setNewVault(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVault} disabled={createVaultMutation.isPending}>
                  {createVaultMutation.isPending ? "Creating..." : "Create Vault"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaults?.map((vault) => (
          <Card key={vault.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{vault.name}</CardTitle>
                </div>
                {vault.isOwner && (
                  <Badge variant="secondary">Owner</Badge>
                )}
              </div>
              {vault.description && (
                <p className="text-sm text-muted-foreground">{vault.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Permission</span>
                {getPermissionBadge(vault.permissions)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Passwords</span>
                <span className="text-sm font-medium">{vault.passwordCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {new Date(vault.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = `/vault/${vault.id}`}
              >
                <Lock className="h-4 w-4 mr-2" />
                Open Vault
              </Button>
            </CardContent>
          </Card>
        ))}

        {vaults?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shared vaults yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first shared vault to collaborate with others
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Vault
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedVaults;
