import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colorClass: string;
  iconBgClass: string;
  delay?: number;
}

export const StatsCard = ({ 
  icon: Icon, 
  value, 
  label, 
  colorClass, 
  iconBgClass,
  delay = 0 
}: StatsCardProps) => {
  return (
    <div 
      className="gradient-border rounded-xl shadow-xl p-3 text-center border border-border hover-lift animate-fade-in-scale"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className={cn(
          "w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center animate-float",
          iconBgClass
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className={cn("text-xl font-bold mb-1", colorClass)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};
