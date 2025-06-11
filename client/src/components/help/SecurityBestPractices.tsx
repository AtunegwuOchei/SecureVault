
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  Eye, 
  Smartphone, 
  Wifi, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  Key, 
  Users, 
  Database, 
  RefreshCw,
  Clock,
  XCircle,
  Info,
  Zap
} from "lucide-react";

const SecurityBestPractices: React.FC = () => {
  const [completedPractices, setCompletedPractices] = useState<Set<string>>(new Set());

  const togglePractice = (practiceId: string) => {
    setCompletedPractices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(practiceId)) {
        newSet.delete(practiceId);
      } else {
        newSet.add(practiceId);
      }
      return newSet;
    });
  };

  const securityCategories = [
    {
      id: "password-security",
      title: "Password Security",
      icon: <Key className="h-6 w-6" />,
      description: "Foundation of digital security",
      practices: [
        {
          id: "unique-passwords",
          title: "Use Unique Passwords for Every Account",
          importance: "critical",
          description: "Never reuse passwords across different accounts. If one account is compromised, unique passwords prevent attackers from accessing your other accounts.",
          implementation: [
            "Generate a new password for each new account",
            "Update existing accounts to use unique passwords",
            "Use SecureVault's password generator for strong, unique passwords",
            "Prioritize unique passwords for financial, email, and work accounts first"
          ],
          risks: "Password reuse means one breach can compromise multiple accounts",
          icon: <Key className="h-5 w-5" />
        },
        {
          id: "strong-master-password",
          title: "Create an Unbreakable Master Password",
          importance: "critical",
          description: "Your master password protects all other passwords. It should be the strongest password you have.",
          implementation: [
            "Use a memorable phrase with numbers and symbols",
            "Make it at least 12 characters long",
            "Include uppercase, lowercase, numbers, and symbols",
            "Consider using a passphrase like 'Coffee$Tastes*Better@Dawn2024!'",
            "Never write it down or share it with anyone"
          ],
          risks: "A weak master password can expose all your stored passwords",
          icon: <Shield className="h-5 w-5" />
        },
        {
          id: "password-length",
          title: "Prioritize Password Length",
          importance: "high",
          description: "Length is more important than complexity. A longer password with simple patterns is stronger than a short complex one.",
          implementation: [
            "Aim for at least 12 characters, preferably 16+",
            "Use passphrases for accounts you access frequently",
            "For generated passwords, choose maximum allowed length",
            "Remember: each additional character exponentially increases security"
          ],
          risks: "Short passwords can be cracked quickly with modern computers",
          icon: <RefreshCw className="h-5 w-5" />
        },
        {
          id: "regular-updates",
          title: "Update Passwords Regularly",
          importance: "medium",
          description: "While not necessary for all accounts, some passwords should be updated periodically.",
          implementation: [
            "Change passwords immediately after any security breach",
            "Update passwords for high-value accounts every 6-12 months",
            "Change passwords if you suspect they may be compromised",
            "Use SecureVault's breach monitoring to know when to update"
          ],
          risks: "Old passwords may have been exposed in unknown breaches",
          icon: <Clock className="h-5 w-5" />
        }
      ]
    },
    {
      id: "account-security",
      title: "Account Security",
      icon: <Lock className="h-6 w-6" />,
      description: "Protect your accounts beyond passwords",
      practices: [
        {
          id: "two-factor-authentication",
          title: "Enable Two-Factor Authentication (2FA)",
          importance: "critical",
          description: "2FA adds a second layer of security, making it much harder for attackers to access your accounts even if they have your password.",
          implementation: [
            "Enable 2FA on all important accounts (email, banking, social media)",
            "Use an authenticator app instead of SMS when possible",
            "Save backup codes in SecureVault",
            "Consider hardware security keys for maximum protection"
          ],
          risks: "Without 2FA, stolen passwords grant immediate account access",
          icon: <Smartphone className="h-5 w-5" />
        },
        {
          id: "security-questions",
          title: "Secure Your Security Questions",
          importance: "high",
          description: "Security questions are often the weakest link in account recovery. Treat them like passwords.",
          implementation: [
            "Use fake answers that only you would know",
            "Store security question answers in SecureVault",
            "Don't use real information that can be found online",
            "Make answers complex and unique for each site"
          ],
          risks: "Predictable security question answers can bypass strong passwords",
          icon: <Eye className="h-5 w-5" />
        },
        {
          id: "account-monitoring",
          title: "Monitor Account Activity",
          importance: "medium",
          description: "Regularly check your accounts for unauthorized activity and set up alerts when possible.",
          implementation: [
            "Review login notifications and activity logs",
            "Set up account alerts for login attempts",
            "Check financial statements regularly",
            "Use SecureVault's activity monitoring features"
          ],
          risks: "Undetected unauthorized access can lead to identity theft",
          icon: <Eye className="h-5 w-5" />
        }
      ]
    },
    {
      id: "digital-hygiene",
      title: "Digital Hygiene",
      icon: <Globe className="h-6 w-6" />,
      description: "Safe practices for everyday internet use",
      practices: [
        {
          id: "phishing-awareness",
          title: "Recognize and Avoid Phishing Attacks",
          importance: "critical",
          description: "Phishing is the most common way attackers steal passwords. Learn to recognize and avoid these attempts.",
          implementation: [
            "Always check the sender's email address carefully",
            "Never click suspicious links in emails or texts",
            "Type website URLs directly instead of clicking links",
            "Look for HTTPS and verify website certificates",
            "Be suspicious of urgent or threatening messages"
          ],
          risks: "Phishing attacks can steal your credentials in seconds",
          icon: <AlertTriangle className="h-5 w-5" />
        },
        {
          id: "secure-networks",
          title: "Use Secure Networks",
          importance: "high",
          description: "Protect your data transmission, especially when accessing sensitive accounts.",
          implementation: [
            "Avoid public Wi-Fi for sensitive activities",
            "Use a VPN when on public networks",
            "Ensure websites use HTTPS (look for the lock icon)",
            "Keep your home Wi-Fi network secure with WPA3"
          ],
          risks: "Unsecured networks can expose your login credentials",
          icon: <Wifi className="h-5 w-5" />
        },
        {
          id: "software-updates",
          title: "Keep Software Updated",
          importance: "high",
          description: "Software updates often include critical security patches that protect against known vulnerabilities.",
          implementation: [
            "Enable automatic updates for your operating system",
            "Keep browsers updated to the latest version",
            "Update mobile apps regularly",
            "Use supported software versions only"
          ],
          risks: "Outdated software contains known security vulnerabilities",
          icon: <RefreshCw className="h-5 w-5" />
        },
        {
          id: "data-backup",
          title: "Backup Your Important Data",
          importance: "medium",
          description: "Regular backups protect against data loss from ransomware, hardware failure, or other disasters.",
          implementation: [
            "Use SecureVault's sync feature to backup passwords",
            "Backup important files to cloud storage",
            "Test your backups regularly",
            "Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite"
          ],
          risks: "Data loss can be permanent without proper backups",
          icon: <Database className="h-5 w-5" />
        }
      ]
    },
    {
      id: "privacy-protection",
      title: "Privacy Protection",
      icon: <Eye className="h-6 w-6" />,
      description: "Protect your personal information online",
      practices: [
        {
          id: "social-media-privacy",
          title: "Secure Your Social Media",
          importance: "medium",
          description: "Social media can reveal personal information that attackers use for social engineering.",
          implementation: [
            "Review and tighten privacy settings regularly",
            "Limit personal information in public profiles",
            "Be cautious about what you share publicly",
            "Don't post information that could be used in security questions"
          ],
          risks: "Public personal information aids social engineering attacks",
          icon: <Users className="h-5 w-5" />
        },
        {
          id: "personal-information",
          title: "Protect Personal Information",
          importance: "high",
          description: "Be mindful of what personal information you share online and who has access to it.",
          implementation: [
            "Use privacy-focused search engines",
            "Limit the information you provide to websites",
            "Use fake information where it's safe and legal to do so",
            "Regularly review what information companies have about you"
          ],
          risks: "Excessive personal information sharing enables identity theft",
          icon: <Shield className="h-5 w-5" />
        }
      ]
    }
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "critical": return <Zap className="h-4 w-4" />;
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <Info className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    const totalPractices = securityCategories.reduce((sum, category) => sum + category.practices.length, 0);
    return (completedPractices.size / totalPractices) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Security Best Practices</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Essential security practices to protect your digital life
        </p>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Security Implementation Progress</span>
              <span className="text-sm text-gray-500">{completedPractices.size} practices implemented</span>
            </div>
            <Progress value={calculateProgress()} className="w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {securityCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {category.icon}
                </div>
                <div>
                  <span>{category.title}</span>
                  <p className="text-sm font-normal text-gray-500 mt-1">{category.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {category.practices.map((practice) => (
                <div key={practice.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg mt-0.5">
                        {practice.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {practice.title}
                        </h3>
                        <Badge className={`${getImportanceColor(practice.importance)} mb-2`}>
                          {getImportanceIcon(practice.importance)}
                          <span className="ml-1 capitalize">{practice.importance}</span>
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {practice.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={completedPractices.has(practice.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePractice(practice.id)}
                      className="ml-4"
                    >
                      {completedPractices.has(practice.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Implemented
                        </>
                      ) : (
                        "Mark as Done"
                      )}
                    </Button>
                  </div>

                  <Tabs defaultValue="implementation" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="implementation">How to Implement</TabsTrigger>
                      <TabsTrigger value="risks">Why It Matters</TabsTrigger>
                    </TabsList>
                    <TabsContent value="implementation" className="mt-3">
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {practice.implementation.map((step, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">{step}</li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="risks" className="mt-3">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {practice.risks}
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Security is a Journey, Not a Destination
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Security best practices evolve over time. Stay informed about new threats and 
                regularly review and update your security practices. Remember, perfect security 
                doesn't exist, but implementing these practices significantly improves your protection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityBestPractices;
