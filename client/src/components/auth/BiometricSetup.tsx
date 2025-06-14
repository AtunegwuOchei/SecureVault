
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useBiometric } from '@/hooks/use-biometric';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface BiometricSetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const BiometricSetup: React.FC<BiometricSetupProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const { isSupported, isEnabled, isLoading, setupBiometric, disableBiometric } = useBiometric();
  const { toast } = useToast();
  const [showSetup, setShowSetup] = useState(false);

  const handleSetupBiometric = async () => {
    if (!user?.username) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await setupBiometric(user.username);
      if (success) {
        toast({
          title: "Success",
          description: "Biometric authentication has been set up successfully!",
        });
        onComplete?.();
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up biometric authentication",
        variant: "destructive",
      });
    }
  };

  const handleDisableBiometric = () => {
    disableBiometric();
    toast({
      title: "Disabled",
      description: "Biometric authentication has been disabled",
    });
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Fingerprint className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <CardTitle>Biometric Authentication</CardTitle>
          <CardDescription>
            Not supported on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your device or browser doesn't support biometric authentication. 
              You can still use your password to log in securely.
            </AlertDescription>
          </Alert>
          {onSkip && (
            <Button onClick={onSkip} className="w-full mt-4">
              Continue
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isEnabled) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
          <CardTitle>Biometric Authentication Enabled</CardTitle>
          <CardDescription>
            You can now use your fingerprint or face to log in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Biometric authentication is active. You can use it on your next login.
            </AlertDescription>
          </Alert>
          <div className="flex space-x-2">
            <Button onClick={handleDisableBiometric} variant="outline" className="flex-1">
              Disable
            </Button>
            {onComplete && (
              <Button onClick={onComplete} className="flex-1">
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showSetup) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Fingerprint className="h-12 w-12 mx-auto text-blue-500 mb-2" />
          <CardTitle>Enable Biometric Authentication</CardTitle>
          <CardDescription>
            Use your fingerprint or face to log in quickly and securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm">Enhanced security</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Faster login</span>
            </div>
            <div className="flex items-center space-x-2">
              <Fingerprint className="h-4 w-4 text-green-500" />
              <span className="text-sm">Uses device biometrics</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {onSkip && (
              <Button onClick={onSkip} variant="outline" className="flex-1">
                Skip for Now
              </Button>
            )}
            <Button onClick={() => setShowSetup(true)} className="flex-1">
              Set Up Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Fingerprint className="h-12 w-12 mx-auto text-blue-500 mb-2" />
        <CardTitle>Set Up Biometric Authentication</CardTitle>
        <CardDescription>
          Follow your device's prompts to register your biometric data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your biometric data is stored securely on your device and never sent to our servers.
          </AlertDescription>
        </Alert>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowSetup(false)} 
            variant="outline" 
            className="flex-1"
            disabled={isLoading}
          >
            Back
          </Button>
          <Button 
            onClick={handleSetupBiometric} 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Setting Up..." : "Start Setup"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricSetup;
