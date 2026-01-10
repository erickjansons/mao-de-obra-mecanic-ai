import { BarChart } from 'lucide-react';

interface FilterSummaryProps {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    totalValue: number;
  };
}

export const FilterSummary = ({ stats }: FilterSummaryProps) => {
  return (
    <div className="gradient-border rounded-xl shadow-xl p-4 mb-6 border border-border animate-fade-in-scale">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-pink-500 rounded-lg flex items-center justify-center">
          <BarChart className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold">Resumo dos Resultados</h3>
        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
          {stats.total} serviço{stats.total !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center bg-secondary/50 rounded-lg p-3">
          <p className="text-xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center bg-secondary/50 rounded-lg p-3">
          <p className="text-xl font-bold text-warning">{stats.inProgress}</p>
          <p className="text-xs text-muted-foreground">Em Andamento</p>
        </div>
        <div className="text-center bg-secondary/50 rounded-lg p-3">
          <p className="text-xl font-bold text-success">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Concluídos</p>
        </div>
        <div className="text-center bg-secondary/50 rounded-lg p-3">
          <p className="text-xl font-bold text-accent">R$ {stats.totalValue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Valor Total</p>
        </div>
      </div>
    </div>
  );
};
