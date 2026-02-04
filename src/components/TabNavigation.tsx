import { LayoutDashboard, Plus, List, Crown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'dashboard' | 'novo' | 'lista' | 'planos' | 'afiliados';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'novo' as TabType, label: 'Novo', icon: Plus },
  { id: 'lista' as TabType, label: 'Lista', icon: List },
  { id: 'planos' as TabType, label: 'Planos', icon: Crown },
  { id: 'afiliados' as TabType, label: 'Afiliados', icon: Users },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="glass-effect border-b border-border sticky top-[72px] z-30 shadow-lg">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-all duration-300 hover-lift",
                isActive
                  ? "border-primary text-primary bg-secondary/50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
