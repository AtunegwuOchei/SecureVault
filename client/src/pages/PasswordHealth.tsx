
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Clock, Loader2, Eye, RefreshCw } from "lucide-react";

const PasswordHealth: React.FC = () => {
  // Fetch password stats
  const { data: passwordStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/password-stats'],
  });

  // Fetch passwords
  const { data: passwords, isLoading: passwordsLoading } = useQuery({
    queryKey: ['/api/passwords'],
  });

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

  const healthStatus = getHealthStatus();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Password Health</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor and improve the security of your passwords
        </p>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
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
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Strong Passwords</span>
                      <span className="text-sm font-medium text-green-500">{passwordStats?.strong || 0}</span>
                    </div>
                    <Progress value={passwordStats?.total ? (passwordStats.strong / passwordStats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Weak Passwords</span>
                      <span className="text-sm font-medium text-red-500">{passwordStats?.weak || 0}</span>
                    </div>
                    <Progress value={passwordStats?.total ? (passwordStats.weak / passwordStats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Reused Passwords</span>
                      <span className="text-sm font-medium text-orange-500">0</span>
                    </div>
                    <Progress value={0} className="h-2 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Security Audit
            </Button>
            <Button variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Generate Strong Passwords
            </Button>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Check for Breaches
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Password Details */}
      <Card>
        <CardHeader>
          <CardTitle>Password Details</CardTitle>
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
                      <div key={password.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <h3 className="font-medium">{password.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{password.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStrengthBadge(password.strength)}
                          <Button size="sm">Update</Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No weak passwords found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Great job! All your passwords are strong.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reused">
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No reused passwords found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Excellent! You're not reusing any passwords.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="old">
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No old passwords detected
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your passwords are up to date.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordHealth;
