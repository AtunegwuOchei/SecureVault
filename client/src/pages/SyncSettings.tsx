
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Smartphone, Globe, Shield, Clock, CheckCircle, AlertCircle, Settings, RefreshCw } from "lucide-react";

const SyncSettings: React.FC = () => {
  const { toast } = useToast();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [mobileSyncEnabled, setMobileSyncEnabled] = useState(false);
  const [browserSyncEnabled, setBrowserSyncEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  const showNotImplementedToast = () => {
    toast({
      title: "Feature coming soon",
      description: "This feature is not yet implemented.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your sync settings have been updated.",
    });
  };

  const syncDevices = [
    {
      name: "Windows Desktop",
      type: "desktop",
      status: "synced",
      lastSync: "2 minutes ago",
      icon: <Settings className="h-5 w-5" />
    },
    {
      name: "Chrome Browser",
      type: "browser",
      status: "synced",
      lastSync: "5 minutes ago",
      icon: <Globe className="h-5 w-5" />
    },
    {
      name: "iPhone 15",
      type: "mobile",
      status: "pending",
      lastSync: "Never",
      icon: <Smartphone className="h-5 w-5" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Synced</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sync Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage how your passwords are synchronized across devices
        </p>
      </div>

      {/* Sync Status Overview */}
      <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
        <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          Your passwords are automatically encrypted and synchronized across all your devices. Last sync: 2 minutes ago.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Synchronization Settings</CardTitle>
            <CardDescription>
              Configure how and when your data is synchronized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Automatic Sync</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically sync changes across all devices
                </div>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSyncEnabled}
                onCheckedChange={setAutoSyncEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mobile-sync">Mobile App Sync</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Sync with SecureVault mobile applications
                </div>
              </div>
              <Switch
                id="mobile-sync"
                checked={mobileSyncEnabled}
                onCheckedChange={setMobileSyncEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-sync">Browser Extension Sync</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Sync with browser extensions
                </div>
              </div>
              <Switch
                id="browser-sync"
                checked={browserSyncEnabled}
                onCheckedChange={setBrowserSyncEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="encryption">End-to-End Encryption</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Encrypt data before syncing (recommended)
                </div>
              </div>
              <Switch
                id="encryption"
                checked={encryptionEnabled}
                onCheckedChange={setEncryptionEnabled}
                disabled
              />
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              Save Sync Settings
            </Button>
          </CardContent>
        </Card>

        {/* Sync Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Actions</CardTitle>
            <CardDescription>
              Manually manage synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={showNotImplementedToast} className="w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Sync Now
            </Button>

            <Button onClick={showNotImplementedToast} className="w-full" variant="outline">
              <Cloud className="h-4 w-4 mr-2" />
              Export Backup
            </Button>

            <Button onClick={showNotImplementedToast} className="w-full" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              View Sync History
            </Button>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Sync Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total synced passwords:</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Data usage this month:</span>
                  <span>2.3 KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last successful sync:</span>
                  <span>2 minutes ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>
            Devices that are currently syncing with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncDevices.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {device.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{device.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last sync: {device.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(device.status)}
                  <Button size="sm" variant="outline" onClick={showNotImplementedToast}>
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncSettings;
