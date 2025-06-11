
import React from "react";
import BreachAlert from "@/components/security/BreachAlert";

const BreachAlerts: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Security Alerts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor and manage security alerts for your passwords
        </p>
      </div>
      
      <BreachAlert />
    </div>
  );
};

export default BreachAlerts;
