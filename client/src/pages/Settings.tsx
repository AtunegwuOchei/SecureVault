import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Bell, Palette, Download, Trash2, Fingerprint } from "lucide-react";
import { useBiometric } from "@/hooks/use-biometric";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import BiometricSetup from "@/components/auth/BiometricSetup";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/components/ui/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Laptop, AlertTriangle, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [theme, setTheme] = useState("light");
  const [twoFactor, setTwoFactor] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSupported: biometricSupported, isEnabled: biometricEnabled, setupBiometric, disableBiometric } = useBiometric();
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme();

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const userDetails = userData?.user;

  // Settings states
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);
  const [biometricEnabledState, setBiometricEnabledState] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);

  const showNotImplementedToast = () => {
    toast({
      title: "Feature coming soon",
      description: "This feature is not yet implemented.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                  {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : userDetails?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-medium">{userDetails?.name || userDetails?.username || 'User'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails?.email || 'email@example.com'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userDetails?.isPremium ? 'Premium Account' : 'Free Account'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={userDetails?.name || ''} placeholder="Enter your full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={userDetails?.email || ''} placeholder="Enter your email" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={userDetails?.username || ''} placeholder="Enter your username" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="Enter your current password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Enter your new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm your new password" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Account Actions</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={showNotImplementedToast}>Export Data</Button>
                    <Button variant="destructive" onClick={showNotImplementedToast}>Delete Account</Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Enhance your account security and protect your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-5 w-5 text-primary" />
                      <Label htmlFor="autoLock">Auto-Lock Timeout</Label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lock your vault after a period of inactivity
                    </p>
                  </div>
                  <div className="w-32 flex items-center">
                    <Slider
                      id="autoLock"
                      min={1}
                      max={30}
                      step={1}
                      value={[autoLockTimeout]}
                      onValueChange={(value) => setAutoLockTimeout(value[0])}
                    />
                    <span className="ml-2 text-sm w-10">{autoLockTimeout}m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Fingerprint className="mr-2 h-5 w-5 text-primary" />
                      <Label htmlFor="biometric">Biometric Authentication</Label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use fingerprint or face recognition to unlock
                    </p>
                  </div>
                  <Switch
                    id="biometric"
                    checked={biometricEnabledState}
                    onCheckedChange={setBiometricEnabledState}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                      <Label htmlFor="notifications">Security Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get alerts about security issues
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Security Check</h3>
                  <Button onClick={showNotImplementedToast} className="w-full">
                    Run Security Audit
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your password manager
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary transition-colors ${
                        currentTheme === 'light' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setCurrentTheme('light')}
                    >
                      <Sun className="h-6 w-6 mb-2" />
                      <span>Light</span>
                    </div>
                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary transition-colors ${
                        currentTheme === 'dark' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setCurrentTheme('dark')}
                    >
                      <Moon className="h-6 w-6 mb-2" />
                      <span>Dark</span>
                    </div>
                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary transition-colors ${
                        currentTheme === 'system' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setCurrentTheme('system')}
                    >
                      <Laptop className="h-6 w-6 mb-2" />
                      <span>System</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Font Size</h3>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Accent Color</h3>
                  <Select defaultValue="blue">
                    <SelectTrigger>
                      <SelectValue placeholder="Select accent color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autofill">AutoFill</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically fill in passwords in apps and websites
                    </p>
                  </div>
                  <Switch
                    id="autofill"
                    checked={autoFillEnabled}
                    onCheckedChange={setAutoFillEnabled}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Save Appearance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Settings */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Manage how your passwords are synchronized across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="syncEnabled">Enable Sync</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Synchronize your passwords across all your devices
                    </p>
                  </div>
                  <Switch
                    id="syncEnabled"
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Sync Frequency</h3>
                  <Select defaultValue="automatic">
                    <SelectTrigger>
                      <SelectValue placeholder="Select sync frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Connected Devices</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <Laptop className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium">Current Device</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Last synced: Just now</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Current</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Sync Actions</h3>
                  <div className="flex space-x-2">
                    <Button onClick={showNotImplementedToast}>Sync Now</Button>
                    <Button variant="outline" onClick={showNotImplementedToast}>Reset Sync</Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Save Sync Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biometric Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fingerprint className="h-5 w-5" />
              <span>Biometric Authentication</span>
            </CardTitle>
            <CardDescription>
              Use your fingerprint or face to log in quickly and securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!biometricSupported ? (
              <div className="text-sm text-muted-foreground">
                Biometric authentication is not supported on this device
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Biometric Login</Label>
                    <p className="text-sm text-muted-foreground">
                      {biometricEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {biometricEnabled ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {!biometricEnabled ? (
                    <Button
                      onClick={() => setShowBiometricSetup(true)}
                      className="flex-1"
                    >
                      Set Up Biometric
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        disableBiometric();
                        toast({
                          title: "Disabled",
                          description: "Biometric authentication has been disabled",
                        });
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Disable Biometric
                    </Button>
                  )}
                </div>

                {showBiometricSetup && (
                  <div className="mt-4">
                    <BiometricSetup
                      onComplete={() => {
                        setShowBiometricSetup(false);
                        toast({
                          title: "Success",
                          description: "Biometric authentication has been set up!",
                        });
                      }}
                      onSkip={() => setShowBiometricSetup(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Settings;