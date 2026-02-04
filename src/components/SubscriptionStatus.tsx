import { Clock, Crown, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SubscriptionStatus = () => {
  const { subscription, isPremium, getPlanType } = useSubscription();

  if (!isPremium() || !subscription?.current_period_end) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          Plano Grátis
        </Badge>
      </div>
    );
  }

  const endDate = parseISO(subscription.current_period_end);
  const now = new Date();
  const daysRemaining = differenceInDays(endDate, now);

  const getStatusColor = () => {
    if (daysRemaining <= 0) return 'text-destructive';
    if (daysRemaining <= 3) return 'text-warning';
    return 'text-success';
  };

  const getDaysText = () => {
    if (daysRemaining <= 0) return 'Expirado';
    if (daysRemaining === 1) return '1 dia restante';
    return `${daysRemaining} dias restantes`;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="bg-primary text-xs">
        <Crown className="h-3 w-3 mr-1" />
        Premium
      </Badge>
      <div className={`flex items-center gap-1 text-xs ${getStatusColor()}`}>
        <Clock className="h-3 w-3" />
        <span>{getDaysText()}</span>
      </div>
    </div>
  );
};
