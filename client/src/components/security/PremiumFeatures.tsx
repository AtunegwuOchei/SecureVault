import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PremiumFeatures: React.FC = () => {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Coming Soon",
      description: "Premium upgrade feature is not yet available.",
    });
  };

  const features = [
    "Secure credential sharing with team members",
    "Emergency access for trusted contacts",
    "Advanced multi-factor authentication options",
    "Priority customer support"
  ];

  return (
    <Card>
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Premium Features Available</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-secondary-500 dark:text-secondary-400" />
              </div>
              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">{feature}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button
            className="w-full"
            onClick={handleUpgrade}
          >
            Upgrade to Premium - $2/month
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumFeatures;
