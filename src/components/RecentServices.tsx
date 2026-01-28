import { Clock, ClipboardList } from 'lucide-react';
import { Service } from '@/types/service';
import { cn } from '@/lib/utils';

interface RecentServicesProps {
  services: Service[];
}

export const RecentServices = ({ services }: RecentServicesProps) => {
  return (
    <div className="gradient-border rounded-xl shadow-xl border border-border animate-fade-in-scale">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-pink-500 rounded-lg flex items-center justify-center animate-float">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Serviços Recentes</h3>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {services.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <div className="w-16 h-16 bg-gradient-to-br from-muted to-secondary rounded-full mx-auto mb-4 flex items-center justify-center animate-float">
              <ClipboardList className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium mb-1">Nenhum serviço cadastrado</p>
            <p className="text-xs text-muted-foreground">Comece adicionando seu primeiro serviço</p>
          </div>
        ) : (
          services.map((service, index) => (
            <div 
              key={service.id} 
              className="px-4 py-3 hover-lift animate-fade-in-scale"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold truncate">{service.cliente || 'Cliente não informado'}</h4>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0",
                      service.status === 'Concluído'
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    )}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {service.servico || 'Serviço não informado'} - <span className="font-semibold text-foreground">{service.veiculo || 'Veículo não informado'}</span> {service.placa ? `(${service.placa})` : ''}
                  </p>
                  <p className="text-xs text-success mt-1 font-medium">
                    R$ {(service.valor_mao_obra || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
