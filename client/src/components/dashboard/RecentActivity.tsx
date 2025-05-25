import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatTimeAgo } from "@/lib/utils";
import { Lock, AlertTriangle, Plus, Clock } from "lucide-react";

interface ActivityItem {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

const RecentActivity: React.FC = () => {
  // Fetch recent activity
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['/api/activity-logs'],
  });

  // Get icon based on activity type
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'update_password':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
        );
      case 'security_alert':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-warning-500 dark:text-warning-400" />
          </div>
        );
      case 'create_password':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
            <Plus className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  // Get formatted title based on activity type
  const getActivityTitle = (action: string) => {
    switch (action) {
      case 'update_password':
        return 'Password Updated';
      case 'create_password':
        return 'Password Added';
      case 'delete_password':
        return 'Password Deleted';
      case 'security_alert':
        return 'Security Alert';
      case 'login':
        return 'Login';
      case 'register':
        return 'Account Created';
      case 'sync':
        return 'Sync Completed';
      default:
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start animate-pulse">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs && activityLogs.length > 0 ? (
          <div className="space-y-6">
            {activityLogs.slice(0, 4).map((activity: ActivityItem) => (
              <div key={activity.id} className="flex items-start">
                {getActivityIcon(activity.action)}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getActivityTitle(activity.action)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {activity.details}
                  </p>
                  {activity.action === 'security_alert' && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 text-sm font-medium text-primary hover:text-primary-dark p-0"
                    >
                      Take action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No recent activity to display</p>
          </div>
        )}

        {activityLogs && activityLogs.length > 4 && (
          <div className="mt-6">
            <Button variant="link" className="text-sm font-medium text-primary hover:text-primary-dark p-0">
              View all activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
