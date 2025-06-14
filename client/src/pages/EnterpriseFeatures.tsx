
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SharedVaults from "@/components/sharing/SharedVaults";
import PasswordSharing from "@/components/sharing/PasswordSharing";
import EmergencyAccess from "@/components/sharing/EmergencyAccess";
import { Shield, Users, Share2, AlertTriangle, Crown } from "lucide-react";

const EnterpriseFeatures: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Enterprise Features</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Free for All Users
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Advanced collaboration and security features for teams and individuals
        </p>
      </div>

      <Alert className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Good news!</strong> All enterprise features are available to free users. 
          Share passwords securely, collaborate with teams, and set up emergency access at no cost.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="shared-vaults" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shared-vaults" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Shared Vaults</span>
          </TabsTrigger>
          <TabsTrigger value="password-sharing" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Password Sharing</span>
          </TabsTrigger>
          <TabsTrigger value="emergency-access" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency Access</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shared-vaults" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Shared Vaults</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create secure password collections that can be shared with teams or trusted individuals. 
                Perfect for managing shared accounts, project credentials, or family passwords.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium">Secure Sharing</h4>
                  <p className="text-sm text-muted-foreground">End-to-end encryption</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Role-Based Access</h4>
                  <p className="text-sm text-muted-foreground">Admin, Edit, and View permissions</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium">Activity Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor all vault activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <SharedVaults />
        </TabsContent>

        <TabsContent value="password-sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Individual Password Sharing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Share individual passwords with specific people for temporary or permanent access. 
                Perfect for sharing Wi-Fi passwords, service accounts, or one-off credentials.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium">Granular Control</h4>
                  <p className="text-sm text-muted-foreground">Set exact permissions per password</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <h4 className="font-medium">Expiration Dates</h4>
                  <p className="text-sm text-muted-foreground">Automatically revoke access</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Easy Revocation</h4>
                  <p className="text-sm text-muted-foreground">Remove access instantly</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <PasswordSharing />
        </TabsContent>

        <TabsContent value="emergency-access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Emergency Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ensure your digital legacy is protected by granting trusted contacts emergency access to your passwords. 
                Perfect for family members, business partners, or estate planning.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium">Waiting Period</h4>
                  <p className="text-sm text-muted-foreground">Configurable delay before access</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground">Alert when access is requested</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Trusted Contacts</h4>
                  <p className="text-sm text-muted-foreground">Multiple emergency contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <EmergencyAccess />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseFeatures;
