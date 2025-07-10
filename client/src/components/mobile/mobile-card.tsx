import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface MobileCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
  badge?: string;
  badgeColor?: "green" | "yellow" | "red" | "blue" | "gray";
}

export function MobileCard({ 
  title, 
  subtitle, 
  children, 
  onClick, 
  badge, 
  badgeColor = "gray" 
}: MobileCardProps) {
  const badgeColors = {
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  };

  return (
    <Card 
      className={`mb-3 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
            {onClick && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}