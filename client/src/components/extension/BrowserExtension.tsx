import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface BrowserExtensionProps {
  onConnect?: () => void;
}

const BrowserExtension: React.FC<BrowserExtensionProps> = ({ onConnect }) => {
  const { toast } = useToast();

  const handleConnectExtension = () => {
    // Listen for messages from the browser extension
    const handleExtensionMessage = (event: MessageEvent) => {
      // Verify origin is your extension Repl
      if (event.origin !== 'https://your-extension-repl-url.replit.dev') return;
      
      if (event.data.type === 'EXTENSION_CONNECT_REQUEST') {
        // Send authentication token or user ID to extension
        event.source?.postMessage({
          type: 'EXTENSION_CONNECT_RESPONSE',
          userId: localStorage.getItem('userId'), // or get from your auth system
          apiEndpoint: window.location.origin + '/api'
        }, event.origin);
        
        toast({
          title: "Extension connected",
          description: "SecureVault browser extension is now linked to your account"
        });
        
        if (onConnect) {
          onConnect();
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    
    // Open extension connection window
    const extensionWindow = window.open(
      'https://your-extension-repl-url.replit.dev/connect', 
      'extension-connect',
      'width=500,height=600'
    );
    
    // Clean up listener when window closes
    const checkClosed = setInterval(() => {
      if (extensionWindow?.closed) {
        window.removeEventListener('message', handleExtensionMessage);
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  const handleInstallExtension = () => {
    // Open your actual browser extension Repl
    // Replace 'your-extension-repl-url' with your actual extension Repl URL
    window.open('https://your-extension-repl-url.replit.dev', '_blank');
    
    toast({
      title: "Extension installation",
      description: "Opening SecureVault browser extension installer"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Browser Extension
        </CardTitle>
        <CardDescription>
          Install our browser extension for auto-fill capabilities and seamless browser integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm flex flex-col items-center justify-center text-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold">Auto-fill Passwords</h3>
            <p className="text-muted-foreground">Automatically fill login forms on websites</p>
          </div>
          <div className="rounded-lg border p-3 text-sm flex flex-col items-center justify-center text-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="font-semibold">Security Check</h3>
            <p className="text-muted-foreground">Warns about insecure or compromised websites</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm flex flex-col items-center justify-center text-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold">Mobile Sync</h3>
            <p className="text-muted-foreground">Synchronize with the mobile app seamlessly</p>
          </div>
          <div className="rounded-lg border p-3 text-sm flex flex-col items-center justify-center text-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="font-semibold">Generate Strong Passwords</h3>
            <p className="text-muted-foreground">Create secure passwords directly in your browser</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button className="w-full" onClick={handleConnectExtension}>
          Connect Extension
        </Button>
        <Button className="w-full" variant="outline" onClick={handleInstallExtension}>
          Install Extension
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BrowserExtension;