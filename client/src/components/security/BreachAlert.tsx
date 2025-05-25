import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface BreachAlert {
  id: number;
  type: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  metadata?: {
    site?: string;
    email?: string;
    lastUpdated?: string;
    severity?: string;
  };
}

const BreachAlert: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch security alerts
  const { data: alerts, isLoading } = useQuery<BreachAlert[]>({
    queryKey: ['/api/security-alerts'],
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest("POST", `/api/security-alerts/${alertId}/resolve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security-alerts'] });
      toast({
        title: "Alert resolved",
        description: "The security alert has been marked as resolved",
      });
    },
    onError: () => {
      toast({
        title: "Action failed",
        description: "Could not resolve the security alert",
        variant: "destructive",
      });
    },
  });

  // Get alert type badge
  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'breach':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            Data Breach
          </span>
        );
      case 'weak':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            Weak Password
          </span>
        );
      case 'reused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
            Reused Password
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            Alert
          </span>
        );
    }
  };

  // Handle resolve alert
  const handleResolveAlert = (alertId: number) => {
    resolveAlertMutation.mutate(alertId);
  };

  // Filter unresolved alerts
  const unresolvedAlerts = alerts?.filter(alert => !alert.isResolved) || [];

  return (
    <Card>
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
        <CardTitle>Security Alerts</CardTitle>
        <div>
          {getAlertCount(unresolvedAlerts.length)}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : unresolvedAlerts.length > 0 ? (
          <div className="space-y-4">
            {unresolvedAlerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-warning-500 dark:text-warning-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {alert.metadata?.site || 'Security Alert'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div>
                    {getAlertBadge(alert.type)}
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {alert.description}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                    disabled={resolveAlertMutation.isPending}
                  >
                    {resolveAlertMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">All Clear!</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No security alerts detected. Your passwords are secure.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get alert count text
function getAlertCount(count: number) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        All Clear
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
      {count} {count === 1 ? 'Alert' : 'Alerts'}
    </span>
  );
}

export default BreachAlert;
