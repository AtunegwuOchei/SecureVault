
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Download, Shield, Key, Zap, ArrowLeft, Chrome, Firefox, Monitor } from 'lucide-react';
import { Link } from 'wouter';

const BrowserExtension: React.FC = () => {
  const handleInstallChrome = () => {
    // Placeholder for Chrome Web Store link - update when deployed
    window.open('https://chrome.google.com/webstore/detail/securevault-password-manager/placeholder-extension-id', '_blank');
  };

  const handleInstallFirefox = () => {
    // Placeholder for Firefox Add-ons link - update when deployed
    window.open('https://addons.mozilla.org/firefox/addon/securevault-password-manager/', '_blank');
  };

  const handleInstallEdge = () => {
    // Placeholder for Edge Add-ons link - update when deployed
    window.open('https://microsoftedge.microsoft.com/addons/detail/securevault-password-manager/placeholder-extension-id', '_blank');
  };

  const features = [
    {
      icon: <Key className="h-6 w-6" />,
      title: "Auto-fill Passwords",
      description: "Automatically fill in your saved passwords on any website"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Storage",
      description: "Your passwords are encrypted and synced across all devices"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "One-Click Login",
      description: "Log into websites with a single click, no typing required"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Universal Support",
      description: "Works on all websites and web applications"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link href="/">
          <a className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </a>
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Globe className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          SecureVault Browser Extension
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Install our browser extension to auto-fill passwords, generate secure passwords, and access your vault directly from any website.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Chrome className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle>Chrome Extension</CardTitle>
            <CardDescription>
              Install on Google Chrome and Chromium-based browsers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstallChrome} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install from Chrome Store
            </Button>
            <Badge variant="secondary" className="mt-2">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Firefox className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle>Firefox Add-on</CardTitle>
            <CardDescription>
              Install on Mozilla Firefox browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstallFirefox} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install from Firefox Store
            </Button>
            <Badge variant="secondary" className="mt-2">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Edge Extension</CardTitle>
            <CardDescription>
              Install on Microsoft Edge browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstallEdge} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install from Edge Store
            </Button>
            <Badge variant="secondary" className="mt-2">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            What you get with the SecureVault browser extension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  {React.cloneElement(feature.icon, { className: "h-6 w-6 text-blue-600" })}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Choose Your Browser
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the install button for your preferred browser above
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Install the Extension
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Follow your browser's installation process
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Sign In
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use your SecureVault credentials to connect the extension
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Start Using
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visit any website and let SecureVault auto-fill your passwords
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrowserExtension;
