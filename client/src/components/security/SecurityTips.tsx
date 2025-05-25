import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, RefreshCw, LaptopIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SecurityTips: React.FC = () => {
  const { toast } = useToast();

  const showNotImplementedToast = () => {
    toast({
      title: "Feature coming soon",
      description: "This feature is not yet implemented.",
    });
  };

  const securityTips = [
    {
      title: "Enable biometric authentication",
      description: "Use your fingerprint or face recognition to secure your vault access.",
      action: "Enable now",
      icon: <Fingerprint className="h-5 w-5 text-primary" />,
      onClick: showNotImplementedToast
    },
    {
      title: "Set up automatic sync",
      description: "Keep your passwords in sync across all your devices automatically.",
      action: "Configure",
      icon: <RefreshCw className="h-5 w-5 text-primary" />,
      onClick: showNotImplementedToast
    },
    {
      title: "Install browser extension",
      description: "Get quick access to your passwords directly in your browser.",
      action: "Install extension",
      icon: <LaptopIcon className="h-5 w-5 text-primary" />,
      onClick: showNotImplementedToast
    }
  ];

  return (
    <Card>
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Security Tips</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {securityTips.map((tip, index) => (
            <div key={index}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{tip.icon}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{tip.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
                  <Button
                    variant="link"
                    className="mt-2 text-sm font-medium text-primary hover:text-primary-dark p-0"
                    onClick={tip.onClick}
                  >
                    {tip.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityTips;
