import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrowserExtension from '@/components/extension/BrowserExtension';
import MobileAppIntegration from '@/components/extension/MobileAppIntegration';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Info } from 'lucide-react';

const DeviceIntegration: React.FC = () => {
  const { toast } = useToast();
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);

  const handleMobileConnect = () => {
    setIsMobileConnected(true);
    toast({
      title: "Mobile app connected",
      description: "You can now use biometric login and access your passwords on mobile"
    });
  };

  const handleExtensionConnect = () => {
    setIsExtensionConnected(true);
    toast({
      title: "Browser extension connected",
      description: "You can now autofill passwords on websites"
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Device Integration</h1>
        <p className="text-muted-foreground">
          Connect your mobile devices and browser extensions for a seamless password management experience
        </p>
      </div>

      {(isMobileConnected || isExtensionConnected) && (
        <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Enhanced security active</AlertTitle>
          <AlertDescription>
            {isMobileConnected && isExtensionConnected 
              ? "Both mobile app and browser extension are connected. Your passwords are now fully synchronized across all devices."
              : isMobileConnected 
                ? "Mobile app connected. You can use biometric authentication for enhanced security."
                : "Browser extension connected. You can now autofill passwords on websites."
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="mobile" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mobile">Mobile App</TabsTrigger>
          <TabsTrigger value="extension">Browser Extension</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mobile">
          {isMobileConnected ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Mobile App Connected</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your account is now linked to the SecureVault mobile app
              </p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                <Button variant="outline" onClick={() => toast({
                  title: "Sync initiated",
                  description: "Syncing your passwords to mobile device"
                })}>
                  Sync Passwords
                </Button>
                <Button variant="destructive" onClick={() => {
                  setIsMobileConnected(false);
                  toast({
                    title: "Mobile app disconnected",
                    description: "Your account has been unlinked from the mobile app"
                  });
                }}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <MobileAppIntegration onConnect={handleMobileConnect} />
          )}
        </TabsContent>
        
        <TabsContent value="extension">
          {isExtensionConnected ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Browser Extension Connected</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your account is now linked to the SecureVault browser extension
              </p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                <Button variant="outline" onClick={() => toast({
                  title: "Settings updated",
                  description: "Browser extension settings have been updated"
                })}>
                  Configure Settings
                </Button>
                <Button variant="destructive" onClick={() => {
                  setIsExtensionConnected(false);
                  toast({
                    title: "Browser extension disconnected",
                    description: "Your account has been unlinked from the browser extension"
                  });
                }}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <BrowserExtension onConnect={handleExtensionConnect} />
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Zero-knowledge architecture</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              SecureVault uses a zero-knowledge architecture to ensure your passwords are encrypted before leaving your device. 
              This means even if our servers are compromised, your sensitive data remains secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceIntegration;