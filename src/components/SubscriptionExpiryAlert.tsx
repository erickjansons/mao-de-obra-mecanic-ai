import { useState } from 'react';
import { Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { parseISO } from 'date-fns';
import { PixPaymentDialog } from './PixPaymentDialog';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionExpiryAlert = () => {
  const { subscription, isPremium, refetch } = useSubscription();
  const [pixDialogOpen, setPixDialogOpen] = useState(false);
  const { toast } = useToast();

  if (!isPremium() || !subscription?.current_period_end) {
    return null;
  }

  const endDate = parseISO(subscription.current_period_end);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));

  // Only show if 3 days or less remaining
  if (daysRemaining > 3) {
    return null;
  }

  const isExpired = daysRemaining < 0;
  const isLastDay = daysRemaining === 0 && hoursRemaining > 0;

  const getMessage = () => {
    if (isExpired) {
      return 'Seu plano expirou! Renove para continuar.';
    }
    if (isLastDay) {
      return `Seu plano expira em ${hoursRemaining} horas!`;
    }
    return `Seu plano expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}!`;
  };

  const handlePaymentSuccess = () => {
    refetch();
    toast({
      title: '🎉 Assinatura renovada!',
      description: 'Sua assinatura foi renovada com sucesso.',
    });
  };

  return (
    <>
      <Card className={`mb-4 border-2 ${isExpired ? 'border-destructive bg-destructive/10' : 'border-warning bg-warning/10'}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Clock className={`h-5 w-5 ${isExpired ? 'text-destructive' : 'text-warning'}`} />
              <div>
                <p className="font-semibold">
                  {getMessage()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isExpired 
                    ? 'Seus recursos premium estão desativados.' 
                    : 'Renove agora para não perder o acesso.'}
                </p>
              </div>
            </div>
            <Button onClick={() => setPixDialogOpen(true)} size="sm" className="bg-primary">
              <Crown className="h-4 w-4 mr-2" />
              Renovar Agora
            </Button>
          </div>
        </CardContent>
      </Card>

      <PixPaymentDialog 
        open={pixDialogOpen} 
        onOpenChange={setPixDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};
