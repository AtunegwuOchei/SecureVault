
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useBiometric } from '@/hooks/use-biometric';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const BiometricSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { isSupported, isEnabled, isLoading, setupBiometric, disableBiometric } = useBiometric();
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center mb-6">
        <Link href="/settings">
          <a className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </a>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Biometric Authentication
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up fingerprint or face recognition for secure and convenient login
        </p>
      </div>

      {!isSupported ? (
        <Card>
          <CardHeader className="text-center">
            <Fingerprint className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <CardTitle>Biometric Authentication Not Supported</CardTitle>
            <CardDescription>
              Your device or browser doesn't support biometric authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To use biometric authentication, you need:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>A device with fingerprint scanner or face recognition</li>
                  <li>A modern browser that supports WebAuthn</li>
                  <li>HTTPS connection (secure connection)</li>
                </ul>
              </AlertDescription>
            </Alert>
            <Link href="/settings">
              <Button className="w-full mt-4">
                Return to Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : isEnabled ? (
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <CardTitle>Biometric Authentication Enabled</CardTitle>
            <CardDescription>
              You can now use your fingerprint or face to log in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Biometric authentication is active. You can use it on your next login for faster and more secure access.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">How it works:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Your biometric data stays on your device - we never see it</li>
                <li>• You can still use your password if biometrics don't work</li>
                <li>• Works across all your devices with biometric support</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleDisableBiometric} 
                variant="outline" 
                className="flex-1"
              >
                Disable Biometric Auth
              </Button>
              <Link href="/settings">
                <Button className="flex-1">
                  Done
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <Fingerprint className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <CardTitle>Set Up Biometric Authentication</CardTitle>
            <CardDescription>
              Follow the prompts to register your biometric data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">Enhanced Security</div>
                  <div className="text-sm text-blue-700 dark:text-blue-200">Your biometric data never leaves your device</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-green-900 dark:text-green-100">Faster Login</div>
                  <div className="text-sm text-green-700 dark:text-green-200">No need to remember complex passwords</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Fingerprint className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium text-purple-900 dark:text-purple-100">Device Integration</div>
                  <div className="text-sm text-purple-700 dark:text-purple-200">Uses your device's built-in biometrics</div>
                </div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Notice:</strong> Your biometric data is processed locally on your device and encrypted using industry-standard protocols. We never store or have access to your actual biometric information.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Link href="/settings">
                <Button variant="outline" className="flex-1">
                  Maybe Later
                </Button>
              </Link>
              <Button 
                onClick={handleSetupBiometric} 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Setting Up..." : "Enable Biometric Auth"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BiometricSetupPage;
