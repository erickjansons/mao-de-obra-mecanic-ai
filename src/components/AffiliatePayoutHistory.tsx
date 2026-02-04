import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAffiliatePayouts } from '@/hooks/useAffiliatePayouts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AffiliatePayoutHistoryProps {
  affiliateId: string;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  processing: {
    label: 'Processando',
    icon: Loader2,
    className: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    className: 'bg-success/20 text-success border-success/30',
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  cancelled: {
    label: 'Cancelado',
    icon: AlertCircle,
    className: 'bg-muted text-muted-foreground',
  },
};

export const AffiliatePayoutHistory = ({ affiliateId }: AffiliatePayoutHistoryProps) => {
  const { payouts, loading } = useAffiliatePayouts(affiliateId);

  if (loading) {
    return (
      <Card className="gradient-border">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Histórico de Saques</CardTitle>
        <CardDescription>Acompanhe suas solicitações de saque</CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum saque solicitado</p>
            <p className="text-sm">Solicite um saque quando tiver saldo disponível.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => {
              const config = statusConfig[payout.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">R$ {Number(payout.amount).toFixed(2)}</p>
                      <Badge variant="outline" className={config.className}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${payout.status === 'processing' ? 'animate-spin' : ''}`} />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Solicitado em {format(new Date(payout.requested_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {payout.completed_at && (
                      <p className="text-xs text-success">
                        Pago em {format(new Date(payout.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {payout.admin_notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Obs: {payout.admin_notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{payout.pix_key_type.toUpperCase()}</p>
                    <p className="font-mono truncate max-w-[120px]">{payout.pix_key}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
