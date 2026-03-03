import { LayoutDashboard, PlusCircle, ClipboardList, Crown, MessageCircleMore } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type TabType = 'dashboard' | 'novo' | 'lista' | 'planos' | 'afiliados' | 'chat';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'dashboard' as TabType, label: 'Painel', icon: LayoutDashboard },
  { id: 'novo' as TabType, label: 'Novo Serviço', icon: PlusCircle },
  { id: 'lista' as TabType, label: 'Lista', icon: ClipboardList },
  { id: 'chat' as TabType, label: 'Chat IA', icon: MessageCircleMore },
  { id: 'planos' as TabType, label: 'Planos', icon: Crown },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div key={tab.id} className="flex items-center flex-1">
              {index > 0 && (
                <div className="w-px h-8 bg-border/40 shrink-0" />
              )}
              <button
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1 py-1.5 w-full transition-colors duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 mx-2 rounded-2xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  className={cn(
                    "relative z-10 p-1.5 rounded-xl transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.div>
                <span className={cn(
                  "relative z-10 text-[10px] font-medium leading-none transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};