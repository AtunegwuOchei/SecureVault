import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";

import MainLayout from "@/components/layouts/MainLayout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import PasswordVault from "@/pages/PasswordVault";
import PasswordGenerator from "@/pages/PasswordGenerator";
import SecurityDashboard from "@/pages/SecurityDashboard";
import Settings from "@/pages/Settings";
import DeviceIntegration from "@/pages/DeviceIntegration";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BreachAlerts from "@/pages/BreachAlerts";
import PasswordHealth from "@/pages/PasswordHealth";
import SyncSettings from "@/pages/SyncSettings";
import HelpSupport from "@/pages/HelpSupport";
import BiometricSetupPage from "@/pages/BiometricSetup";
import BrowserExtension from "@/pages/BrowserExtension";
import EnterpriseFeatures from "@/pages/EnterpriseFeatures";
import SharedVaultsPage from "@/pages/SharedVaults";
import PasswordSharingPage from "@/pages/PasswordSharing";
import EmergencyAccessPage from "@/pages/EmergencyAccess";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

function Router() {
  const [location] = useLocation();
  const isAuthPage = location === "/login" || location === "/register";

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />

      {/* Protected Routes */}
      <Route path="/">
        {isAuthPage ? null : (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        )}
      </Route>

      <Route path="/vault">
        {isAuthPage ? null : (
          <MainLayout>
            <PasswordVault />
          </MainLayout>
        )}
      </Route>

      <Route path="/generator">
        {isAuthPage ? null : (
          <MainLayout>
            <PasswordGenerator />
          </MainLayout>
        )}
      </Route>

      <Route path="/security">
        {isAuthPage ? null : (
          <MainLayout>
            <SecurityDashboard />
          </MainLayout>
        )}
      </Route>

      <Route path="/breach-alerts">
        {isAuthPage ? null : (
          <MainLayout>
            <BreachAlerts />
          </MainLayout>
        )}
      </Route>

      <Route path="/password-health">
        {isAuthPage ? null : (
          <MainLayout>
            <PasswordHealth />
          </MainLayout>
        )}
      </Route>

      <Route path="/sync">
        {isAuthPage ? null : (
          <MainLayout>
            <SyncSettings />
          </MainLayout>
        )}
      </Route>

      <Route path="/help">
        {isAuthPage ? null : (
          <MainLayout>
            <HelpSupport />
          </MainLayout>
        )}
      </Route>

      <Route path="/settings">
        {isAuthPage ? null : (
          <MainLayout>
            <Settings />
          </MainLayout>
        )}
      </Route>

      <Route path="/devices">
        {isAuthPage ? null : (
          <MainLayout>
            <DeviceIntegration />
          </MainLayout>
        )}
      </Route>

      <Route path="/enterprise">
        {isAuthPage ? null : (
          <MainLayout>
            <EnterpriseFeatures />
          </MainLayout>
        )}
      </Route>

      <Route path="/shared-vaults">
        {isAuthPage ? null : (
          <MainLayout>
            <SharedVaultsPage />
          </MainLayout>
        )}
      </Route>

      <Route path="/password-sharing">
        {isAuthPage ? null : (
          <MainLayout>
            <PasswordSharingPage />
          </MainLayout>
        )}
      </Route>

      <Route path="/emergency-access">
        {isAuthPage ? null : (
          <MainLayout>
            <EmergencyAccessPage />
          </MainLayout>
        )}
      </Route>

      <Route path="/biometric-setup">
        {isAuthPage ? null : (
          <MainLayout>
            <BiometricSetupPage />
          </MainLayout>
        )}
      </Route>

      <Route path="/extension">
        {isAuthPage ? null : (
          <MainLayout>
            <BrowserExtension />
          </MainLayout>
        )}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check authentication status on mount
 useEffect(() => {
    const checkAuth = async () => {
      try {
        await queryClient.fetchQuery({
          queryKey: ['/api/auth/me'],
          staleTime: Infinity
        });
      } catch (error) {
        // Only redirect if not already on an auth page
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
          window.location.href = '/login';
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="securevault-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;