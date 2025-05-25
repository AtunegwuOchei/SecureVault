import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  subText?: string;
  progressValue?: number;
  progressColor?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  subText,
  progressValue,
  progressColor,
  className,
}) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {value}
            {typeof value === 'number' && title === 'Password Health' && <span className="text-lg font-medium">%</span>}
          </p>
        </div>
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <div className={cn("h-6 w-6", iconColor)}>{icon}</div>
        </div>
      </div>
      
      {progressValue !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={cn("h-2 rounded-full", progressColor || "bg-blue-500")} 
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {subText && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{subText}</p>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
