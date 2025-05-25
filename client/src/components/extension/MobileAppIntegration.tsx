import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'react-qr-code';
import { Input } from '@/components/ui/input';

interface MobileAppIntegrationProps {
  onConnect?: () => void;
}

const MobileAppIntegration: React.FC<MobileAppIntegrationProps> = ({ onConnect }) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendLink = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    // Simulate sending a link
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSending(false);
    setPhoneNumber('');
    
    toast({
      title: "App link sent",
      description: "Check your phone for the download link"
    });
  };

  const handleScanQR = () => {
    toast({
      title: "QR Code scanned",
      description: "Connecting to mobile app..."
    });
    
    setTimeout(() => {
      toast({
        title: "Mobile app connected",
        description: "Your account is now linked to the mobile app"
      });
      
      if (onConnect) {
        onConnect();
      }
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Mobile App Integration
        </CardTitle>
        <CardDescription>
          Connect your mobile device for enhanced security and on-the-go access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 text-center">
          <h3 className="text-lg font-medium mb-2">Scan this QR code</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Open the SecureVault mobile app and scan this code to connect your account
          </p>
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-lg">
              <QRCodeSVG 
                value="securevault://connect?token=demo123456789"
                size={180}
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleScanQR}
          >
            I've scanned the code
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Get the mobile app</h3>
          <p className="text-sm text-muted-foreground">
            Download our mobile app for enhanced security with biometric authentication and offline access
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Button 
              onClick={handleSendLink}
              disabled={sending}
              className="whitespace-nowrap"
            >
              {sending ? "Sending..." : "Send download link"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm">Enhanced security with biometric authentication</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MobileAppIntegration;