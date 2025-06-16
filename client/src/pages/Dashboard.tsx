import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, ShieldCheck, AlertTriangle, LogOut } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import PasswordHealth from "@/components/dashboard/PasswordHealth";
import SecurityTips from "@/components/security/SecurityTips";
import PremiumFeatures from "@/components/security/PremiumFeatures";
import PasswordGenerator from "@/components/common/PasswordGenerator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBiometric } from "@/hooks/use-biometric";
import { useToast } from "@/hooks/use-toast";
import BiometricSetup from "@/components/auth/BiometricSetup";

const Dashboard: React.FC = () => {
  // Fetch current user
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Fetch password stats
  const { data: passwordStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/password-stats'],
  });

  // Fetch security alerts
  const { data: securityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/security-alerts'],
  });

  // Get user's first name
  const firstName = userData?.user?.name?.split(' ')[0] || userData?.user?.username || 'there';

  // Count unresolved alerts
  const unresolvedAlerts = securityAlerts?.filter((alert: any) => !alert.isResolved)?.length || 0;

  // Get password health percentage
  const passwordHealthPercentage = passwordStats ? 
    Math.max(0, Math.min(100, Math.round(
      (passwordStats.strong / Math.max(1, passwordStats.total)) * 100
    ))) : 0;

    const { logout } = useAuth();
    const { toast } = useToast();

    const handleLogout = async () => {
      await logout();
    };

  const { isSupported: biometricSupported, isEnabled: biometricEnabled, setupBiometric, isLoading: biometricLoading } = useBiometric();
  const [showBiometricSetup, setShowBiometricSetup] = React.useState(false);

  React.useEffect(() => {
    // Show biometric setup dialog for supported devices that haven't set it up
    const hasSeenBiometricPrompt = localStorage.getItem('biometric_prompt_shown');
    if (biometricSupported && !biometricEnabled && !hasSeenBiometricPrompt && userData?.user) {
      setShowBiometricSetup(true);
    }
  }, [biometricSupported, biometricEnabled, userData]);

  const handleEnableBiometric = async () => {
    if (!userData?.user?.username) return;
    
    try {
      const success = await setupBiometric(userData.user.username);
      if (success) {
        toast({
          title: "Success",
          description: "Biometric authentication has been set up successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up biometric authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <div>
      {/* Important Note */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Passwords generated and stored in this app do not automatically change existing site passwords. You'll need to manually update your passwords on websites with existing accounts.
        </p>
      </div>

      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
          {unresolvedAlerts > 0 
            ? `Your password security needs attention. You have ${unresolvedAlerts} item${unresolvedAlerts !== 1 ? 's' : ''} that need${unresolvedAlerts === 1 ? 's' : ''} attention.`
            : "Your password security is in good shape. No issues detected."
          }
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Passwords"
          value={statsLoading ? "..." : passwordStats?.total || 0}
          icon={<Lock className="h-6 w-6" />}
          iconBgColor="bg-primary-100 dark:bg-primary-900/20"
          iconColor="text-primary"
          subText={statsLoading ? "" : `${passwordStats?.total - passwordStats?.strong || 0} need attention`}
        />

        <StatsCard
          title="Password Health"
          value={statsLoading ? "..." : passwordHealthPercentage}
          icon={<ShieldCheck className="h-6 w-6" />}
          iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
          iconColor="text-secondary-600 dark:text-secondary-400"
          progressValue={passwordHealthPercentage}
          progressColor="bg-secondary-500"
          subText={statsLoading ? "" : `${passwordStats?.weak || 0} weak passwords`}
        />

        <StatsCard
          title="Security Alerts"
          value={alertsLoading ? "..." : unresolvedAlerts}
          icon={<AlertTriangle className="h-6 w-6" />}
          iconBgColor="bg-warning-100 dark:bg-warning-900/20"
          iconColor="text-warning-500 dark:text-warning-400"
          subText={alertsLoading 
            ? "" 
            : unresolvedAlerts > 0 
              ? `${unresolvedAlerts} issue${unresolvedAlerts !== 1 ? 's' : ''} detected`
              : "No security issues detected"
          }
        />
      </div>

      {/* Recent Activity and Password Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <RecentActivity />
        <PasswordGenerator title="Quick Password Generator" />
      </div>

      {/* Password Health Section */}
      <div className="mb-8">
        <PasswordHealth />
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumFeatures />
        <SecurityTips />
      </div>
    </div>
      {showBiometricSetup && (
        <BiometricSetup onClose={() => {
          setShowBiometricSetup(false);
          localStorage.setItem('biometric_prompt_shown', 'true');
        }} />
      )}
    </>
  );
};

export default Dashboard;