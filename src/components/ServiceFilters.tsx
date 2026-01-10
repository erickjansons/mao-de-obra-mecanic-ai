import { Search, Calendar, CheckCircle, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  availableMonths: string[];
}

const getMonthName = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

export const ServiceFilters = ({
  searchTerm,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  availableMonths,
}: ServiceFiltersProps) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Search Bar */}
      <div className="gradient-border rounded-xl shadow-xl p-3 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Search className="w-3 h-3 text-white" />
          </div>
          <label className="block text-sm font-medium text-muted-foreground">Pesquisar Serviços</label>
        </div>
        <div className="relative">
          <Input
            placeholder="Pesquisar por cliente, veículo, placa ou serviço..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Month Filter */}
        <div className="gradient-border rounded-xl shadow-xl p-3 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-warning to-orange-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
            <label className="block text-sm font-medium text-muted-foreground">Filtrar por Mês</label>
          </div>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="gradient-border rounded-xl shadow-xl p-3 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-success to-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <label className="block text-sm font-medium text-muted-foreground">Filtrar por Status</label>
          </div>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="secondary"
        onClick={onClearFilters}
        className="w-full button-glow"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );
};
