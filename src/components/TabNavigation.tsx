import { LayoutDashboard, Plus, List, Crown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'dashboard' | 'novo' | 'lista' | 'planos' | 'afiliados' | 'chat';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'dashboard' as TabType, label: 'Painel', icon: LayoutDashboard },
  { id: 'novo' as TabType, label: 'Novo Serviço', icon: Plus },
  { id: 'lista' as TabType, label: 'Lista', icon: List },
  { id: 'chat' as TabType, label: 'Chat IA', icon: MessageCircle },
  { id: 'planos' as TabType, label: 'Planos', icon: Crown },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-primary/15"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};