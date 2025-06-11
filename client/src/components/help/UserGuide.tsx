
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Play, 
  ChevronRight, 
  CheckCircle, 
  Key, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Settings, 
  Smartphone, 
  Globe,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from "lucide-react";

const UserGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const tutorials = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of SecureVault",
      duration: "5 min",
      steps: [
        {
          id: "gs-1",
          title: "Creating Your Account",
          content: `
            <p class="mb-4">Welcome to SecureVault! Let's get you started:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>Navigate to the registration page by clicking "Sign Up"</li>
              <li>Enter your full name, username, and email address</li>
              <li>Create a strong master password (this is very important!)</li>
              <li>Confirm your password and click "Create Account"</li>
              <li>You'll be automatically logged in and redirected to your dashboard</li>
            </ol>
            <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p class="text-sm"><strong>Tip:</strong> Your master password is the key to all your data. Make it strong and memorable - we cannot recover it if you forget it!</p>
            </div>
          `,
          icon: <Key className="h-5 w-5" />
        },
        {
          id: "gs-2",
          title: "Understanding the Dashboard",
          content: `
            <p class="mb-4">Your dashboard is your control center. Here's what you'll see:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Password Statistics:</strong> Overview of your stored passwords and their security status</li>
              <li><strong>Recent Activity:</strong> Your latest login and password management activities</li>
              <li><strong>Security Alerts:</strong> Important notifications about your password security</li>
              <li><strong>Quick Actions:</strong> Fast access to common tasks like adding passwords</li>
            </ul>
            <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p class="text-sm"><strong>Navigation:</strong> Use the sidebar on the left to access different sections of SecureVault.</p>
            </div>
          `,
          icon: <Settings className="h-5 w-5" />
        },
        {
          id: "gs-3",
          title: "Your First Password Entry",
          content: `
            <p class="mb-4">Let's add your first password to the vault:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>Go to "Password Vault" in the sidebar</li>
              <li>Click the "Add New Password" button</li>
              <li>Fill in the required information:
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Title: A name to identify this password (e.g., "Gmail", "Netflix")</li>
                  <li>Website: The URL where you use this password</li>
                  <li>Username: Your login username or email</li>
                  <li>Password: Your actual password</li>
                </ul>
              </li>
              <li>Add any notes if needed</li>
              <li>Click "Save Password"</li>
            </ol>
            <div class="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p class="text-sm"><strong>Pro Tip:</strong> Use our password generator to create strong, unique passwords for each account!</p>
            </div>
          `,
          icon: <Plus className="h-5 w-5" />
        }
      ]
    },
    {
      id: "password-management",
      title: "Password Management",
      description: "Master your password vault",
      duration: "8 min",
      steps: [
        {
          id: "pm-1",
          title: "Adding Multiple Passwords",
          content: `
            <p class="mb-4">Efficiently add all your existing passwords:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>Start with your most important accounts (email, banking, work)</li>
              <li>Use the "Add New Password" button for each entry</li>
              <li>For similar passwords, you can duplicate an entry and modify it</li>
              <li>Use categories in the notes field to organize passwords (e.g., "Work", "Personal", "Shopping")</li>
            </ol>
            <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <p class="text-sm"><strong>Organization Tip:</strong> Use consistent naming for similar services. For example: "Gmail - Personal", "Gmail - Work"</p>
            </div>
          `,
          icon: <Upload className="h-5 w-5" />
        },
        {
          id: "pm-2",
          title: "Viewing and Using Passwords",
          content: `
            <p class="mb-4">Access your passwords securely:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>View Passwords:</strong> Click the eye icon to reveal a password temporarily</li>
              <li><strong>Copy to Clipboard:</strong> Use the copy button to quickly copy usernames or passwords</li>
              <li><strong>Auto-hide:</strong> Passwords automatically hide again for security</li>
              <li><strong>Search:</strong> Use the search bar to quickly find specific passwords</li>
              <li><strong>Sort:</strong> Sort by name, date added, or last modified</li>
            </ul>
            <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p class="text-sm"><strong>Security Note:</strong> Always make sure no one is looking over your shoulder when viewing passwords!</p>
            </div>
          `,
          icon: <Eye className="h-5 w-5" />
        },
        {
          id: "pm-3",
          title: "Editing and Updating Passwords",
          content: `
            <p class="mb-4">Keep your passwords current and secure:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>Click the edit icon next to any password entry</li>
              <li>Update any field as needed (title, website, username, password, notes)</li>
              <li>Use the password generator if you're updating to a new password</li>
              <li>Click "Update Password" to save changes</li>
              <li>The system will track when passwords were last updated</li>
            </ol>
            <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p class="text-sm"><strong>Best Practice:</strong> Update passwords regularly, especially after security breaches or if you suspect compromise.</p>
            </div>
          `,
          icon: <Edit className="h-5 w-5" />
        },
        {
          id: "pm-4",
          title: "Deleting Passwords Safely",
          content: `
            <p class="mb-4">Remove passwords you no longer need:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>Find the password entry you want to delete</li>
              <li>Click the delete (trash) icon</li>
              <li>Confirm the deletion in the popup dialog</li>
              <li>The password will be permanently removed</li>
            </ol>
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <p class="text-sm"><strong>Warning:</strong> Deleted passwords cannot be recovered. Make sure you truly no longer need the account before deleting.</p>
            </div>
          `,
          icon: <Trash2 className="h-5 w-5" />
        }
      ]
    },
    {
      id: "password-generator",
      title: "Password Generator",
      description: "Create strong, unique passwords",
      duration: "5 min",
      steps: [
        {
          id: "pg-1",
          title: "Using the Password Generator",
          content: `
            <p class="mb-4">Generate secure passwords easily:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>Go to "Password Generator" in the sidebar</li>
              <li>Adjust the settings for your needs:
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Length: Choose between 8-128 characters</li>
                  <li>Character types: Include/exclude uppercase, lowercase, numbers, symbols</li>
                </ul>
              </li>
              <li>Click "Generate Password" to create a new password</li>
              <li>Copy the password to use it immediately</li>
              <li>The strength meter shows how secure your generated password is</li>
            </ol>
            <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p class="text-sm"><strong>Recommendation:</strong> Use at least 12 characters with all character types enabled for maximum security.</p>
            </div>
          `,
          icon: <RefreshCw className="h-5 w-5" />
        },
        {
          id: "pg-2",
          title: "Password Generator Best Practices",
          content: `
            <p class="mb-4">Get the most out of the password generator:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Unique Passwords:</strong> Generate a new password for every account</li>
              <li><strong>Length Matters:</strong> Longer passwords are exponentially more secure</li>
              <li><strong>All Character Types:</strong> Use uppercase, lowercase, numbers, and symbols when possible</li>
              <li><strong>Site Requirements:</strong> Some sites have specific requirements - adjust settings accordingly</li>
              <li><strong>Regular Updates:</strong> Generate new passwords periodically for important accounts</li>
            </ul>
            <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p class="text-sm"><strong>Pro Tip:</strong> If a site doesn't allow symbols, uncheck that option and increase the length to maintain security.</p>
            </div>
          `,
          icon: <Shield className="h-5 w-5" />
        }
      ]
    },
    {
      id: "security-features",
      title: "Security Features",
      description: "Monitor and improve your security",
      duration: "10 min",
      steps: [
        {
          id: "sf-1",
          title: "Understanding Password Health",
          content: `
            <p class="mb-4">Monitor your password security status:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Password Health Dashboard:</strong> Get an overview of all your passwords' security status</li>
              <li><strong>Strength Categories:</strong>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Strong (80-100): Excellent security, no action needed</li>
                  <li>Good (60-79): Decent security, consider strengthening</li>
                  <li>Fair (40-59): Moderate security, should be improved</li>
                  <li>Weak (0-39): Poor security, change immediately</li>
                </ul>
              </li>
              <li><strong>Recommendations:</strong> Follow the suggestions to improve weak passwords</li>
              <li><strong>Progress Tracking:</strong> Watch your overall security score improve over time</li>
            </ul>
          `,
          icon: <Shield className="h-5 w-5" />
        },
        {
          id: "sf-2",
          title: "Security Alerts and Breach Monitoring",
          content: `
            <p class="mb-4">Stay informed about security threats:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Breach Alerts:</strong> Get notified if your passwords appear in data breaches</li>
              <li><strong>Weak Password Alerts:</strong> Receive warnings about passwords that need strengthening</li>
              <li><strong>Reused Password Detection:</strong> Identify when you're using the same password for multiple accounts</li>
              <li><strong>Action Items:</strong> Clear guidance on what to do about each alert</li>
              <li><strong>Alert Management:</strong> Mark alerts as resolved once you've taken action</li>
            </ul>
            <div class="mt-4 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <p class="text-sm"><strong>Important:</strong> Always act on breach alerts immediately by changing the affected passwords.</p>
            </div>
          `,
          icon: <CheckCircle className="h-5 w-5" />
        },
        {
          id: "sf-3",
          title: "Activity Monitoring",
          content: `
            <p class="mb-4">Keep track of your account activity:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Login History:</strong> See when and where you've logged in</li>
              <li><strong>Password Changes:</strong> Track when passwords were created, modified, or deleted</li>
              <li><strong>Suspicious Activity:</strong> Identify any unauthorized access attempts</li>
              <li><strong>Export Logs:</strong> Download your activity history for your records</li>
            </ul>
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <p class="text-sm"><strong>Security Check:</strong> Regularly review your activity logs for any unfamiliar actions.</p>
            </div>
          `,
          icon: <Eye className="h-5 w-5" />
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">User Guide</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Step-by-step tutorials to help you master SecureVault
        </p>
      </div>

      <div className="grid gap-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{tutorial.title}</span>
                    <Badge variant="outline">{tutorial.duration}</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {tutorial.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {tutorial.steps.map((step, stepIndex) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center space-x-3">
                        {step.icon}
                        <span>{stepIndex + 1}. {step.title}</span>
                        {completedSteps.has(step.id) && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8">
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: step.content }}
                        />
                        <div className="mt-4 flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => markStepCompleted(step.id)}
                            disabled={completedSteps.has(step.id)}
                            variant={completedSteps.has(step.id) ? "outline" : "default"}
                          >
                            {completedSteps.has(step.id) ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </>
                            ) : (
                              "Mark as Completed"
                            )}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserGuide;
