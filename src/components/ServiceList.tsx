import { useState } from 'react';
import { List, ClipboardList, ArrowDown, ArrowUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service, SortBy, SortOrder } from '@/types/service';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from './ServiceFilters';
import { FilterSummary } from './FilterSummary';
import { shareMonthlyServicesOnWhatsApp } from '@/utils/pdfGenerator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ServiceListProps {
  services: Service[];
  filteredServices: Service[];
  onToggleStatus: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Service>) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  availableMonths: string[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  onToggleSort: (sortBy: SortBy) => void;
  filteredStats: {
    total: number;
    inProgress: number;
    completed: number;
    totalValue: number;
  };
  onSwitchToNew: () => void;
}

export const ServiceList = ({
  services,
  filteredServices,
  onToggleStatus,
  onUpdate,
  onDelete,
  searchTerm,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  availableMonths,
  sortBy,
  sortOrder,
  onToggleSort,
  filteredStats,
  onSwitchToNew,
}: ServiceListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const hasFilters = searchTerm || selectedMonth || selectedStatus;

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleSendAllWhatsApp = () => {
    shareMonthlyServicesOnWhatsApp(filteredServices, selectedMonth || 'Todos');
  };

  const SortIcon = sortOrder === 'desc' ? ArrowDown : ArrowUp;

  return (
    <div className="animate-slide-up">
      <ServiceFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedMonth={selectedMonth}
        onMonthChange={(v) => onMonthChange(v === 'all' ? '' : v)}
        selectedStatus={selectedStatus}
        onStatusChange={(v) => onStatusChange(v === 'all' ? '' : v)}
        onClearFilters={onClearFilters}
        availableMonths={availableMonths}
      />

      {hasFilters && (
        <FilterSummary stats={filteredStats} />
      )}

      <div className="gradient-border rounded-xl shadow-xl border border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-accent rounded-lg flex items-center justify-center">
                <List className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Lista de Serviços</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleSort('date')}
                className={sortBy === 'date' ? 'ring-2 ring-primary' : ''}
              >
                Data {sortBy === 'date' && <SortIcon className="w-3 h-3 ml-1" />}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleSort('value')}
                className={sortBy === 'value' ? 'ring-2 ring-primary' : ''}
              >
                Valor {sortBy === 'value' && <SortIcon className="w-3 h-3 ml-1" />}
              </Button>
              {filteredServices.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleSendAllWhatsApp}
                  className="bg-success hover:bg-success/80"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar Todos
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        {filteredServices.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <div className="w-16 h-16 bg-gradient-to-br from-muted to-secondary rounded-full mx-auto mb-4 flex items-center justify-center animate-float">
              <ClipboardList className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium mb-2">Nenhum serviço encontrado</p>
            <p className="text-sm text-muted-foreground mb-4">Ajuste os filtros ou adicione novos serviços</p>
            <Button onClick={onSwitchToNew} className="bg-gradient-to-r from-primary to-primary/80">
              Adicionar Primeiro Serviço
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredServices.map((service, index) => (
              <div key={service.id} style={{ animationDelay: `${index * 50}ms` }}>
                <ServiceCard
                  service={service}
                  onToggleStatus={onToggleStatus}
                  onUpdate={onUpdate}
                  onDelete={(id) => setDeleteId(id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};