import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Share2, Download, Smartphone, Globe, Fingerprint } from 'lucide-react';
import { Link } from 'wouter';
import { useBiometric } from '@/hooks/use-biometric';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const PremiumFeatures: React.FC = () => {
  const { isSupported: biometricSupported, isEnabled: biometricEnabled, setupBiometric, isLoading: biometricLoading } = useBiometric();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEnableBiometric = async () => {
    if (!user?.username) return;

    try {
      const success = await setupBiometric(user.username);
      if (success) {
        toast({
          title: "Success",
          description: "Biometric authentication has been set up successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up biometric authentication",
        variant: "destructive",
      });
    }
  };

  const handleBrowserExtension = () => {
    // Open browser extension in new tab
    window.open('/extension', '_blank');
  };

  const handleInstallExtension = () => {
    // Placeholder for Chrome Web Store link - update when deployed
    window.open('https://chrome.google.com/webstore/detail/securevault-password-manager/placeholder-extension-id', '_blank');
  };

  const features = [
    {
      icon: <Fingerprint className="h-5 w-5" />,
      title: "Biometric Authentication",
      description: biometricEnabled ? "Biometric login is enabled" : "Use fingerprint or face recognition to login",
      action: biometricEnabled ? "Manage Biometrics" : "Enable Now",
      badge: biometricSupported ? (biometricEnabled ? "Active" : "Available") : "Not Supported",
      onClick: biometricEnabled ? () => window.location.href = '/biometric-setup' : handleEnableBiometric,
      disabled: !biometricSupported || biometricLoading,
      variant: biometricEnabled ? "outline" : "default"
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: "Password Sharing",
      description: "Securely share passwords with team members",
      action: "Share Passwords",
      badge: "Enterprise",
      onClick: () => window.location.href = '/password-sharing'
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Browser Extension",
      description: "Auto-fill passwords across all your browsers",
      action: "View Extension",
      badge: "Free",
      onClick: handleBrowserExtension
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Install Extension",
      description: "Add SecureVault to your browser for easy access",
      action: "Install from Chrome Store",
      badge: "Free",
      onClick: handleInstallExtension
    }
  ];

  return (
    <Card>
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Enhance Your Security</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  {feature.icon}
                  <h3 className="ml-3 text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="mt-1 ml-8 text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
              <div>
                {feature.badge && (
                  <Badge className="mr-2">{feature.badge}</Badge>
                )}
                <Button 
                  variant={feature.variant || "outline"} 
                  size="sm"
                  className="mt-2"
                  onClick={feature.onClick}
                  disabled={feature.disabled}
                >
                  {feature.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumFeatures;