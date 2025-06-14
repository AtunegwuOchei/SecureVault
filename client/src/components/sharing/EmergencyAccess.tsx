
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Clock, Users, Plus, Trash2 } from "lucide-react";

interface EmergencyContact {
  id: number;
  emergencyContactId: number;
  emergencyContactName: string;
  emergencyContactEmail: string;
  accessLevel: string;
  waitingPeriod: number;
  isActive: boolean;
  createdAt: string;
}

const EmergencyAccess: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    emergencyContactEmail: "",
    accessLevel: "view" as "view" | "takeover",
    waitingPeriod: 7
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emergencyContacts, isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-access'],
  });

  const addContactMutation = useMutation({
    mutationFn: async (contactData: typeof newContact) => {
      const response = await fetch('/api/emergency-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add emergency contact');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-access'] });
      setIsAddDialogOpen(false);
      setNewContact({
        emergencyContactEmail: "",
        accessLevel: "view",
        waitingPeriod: 7
      });
      toast({
        title: "Emergency contact added",
        description: "Your emergency contact has been configured successfully",
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

  const handleAddContact = () => {
    if (!newContact.emergencyContactEmail.trim()) {
      toast({
        title: "Error",
        description: "Emergency contact email is required",
        variant: "destructive",
      });
      return;
    }
    addContactMutation.mutate(newContact);
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'takeover':
        return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Full Access</Badge>;
      case 'view':
        return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />View Only</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading emergency access...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Emergency Access</h2>
          <p className="text-muted-foreground">
            Grant trusted contacts access to your passwords in case of emergency
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Emergency Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Emergency contacts will be able to request access to your vault after a waiting period. Choose people you trust completely.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newContact.emergencyContactEmail}
                  onChange={(e) => setNewContact(prev => ({ ...prev, emergencyContactEmail: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select 
                  value={newContact.accessLevel} 
                  onValueChange={(value: "view" | "takeover") => 
                    setNewContact(prev => ({ ...prev, accessLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only - Can see passwords but not change them</SelectItem>
                    <SelectItem value="takeover">Full Access - Can take over account completely</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="waitingPeriod">Waiting Period (days)</Label>
                <Select 
                  value={newContact.waitingPeriod.toString()} 
                  onValueChange={(value) => 
                    setNewContact(prev => ({ ...prev, waitingPeriod: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days (recommended)</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  How long to wait before granting emergency access
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact} disabled={addContactMutation.isPending}>
                  {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Emergency access allows trusted contacts to access your passwords after a waiting period. You'll be notified when access is requested and can deny it if you're available.
        </AlertDescription>
      </Alert>

      {emergencyContacts && emergencyContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyContacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contact.emergencyContactName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{contact.emergencyContactEmail}</p>
                  </div>
                  <Badge variant={contact.isActive ? "default" : "secondary"}>
                    {contact.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Access Level</span>
                  {getAccessLevelBadge(contact.accessLevel)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Waiting Period</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">{contact.waitingPeriod} days</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Added</span>
                  <span className="text-sm">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No emergency contacts configured</h3>
          <p className="text-muted-foreground mb-4">
            Set up emergency access to ensure your passwords can be accessed by trusted contacts if needed
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Emergency Contact
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmergencyAccess;
