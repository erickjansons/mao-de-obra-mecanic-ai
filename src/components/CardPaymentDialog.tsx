import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CardPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

const MP_PUBLIC_KEY = 'APP_USR-ed63f81e-02c2-446f-9d17-43e3bcf5f46a';

export const CardPaymentDialog = ({ open, onOpenChange, onPaymentSuccess }: CardPaymentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'processing' | 'approved' | 'rejected'>('form');
  const [statusDetail, setStatusDetail] = useState<string>('');
  
  const mpInstanceRef = useRef<any>(null);
  const cardFormRef = useRef<any>(null);
  const mountedRef = useRef(false);
  const { toast } = useToast();

  // Initialize MercadoPago SDK and CardForm
  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    mountedRef.current = true;

    const initCardForm = async () => {
      setInitializing(true);
      
      // Wait for MercadoPago SDK to be available
      let attempts = 0;
      while (!window.MercadoPago && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.MercadoPago || !isMounted) {
        if (isMounted) {
          console.error('MercadoPago SDK not loaded');
          setInitializing(false);
        }
        return;
      }

      try {
        if (!mpInstanceRef.current) {
          mpInstanceRef.current = new window.MercadoPago(MP_PUBLIC_KEY, {
            locale: 'pt-BR',
          });
        }

        // Wait for DOM elements to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isMounted) return;

        // Check if container elements exist
        const cardNumberContainer = document.getElementById('card-number-container');
        if (!cardNumberContainer) {
          console.error('Card number container not found');
          setInitializing(false);
          return;
        }

        // Create CardForm with Secure Fields
        cardFormRef.current = mpInstanceRef.current.cardForm({
          amount: '83.88',
          iframe: true,
          form: {
            id: 'card-payment-form',
            cardNumber: {
              id: 'card-number-container',
              placeholder: 'Número do cartão',
              style: {
                fontSize: '16px',
                fontFamily: 'inherit',
              }
            },
            expirationDate: {
              id: 'expiration-date-container',
              placeholder: 'MM/AA',
              style: {
                fontSize: '16px',
                fontFamily: 'inherit',
              }
            },
            securityCode: {
              id: 'security-code-container',
              placeholder: 'CVV',
              style: {
                fontSize: '16px',
                fontFamily: 'inherit',
              }
            },
            cardholderName: {
              id: 'cardholder-name',
              placeholder: 'Nome como no cartão',
            },
            issuer: {
              id: 'issuer-container',
              placeholder: 'Banco emissor',
            },
            installments: {
              id: 'installments-container',
              placeholder: 'Parcelas',
            },
            identificationType: {
              id: 'identification-type-container',
            },
            identificationNumber: {
              id: 'identification-number',
              placeholder: 'Número do documento',
            },
            cardholderEmail: {
              id: 'cardholder-email',
              placeholder: 'E-mail',
            },
          },
          callbacks: {
            onFormMounted: (error: any) => {
              if (error) {
                console.error('Form mount error:', error);
                if (isMounted) setInitializing(false);
                return;
              }
              console.log('CardForm mounted successfully');
              if (isMounted) setInitializing(false);
            },
            onSubmit: (event: any) => {
              event.preventDefault();
            },
            onFetching: (resource: string) => {
              console.log('Fetching resource:', resource);
            },
          },
        });

      } catch (error) {
        console.error('Error initializing CardForm:', error);
        if (isMounted) setInitializing(false);
      }
    };

    initCardForm();

    return () => {
      isMounted = false;
      mountedRef.current = false;
      if (cardFormRef.current) {
        try {
          cardFormRef.current.unmount();
        } catch (e) {
          // Ignore unmount errors
        }
        cardFormRef.current = null;
      }
    };
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPaymentStatus('form');
      setStatusDetail('');
      setLoading(false);
      setInitializing(true);
    }
  }, [open]);

  const getDeviceId = (): string | null => {
    try {
      if (mpInstanceRef.current?.getDeviceId) {
        return mpInstanceRef.current.getDeviceId();
      }
      if (window.MercadoPago?.deviceProfileId) {
        return window.MercadoPago.deviceProfileId;
      }
      return null;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return null;
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!cardFormRef.current) {
      toast({
        title: 'Erro',
        description: 'Formulário não inicializado. Aguarde o carregamento.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Create token
      const formData = await cardFormRef.current.createCardToken();
      console.log('Card token created:', formData);

      if (!formData?.token) {
        throw new Error('Não foi possível processar os dados do cartão.');
      }

      const deviceId = getDeviceId();
      const cardFormData = cardFormRef.current.getCardFormData();

      const response = await supabase.functions.invoke('create-card-payment', {
        body: {
          token: formData.token,
          payment_method_id: cardFormData.paymentMethodId,
          installments: cardFormData.installments || '12',
          issuer_id: cardFormData.issuerId,
          device_id: deviceId,
          payer_email: cardFormData.cardholderEmail,
          identification_type: cardFormData.identificationType,
          identification_number: cardFormData.identificationNumber,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;

      if (result.status === 'approved') {
        setPaymentStatus('approved');
        toast({
          title: '🎉 Pagamento aprovado!',
          description: 'Sua assinatura anual foi ativada com sucesso.',
        });
        setTimeout(() => {
          onPaymentSuccess();
          onOpenChange(false);
        }, 2500);
      } else if (result.status === 'rejected') {
        setPaymentStatus('rejected');
        setStatusDetail(getStatusDetailMessage(result.status_detail));
      } else if (result.status === 'in_process') {
        toast({
          title: 'Pagamento em análise',
          description: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
        });
        onOpenChange(false);
      } else {
        setPaymentStatus('rejected');
        setStatusDetail(result.message || 'Pagamento não aprovado.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('rejected');
      setStatusDetail(error?.message || 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  }, [toast, onPaymentSuccess, onOpenChange]);

  const getStatusDetailMessage = (detail: string): string => {
    const messages: Record<string, string> = {
      'cc_rejected_bad_filled_card_number': 'Número do cartão inválido.',
      'cc_rejected_bad_filled_date': 'Data de validade inválida.',
      'cc_rejected_bad_filled_other': 'Dados do cartão inválidos.',
      'cc_rejected_bad_filled_security_code': 'Código de segurança inválido.',
      'cc_rejected_blacklist': 'Cartão não pode ser utilizado.',
      'cc_rejected_call_for_authorize': 'Pagamento precisa de autorização. Ligue para a operadora.',
      'cc_rejected_card_disabled': 'Cartão desabilitado. Entre em contato com a operadora.',
      'cc_rejected_card_error': 'Erro no cartão. Tente outro cartão.',
      'cc_rejected_duplicated_payment': 'Pagamento duplicado. Verifique suas transações.',
      'cc_rejected_high_risk': 'Pagamento recusado por segurança.',
      'cc_rejected_insufficient_amount': 'Saldo insuficiente.',
      'cc_rejected_invalid_installments': 'Parcelas inválidas para este cartão.',
      'cc_rejected_max_attempts': 'Limite de tentativas atingido. Tente novamente mais tarde.',
      'cc_rejected_other_reason': 'Pagamento recusado. Tente outro cartão.',
    };
    return messages[detail] || 'Pagamento recusado. Verifique os dados e tente novamente.';
  };

  const handleRetry = () => {
    setPaymentStatus('form');
    setStatusDetail('');
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
            Pagamento com Cartão
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {paymentStatus === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Processando pagamento...</p>
            </motion.div>
          )}

          {paymentStatus === 'approved' && (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-green-600">Pagamento Aprovado!</h3>
              <p className="text-muted-foreground text-center">
                Sua assinatura anual foi ativada com sucesso.
              </p>
            </motion.div>
          )}

          {paymentStatus === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 gap-4"
            >
              <XCircle className="h-16 w-16 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Pagamento Recusado</h3>
              <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-3 max-w-sm">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{statusDetail}</p>
              </div>
              <Button onClick={handleRetry} variant="outline" className="mt-2">
                Tentar Novamente
              </Button>
            </motion.div>
          )}

          {paymentStatus === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Price Info */}
              <div className="text-center mb-6 p-4 bg-primary/5 rounded-lg">
                <p className="text-3xl font-bold text-primary">12x R$ 6,99</p>
                <p className="text-sm text-muted-foreground">Total: R$ 83,88 - Plano Anual</p>
              </div>

              {initializing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando formulário seguro...</span>
                </div>
              )}

              <form id="card-payment-form" onSubmit={handleSubmit} className={initializing ? 'hidden' : ''}>
                <div className="space-y-4">
                  {/* Card Number - Secure Field */}
                  <div className="space-y-2">
                    <Label>Número do Cartão</Label>
                    <div 
                      id="card-number-container" 
                      className="h-12 border rounded-md bg-background px-3 flex items-center"
                    />
                  </div>

                  {/* Expiration and CVV Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <div 
                        id="expiration-date-container" 
                        className="h-12 border rounded-md bg-background px-3 flex items-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <div 
                        id="security-code-container" 
                        className="h-12 border rounded-md bg-background px-3 flex items-center"
                      />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Nome no Cartão</Label>
                    <Input 
                      id="cardholder-name" 
                      type="text"
                      placeholder="Nome como impresso no cartão"
                      className="uppercase"
                    />
                  </div>

                  {/* Issuer - Hidden, auto-detected */}
                  <div id="issuer-container" className="hidden" />

                  {/* Installments */}
                  <div className="space-y-2">
                    <Label>Parcelas</Label>
                    <select 
                      id="installments-container" 
                      className="w-full h-12 border rounded-md bg-background px-3 text-sm"
                    >
                      <option value="12">12x de R$ 6,99 (sem juros)</option>
                    </select>
                  </div>

                  {/* Document */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Documento</Label>
                      <select 
                        id="identification-type-container" 
                        className="w-full h-12 border rounded-md bg-background px-3 text-sm"
                      >
                        <option value="CPF">CPF</option>
                        <option value="CNPJ">CNPJ</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="identification-number">Número</Label>
                      <Input 
                        id="identification-number" 
                        type="text"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="cardholder-email">E-mail</Label>
                    <Input 
                      id="cardholder-email" 
                      type="email"
                      placeholder="seu@email.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white font-semibold py-5"
                    disabled={loading || initializing}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagar R$ 83,88
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  🔒 Pagamento seguro processado por Mercado Pago
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
