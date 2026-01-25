import { useState } from 'react';
import { Check, Crown, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PixPaymentDialog } from './PixPaymentDialog';

export const PricingPlans = () => {
  const { getPlanType, isPremium, refetch } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [pixDialogOpen, setPixDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentPlan = getPlanType();

  const handleSubscribe = (planKey: 'monthly') => {
    setPixDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    refetch();
    toast({
      title: '🎉 Assinatura ativada!',
      description: 'Agora você tem acesso ilimitado aos serviços.',
    });
  };

  const plans = [
    {
      name: 'Grátis',
      key: 'free' as const,
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
      gradient: 'from-slate-500 to-slate-600',
      bgGradient: 'from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50',
      hasPlan: false,
    },
    {
      name: 'Mensal',
      key: 'monthly' as const,
      price: 'R$ 10,99',
      period: '',
      description: 'Pagamento único via PIX - 30 dias',
      features: [
        'Serviços ilimitados',
        'Geração de PDF',
        'Envio via WhatsApp',
        'Suporte prioritário',
      ],
      icon: Crown,
      popular: true,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
      hasPlan: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring' as const,
        stiffness: 100,
      },
    }),
  };

  return (
    <div className="py-6">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 mb-4"
          animate={{ 
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Escolha seu Plano</h2>
          <Sparkles className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-muted-foreground">
          {isPremium() 
            ? 'Você já é assinante! Gerencie sua assinatura abaixo.' 
            : 'Comece grátis e faça upgrade quando precisar.'}
        </p>
      </motion.div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {plans.map((plan, planIndex) => {
          const isCurrentPlan = currentPlan === plan.key;
          const Icon = plan.icon;
          const isHovered = hoveredPlan === plan.key;

          return (
            <motion.div
              key={plan.key}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300 }
              }}
              onHoverStart={() => setHoveredPlan(plan.key)}
              onHoverEnd={() => setHoveredPlan(null)}
            >
              <Card 
                className={`relative overflow-hidden h-full transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-xl shadow-primary/20' 
                    : 'border hover:border-primary/50'
                } ${isCurrentPlan ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
              >
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-0 pointer-events-none`}
                  animate={{ opacity: isHovered ? 0.5 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Shimmer effect for popular plan */}
                {plan.popular && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: 'linear',
                    }}
                  />
                )}

                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + planIndex * 0.1, type: 'spring' }}
                  >
                    <Badge className={`absolute -top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.gradient} text-white px-4 py-1 rounded-b-lg rounded-t-none`}>
                      ⭐ Mais Popular
                    </Badge>
                  </motion.div>
                )}
                {isCurrentPlan && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Badge className="absolute -top-0 right-4 bg-green-600 text-white px-3 py-1 rounded-b-lg rounded-t-none">
                      ✓ Plano Atual
                    </Badge>
                  </motion.div>
                )}
                
                <CardHeader className="text-center pb-2 pt-6 relative z-10">
                  <motion.div 
                    className={`mx-auto mb-3 p-3 rounded-full bg-gradient-to-br ${plan.gradient} w-fit shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center pb-4 relative z-10">
                  <motion.div 
                    className="mb-5"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + planIndex * 0.1 }}
                  >
                    <span className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  </motion.div>
                  
                  <ul className="space-y-3 text-sm text-left">
                    {plan.features.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-center gap-2"
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={featureVariants}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className={`h-5 w-5 flex-shrink-0 bg-gradient-to-r ${plan.gradient} rounded-full p-0.5 text-white`} />
                        </motion.div>
                        <span className="font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="relative z-10 pb-6">
                {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : plan.hasPlan ? (
                    <motion.div 
                      className="w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-semibold py-5 shadow-lg transition-all duration-300`}
                        onClick={() => handleSubscribe(plan.key as 'monthly')}
                        disabled={loadingPlan === plan.key}
                      >
                        {loadingPlan === plan.key ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Carregando...
                          </motion.span>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Assinar Agora
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <Button variant="outline" className="w-full py-5" disabled>
                      Plano Gratuito
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <PixPaymentDialog 
        open={pixDialogOpen} 
        onOpenChange={setPixDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
