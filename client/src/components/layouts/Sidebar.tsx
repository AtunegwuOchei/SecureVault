import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { X, Home, Lock, Key, Shield, Bell, Settings, Clock, Info, Smartphone, Globe, Crown, LogOut } from "lucide-react";

interface SidebarProps {
  isVisible: boolean;
  isMobile: boolean;
  onClose: () => void;
  user: any;
}

const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isVisible, isMobile, onClose, user }) => {
  const [location] = useLocation();

  const menuItems = [
    {
      category: "Main",
      items: [
        {
          label: "Dashboard",
          icon: <Home className="h-5 w-5 mr-3" />,
          path: "/"
        },
        {
          label: "Password Vault",
          icon: <Lock className="h-5 w-5 mr-3" />,
          path: "/vault"
        },
        {
          label: "Password Generator",
          icon: <Key className="h-5 w-5 mr-3" />,
          path: "/generator"
        }
      ]
    },
    {
      category: "Security",
      items: [
        {
          label: "Security Dashboard",
          icon: <Shield className="h-5 w-5 mr-3" />,
          path: "/security"
        },
        {
          label: "Password Health",
          icon: <Clock className="h-5 w-5 mr-3" />,
          path: "/password-health"
        },
        {
          label: "Breach Alerts",
          icon: <Bell className="h-5 w-5 mr-3" />,
          path: "/breach-alerts"
        }
      ]
    },
    {
      category: "Settings",
      items: [
        {
          label: "Account Settings",
          icon: <Settings className="h-5 w-5 mr-3" />,
          path: "/settings"
        },
        {
          label: "Mobile & Browser",
          icon: <Smartphone className="h-5 w-5 mr-3" />,
          path: "/devices"
        },
        {
          label: "Sync Settings",
          icon: <Clock className="h-5 w-5 mr-3" />,
          path: "/sync"
        },
        {
          label: "Help & Support",
          icon: <Info className="h-5 w-5 mr-3" />,
          path: "/help"
        }
      ]
    },
    {
      category: "Enterprise",
      items: [
        {
          label: "Enterprise Features",
          icon: <Crown className="h-5 w-5 mr-3" />,
          path: "/enterprise"
        }
      ]
    }
  ];

  const checkActive = (path: string) => {
    return path === '/' ? location === '/' : location.startsWith(path);
  };

  // Only render if visible (on desktop always, on mobile only when toggled)
  if (!isVisible && !isMobile) return null;

  return (
    <aside 
      className={cn(
        "flex flex-col",
        isMobile 
          ? "fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl z-50"
          : "hidden lg:flex flex-col fixed inset-y-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-20"
      )}
    >
      <div className="h-full overflow-y-auto">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-xl font-semibold ml-2">SecureVault</h1>
          </div>
          {isMobile && (
            <button
              id="close-mobile-menu"
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-2 py-4">
          {menuItems.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                {category.category}
              </h2>
              {category.items.map((item, itemIndex) => (
                <Link 
                  key={itemIndex} 
                  href={item.path}
                  onClick={isMobile ? onClose : undefined}
                >
                  <a 
                    className={cn(
                      "menu-item flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1",
                      checkActive(item.path)
                        ? "active bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 bg-primary text-white">
                <AvatarFallback>{user ? getInitials(user.name || user.username) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user ? (user.name || user.username) : 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.isPremium ? 'Premium Account' : 'Free Account'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;