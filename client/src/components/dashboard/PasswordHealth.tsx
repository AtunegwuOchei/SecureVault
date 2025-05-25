import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

const PasswordHealth: React.FC = () => {
  // Fetch password health stats
  const { data: passwordStats, isLoading } = useQuery({
    queryKey: ['/api/password-stats'],
  });

  // Fetch security alerts
  const { data: securityAlerts } = useQuery({
    queryKey: ['/api/security-alerts'],
  });

  // Get alert badge
  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'weak':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300 mr-2">
            Weak
          </span>
        );
      case 'reused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300 mr-2">
            Reused
          </span>
        );
      case 'breach':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300 mr-2">
            Breached
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <CardTitle>Password Health</CardTitle>
        <Button variant="link" className="text-sm font-medium text-primary hover:text-primary-dark p-0">
          <Link href="/password-health">View Full Report</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Strong Passwords</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {passwordStats?.strong || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Weak Passwords</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {passwordStats?.weak || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-danger-100 dark:bg-danger-900/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reused Passwords</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {passwordStats?.reused || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {(passwordStats?.weak > 0 || passwordStats?.reused > 0) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Passwords That Need Attention
                </h3>
                
                {securityAlerts && securityAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {securityAlerts.slice(0, 3).map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            <span className="text-sm font-medium">
                              {alert.metadata?.site?.substring(0, 2) || "PW"}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {alert.metadata?.site || "Unknown Site"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {alert.metadata?.lastUpdated || "Date unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getAlertBadge(alert.type)}
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No specific alerts to display at this time, but some of your passwords need attention.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordHealth;
