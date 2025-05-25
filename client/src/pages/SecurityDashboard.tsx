import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Shield, AlertCircle, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import BreachAlert from "@/components/security/BreachAlert";
import SecurityTips from "@/components/security/SecurityTips";
import { formatDate } from "@/lib/utils";

const SecurityDashboard: React.FC = () => {
  // Fetch password stats
  const { data: passwordStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/password-stats'],
  });

  // Fetch passwords
  const { data: passwords, isLoading: passwordsLoading } = useQuery({
    queryKey: ['/api/passwords'],
  });

  // Prepare data for pie chart
  const pieData = !statsLoading && passwordStats ? [
    { name: 'Strong', value: passwordStats.strong, color: '#10b981' },
    { name: 'Fair', value: passwordStats.total - passwordStats.strong - passwordStats.weak, color: '#3b82f6' },
    { name: 'Weak', value: passwordStats.weak, color: '#ef4444' },
  ] : [];

  // Calculate password health score
  const healthScore = !statsLoading && passwordStats && passwordStats.total > 0
    ? Math.round((passwordStats.strong / passwordStats.total) * 100)
    : 0;

  // Get health status text and color
  const getHealthStatus = () => {
    if (healthScore >= 80) return { text: 'Excellent', color: 'text-green-500' };
    if (healthScore >= 60) return { text: 'Good', color: 'text-blue-500' };
    if (healthScore >= 40) return { text: 'Fair', color: 'text-yellow-500' };
    return { text: 'Poor', color: 'text-red-500' };
  };

  // Get password strength badge
  const getStrengthBadge = (strength: number) => {
    if (strength >= 80) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Strong</Badge>;
    } else if (strength >= 60) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Good</Badge>;
    } else if (strength >= 40) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Fair</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Weak</Badge>;
    }
  };

  // Get progress color based on health score
  const getProgressColor = () => {
    if (healthScore >= 80) return 'bg-green-500';
    if (healthScore >= 60) return 'bg-blue-500';
    if (healthScore >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const healthStatus = getHealthStatus();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Password Health</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center items-center">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="8"
                        strokeDasharray={`${healthScore * 3.51} 351`}
                        className={healthScore >= 80 ? "text-green-500" : healthScore >= 60 ? "text-blue-500" : healthScore >= 40 ? "text-yellow-500" : "text-red-500"}
                        transform="rotate(-90 64 64)"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold">{healthScore}%</span>
                      <span className={`text-sm font-medium ${healthStatus.color}`}>{healthStatus.text}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {passwordStats?.total || 0} total passwords
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Strong Passwords</span>
                        <span className="text-sm font-medium text-green-500">{passwordStats?.strong || 0}</span>
                      </div>
                      <Progress value={passwordStats?.total ? (passwordStats.strong / passwordStats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${passwordStats?.total ? (passwordStats.strong / passwordStats.total) * 100 : 0}%` }} />
                      </Progress>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Fair Passwords</span>
                        <span className="text-sm font-medium text-blue-500">
                          {passwordStats?.total ? passwordStats.total - passwordStats.strong - passwordStats.weak : 0}
                        </span>
                      </div>
                      <Progress value={passwordStats?.total ? ((passwordStats.total - passwordStats.strong - passwordStats.weak) / passwordStats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${passwordStats?.total ? ((passwordStats.total - passwordStats.strong - passwordStats.weak) / passwordStats.total) * 100 : 0}%` }} />
                      </Progress>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Weak Passwords</span>
                        <span className="text-sm font-medium text-red-500">{passwordStats?.weak || 0}</span>
                      </div>
                      <Progress value={passwordStats?.total ? (passwordStats.weak / passwordStats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${passwordStats?.total ? (passwordStats.weak / passwordStats.total) * 100 : 0}%` }} />
                      </Progress>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Reused Passwords</span>
                        <span className="text-sm font-medium text-orange-500">{passwordStats?.reused || 0}</span>
                      </div>
                      <Progress value={passwordStats?.total ? (passwordStats.reused / passwordStats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${passwordStats?.total ? (passwordStats.reused / passwordStats.total) * 100 : 0}%` }} />
                      </Progress>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <p className="font-medium">Password Strength</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {passwordStats?.strong || 0} of your {passwordStats?.total || 0} passwords are strong
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-orange-500 mr-4" />
                  <div>
                    <p className="font-medium">Reused Passwords</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {passwordStats?.reused || 0} passwords are used for multiple accounts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
                  <div>
                    <p className="font-medium">Compromised Passwords</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      0 passwords found in known data breaches
                    </p>
                  </div>
                </div>
                
                <Button className="w-full">Run Security Audit</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BreachAlert />
        <SecurityTips />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Password Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weak">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="weak">Weak Passwords</TabsTrigger>
              <TabsTrigger value="reused">Reused Passwords</TabsTrigger>
              <TabsTrigger value="old">Old Passwords</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weak">
              {passwordsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : passwords?.filter((p: any) => p.strength < 50).length > 0 ? (
                <div className="space-y-4">
                  {passwords
                    .filter((p: any) => p.strength < 50)
                    .map((password: any) => (
                      <div key={password.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            <span className="text-sm font-medium">{password.title.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">{password.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Last updated {formatDate(password.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStrengthBadge(password.strength)}
                          <Button variant="ghost" size="sm" className="ml-2">
                            Update
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No weak passwords found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    All your passwords have good strength. Keep up the good work!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reused">
              {passwordsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : passwordStats?.reused > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We've detected {passwordStats.reused} reused passwords. Using unique passwords for each account is important for your security.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Specific reused password detection requires a full security scan.
                  </p>
                  
                  <Button>Run Full Security Scan</Button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reused passwords found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    All your passwords are unique. This is excellent for your security!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="old">
              {passwordsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  <div className="space-y-4">
                    {passwords
                      ?.filter((p: any) => {
                        // Filter passwords older than 180 days (6 months)
                        const updatedDate = new Date(p.updatedAt);
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        return updatedDate < sixMonthsAgo;
                      })
                      .map((password: any) => (
                        <div key={password.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                              <span className="text-sm font-medium">{password.title.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{password.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Last updated {formatDate(password.updatedAt)}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Update
                          </Button>
                        </div>
                      ))}
                    
                    {passwords?.filter((p: any) => {
                      const updatedDate = new Date(p.updatedAt);
                      const sixMonthsAgo = new Date();
                      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                      return updatedDate < sixMonthsAgo;
                    }).length === 0 && (
                      <div className="text-center py-10">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No old passwords found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          All your passwords have been updated within the last 6 months.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
