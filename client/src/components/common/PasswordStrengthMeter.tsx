import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  strength: number;
  showLabel?: boolean;
  className?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  strength,
  showLabel = true,
  className,
}) => {
  const getStrengthColor = () => {
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-blue-500";
    if (strength >= 40) return "bg-yellow-500";
    if (strength >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthLabel = () => {
    if (strength >= 80) return "Strong";
    if (strength >= 60) return "Good";
    if (strength >= 40) return "Fair";
    if (strength >= 20) return "Weak";
    return "Very Weak";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="strength-meter">
        <div
          className={cn(getStrengthColor())}
          style={{ width: `${strength}%` }}
        ></div>
      </div>
      
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
