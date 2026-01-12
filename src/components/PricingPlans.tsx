import { useState } from 'react';
import { Check, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PLAN_PRICES } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

export const PricingPlans = () => {
  const { getPlanType, createCheckout, openPortal, isPremium } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const currentPlan = getPlanType();

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    try {
      const url = await createCheckout(priceId);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o checkout. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan('manage');
    try {
      const url = await openPortal();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Grátis',
      key: 'free',
      price: 'R$ 0',
      period: '/sempre',
      description: 'Ideal para começar',
      features: [
        'Até 8 serviços',
        'Geração de PDF',
        'Envio via WhatsApp',
      ],
      icon: Zap,
      popular: false,
    },
    {
      name: 'Mensal',
      key: 'monthly',
      price: 'R$ 18,90',
      period: '/mês',
      description: 'Para profissionais',
      features: [
        'Serviços ilimitados',
        'Geração de PDF',
        'Envio via WhatsApp',
        'Suporte prioritário',
      ],
      icon: Crown,
      popular: false,
      priceId: PLAN_PRICES.monthly.id,
    },
    {
      name: 'Anual',
      key: 'annual',
      price: 'R$ 10,90',
      period: '/mês',
      annualTotal: 'R$ 130,80/ano',
      description: 'Melhor custo-benefício',
      features: [
        'Serviços ilimitados',
        'Geração de PDF',
        'Envio via WhatsApp',
        'Suporte prioritário',
        'Economia de 42%',
      ],
      icon: Crown,
      popular: true,
      priceId: PLAN_PRICES.annual.id,
    },
  ];

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha seu Plano</h2>
        <p className="text-muted-foreground">
          {isPremium() 
            ? 'Você já é assinante! Gerencie sua assinatura abaixo.' 
            : 'Comece grátis e faça upgrade quando precisar.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key;
          const Icon = plan.icon;

          return (
            <Card 
              key={plan.key} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge className="absolute -top-2 right-4 bg-green-600">
                  Plano Atual
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 p-2 rounded-full bg-primary/10 w-fit">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pb-4">
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  {plan.annualTotal && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.annualTotal}</p>
                  )}
                </div>
                
                <ul className="space-y-2 text-sm text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {isCurrentPlan ? (
                  plan.key === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleManageSubscription}
                      disabled={loadingPlan === 'manage'}
                    >
                      {loadingPlan === 'manage' ? 'Carregando...' : 'Gerenciar Assinatura'}
                    </Button>
                  )
                ) : plan.priceId ? (
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    onClick={() => handleSubscribe(plan.priceId!, plan.key)}
                    disabled={loadingPlan === plan.key}
                  >
                    {loadingPlan === plan.key ? 'Carregando...' : 'Assinar Agora'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Gratuito
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {isPremium() && (
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={handleManageSubscription}
            disabled={loadingPlan === 'manage'}
          >
            {loadingPlan === 'manage' ? 'Carregando...' : 'Gerenciar Assinatura'}
          </Button>
        </div>
      )}
    </div>
  );
};
