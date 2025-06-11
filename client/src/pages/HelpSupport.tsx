
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import UserGuide from "@/components/help/UserGuide";
import SecurityBestPractices from "@/components/help/SecurityBestPractices";
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  Video, 
  Mail, 
  Phone, 
  ExternalLink,
  Search,
  Shield,
  Key,
  Smartphone,
  Globe,
  Settings,
  AlertCircle
} from "lucide-react";

const HelpSupport: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const showNotImplementedToast = () => {
    toast({
      title: "Feature coming soon",
      description: "This feature is not yet implemented.",
    });
  };

  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const faqItems = [
    {
      category: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      questions: [
        {
          question: "How do I create my first password entry?",
          answer: "Go to the Password Vault section and click 'Add New Password'. Fill in the required information including the website, username, and password. You can also use our password generator to create a strong password."
        },
        {
          question: "How secure is SecureVault?",
          answer: "SecureVault uses industry-standard AES-256 encryption to protect your data. Your master password is never stored on our servers, and all encryption happens locally on your device."
        },
        {
          question: "Can I import passwords from other password managers?",
          answer: "Yes, we support importing from most popular password managers including LastPass, 1Password, and Bitwarden. Go to Settings > Import/Export to get started."
        }
      ]
    },
    {
      category: "Security",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "What happens if I forget my master password?",
          answer: "Unfortunately, we cannot recover your master password as it's not stored on our servers. You'll need to reset your account, which will delete all stored passwords. We recommend setting up account recovery options in your settings."
        },
        {
          question: "How does the password strength checker work?",
          answer: "Our password strength checker analyzes various factors including length, character variety, common patterns, and checks against known breached passwords to give you a security score."
        },
        {
          question: "What are breach alerts?",
          answer: "Breach alerts notify you when one of your passwords appears in a known data breach. We regularly check your passwords against databases of compromised credentials and alert you to change affected passwords."
        }
      ]
    },
    {
      category: "Sync & Devices",
      icon: <Smartphone className="h-5 w-5" />,
      questions: [
        {
          question: "How do I sync my passwords across devices?",
          answer: "Sync is automatic when you're logged in. Your passwords are encrypted and synchronized across all your devices. You can manage sync settings in the Sync Settings page."
        },
        {
          question: "Can I use SecureVault offline?",
          answer: "Yes, you can access your passwords offline. Changes made offline will sync when you reconnect to the internet."
        },
        {
          question: "How do I install the browser extension?",
          answer: "Visit our website and download the extension for your browser (Chrome, Firefox, Safari, Edge). Once installed, log in with your SecureVault credentials."
        }
      ]
    }
  ];

  const helpResources = [
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides for common tasks",
      icon: <Video className="h-6 w-6 text-blue-500" />,
      action: "Watch Videos",
      onClick: showNotImplementedToast
    },
    {
      title: "User Guide",
      description: "Comprehensive documentation and best practices",
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      action: "Read Guide",
      onClick: () => navigateToTab("guide")
    },
    {
      title: "Community Forum",
      description: "Connect with other users and get help",
      icon: <MessageCircle className="h-6 w-6 text-purple-500" />,
      action: "Visit Forum",
      onClick: showNotImplementedToast
    },
    {
      title: "Security Best Practices",
      description: "Learn how to stay secure online",
      icon: <Shield className="h-6 w-6 text-orange-500" />,
      action: "Learn More",
      onClick: () => navigateToTab("security")
    }
  ];

  const contactOptions = [
    {
      method: "Email Support",
      description: "Get help via email within 24 hours",
      icon: <Mail className="h-5 w-5" />,
      contact: "support@securevault.com",
      badge: "Free"
    },
    {
      method: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: <MessageCircle className="h-5 w-5" />,
      contact: "Available 9 AM - 5 PM EST",
      badge: "Premium"
    },
    {
      method: "Phone Support",
      description: "Speak directly with our technical team",
      icon: <Phone className="h-5 w-5" />,
      contact: "+1 (555) 123-4567",
      badge: "Premium"
    }
  ];

  const filteredFAQs = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Help & Support</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Find answers to common questions and get the help you need
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guide">User Guide</TabsTrigger>
          <TabsTrigger value="security">Security Guide</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {(searchQuery ? filteredFAQs : faqItems).map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {category.icon}
                    <span>{category.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {category.questions.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guide">
          <UserGuide />
        </TabsContent>

        <TabsContent value="security">
          <SecurityBestPractices />
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpResources.map((resource, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{resource.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {resource.description}
                      </p>
                      <Button onClick={resource.onClick} variant="outline" size="sm">
                        {resource.action}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Options</CardTitle>
                <CardDescription>
                  Choose the best way to reach our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{option.method}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.contact}</p>
                      </div>
                    </div>
                    <Badge variant={option.badge === "Premium" ? "default" : "outline"}>
                      {option.badge}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSupport;
