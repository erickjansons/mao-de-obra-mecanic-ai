import { ClipboardList, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RecentServices } from './RecentServices';
import { Service } from '@/types/service';

interface DashboardProps {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    totalValue: number;
  };
  services: Service[];
}

const formatCurrency = (value: number) => {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const Dashboard = ({ stats, services }: DashboardProps) => {
  const recentServices = [...services].slice(-5).reverse();

  return (
    <div className="animate-slide-up">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatsCard
          icon={ClipboardList}
          value={stats.total}
          label="Total Serviços"
          colorClass="text-primary"
          iconBgClass="bg-gradient-to-br from-primary to-primary/80"
          delay={0}
        />
        <StatsCard
          icon={Clock}
          value={stats.inProgress}
          label="Em Andamento"
          colorClass="text-warning"
          iconBgClass="bg-gradient-to-br from-warning to-orange-500"
          delay={100}
        />
        <StatsCard
          icon={CheckCircle}
          value={stats.completed}
          label="Concluídos"
          colorClass="text-success"
          iconBgClass="bg-gradient-to-br from-success to-emerald-500"
          delay={200}
        />
        <StatsCard
          icon={DollarSign}
          value={formatCurrency(stats.totalValue)}
          label="Valor Total"
          colorClass="text-accent"
          iconBgClass="bg-gradient-to-br from-accent to-pink-500"
          delay={300}
        />
      </div>

      <RecentServices services={recentServices} />
    </div>
  );
};
