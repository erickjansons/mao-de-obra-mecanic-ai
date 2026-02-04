import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Clock, Loader2, QrCode, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PixPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

interface PixData {
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
  expiration_date: string;
  status: string;
}

const MP_PUBLIC_KEY = 'APP_USR-ed63f81e-02c2-446f-9d17-43e3bcf5f46a';

export const PixPaymentDialog = ({ open, onOpenChange, onPaymentSuccess }: PixPaymentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const mpInstanceRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize MercadoPago SDK and get device_id
  useEffect(() => {
    if (open && window.MercadoPago && !mpInstanceRef.current) {
      try {
        mpInstanceRef.current = new window.MercadoPago(MP_PUBLIC_KEY, {
          locale: 'pt-BR',
        });
        console.log('MercadoPago SDK initialized with device fingerprint');
      } catch (error) {
        console.error('Error initializing MercadoPago SDK:', error);
      }
    }
  }, [open]);

  const getDeviceId = (): string | null => {
    try {
      // Get device_id from MercadoPago SDK
      if (mpInstanceRef.current?.getDeviceId) {
        return mpInstanceRef.current.getDeviceId();
      }
      // Fallback: try to get from global MP object
      if (window.MercadoPago?.deviceProfileId) {
        return window.MercadoPago.deviceProfileId;
      }
      return null;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return null;
    }
  };

  const createPixPayment = useCallback(async () => {
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      console.log('Device ID for payment:', deviceId);

      const response = await supabase.functions.invoke('create-pix-payment', {
        body: { device_id: deviceId },
      });
      
      if (response.error) {
        throw response.error;
      }

      setPixData(response.data);
      setPaymentStatus('pending');
    } catch (error: any) {
      console.error('Error creating PIX payment:', error);
      toast({
        title: 'Erro ao gerar PIX',
        description: error?.message || 'Não foi possível gerar o pagamento PIX. Tente novamente.',
        variant: 'destructive',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [toast, onOpenChange]);

  const checkPaymentStatus = useCallback(async () => {
    if (!pixData?.payment_id || paymentStatus === 'approved') return;

    setCheckingStatus(true);
    try {
      const response = await supabase.functions.invoke('check-pix-payment', {
        body: { payment_id: pixData.payment_id },
      });

      if (response.data?.status === 'approved') {
        setPaymentStatus('approved');
        toast({
          title: '🎉 Pagamento confirmado!',
          description: 'Sua assinatura foi ativada com sucesso.',
        });
        setTimeout(() => {
          onPaymentSuccess();
          onOpenChange(false);
        }, 2000);
      } else if (response.data?.status === 'rejected' || response.data?.status === 'cancelled') {
        setPaymentStatus('rejected');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  }, [pixData?.payment_id, paymentStatus, toast, onPaymentSuccess, onOpenChange]);

  // Create PIX payment when dialog opens
  useEffect(() => {
    if (open && !pixData && !loading) {
      createPixPayment();
    }
  }, [open, pixData, loading, createPixPayment]);

  // Poll for payment status every 5 seconds
  useEffect(() => {
    if (!open || !pixData || paymentStatus !== 'pending') return;

    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [open, pixData, paymentStatus, checkPaymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (!pixData?.expiration_date || paymentStatus !== 'pending') return;

    const updateTimer = () => {
      const expDate = new Date(pixData.expiration_date);
      const now = new Date();
      const diffMs = expDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ minutes, seconds });
    };

    updateTimer(); // Run immediately
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pixData?.expiration_date, paymentStatus]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPixData(null);
      setPaymentStatus('pending');
      setCopied(false);
      setTimeLeft(null);
    }
  }, [open]);

  const handleCopyCode = async () => {
    if (!pixData?.qr_code) return;
    
    try {
      await navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Cole no seu app de pagamentos.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive',
      });
    }
  };

  const formatTime = () => {
    if (!timeLeft) return '--:--';
    // Limit display to 15 minutes max
    const totalSeconds = Math.min(timeLeft.minutes * 60 + timeLeft.seconds, 15 * 60);
    const displayMins = Math.floor(totalSeconds / 60);
    const displaySecs = totalSeconds % 60;
    const mins = String(displayMins).padStart(2, '0');
    const secs = String(displaySecs).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const isExpired = timeLeft?.minutes === 0 && timeLeft?.seconds === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Gerando código PIX...</p>
            </motion.div>
          )}

          {!loading && paymentStatus === 'approved' && (
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
              <h3 className="text-xl font-semibold text-green-600">Pagamento Confirmado!</h3>
              <p className="text-muted-foreground text-center">
                Sua assinatura mensal foi ativada com sucesso.
              </p>
            </motion.div>
          )}

          {!loading && paymentStatus === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <XCircle className="h-20 w-20 text-destructive" />
              <h3 className="text-xl font-semibold text-destructive">Pagamento Recusado</h3>
              <p className="text-muted-foreground text-center">
                O pagamento não foi aprovado. Tente novamente.
              </p>
              <Button onClick={createPixPayment} variant="outline">
                Tentar Novamente
              </Button>
            </motion.div>
          )}

          {!loading && pixData && paymentStatus === 'pending' && (
            <motion.div
              key="pix"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-4"
            >
              {/* QR Code */}
              <div className="relative">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src={`data:image/png;base64,${pixData.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
                {checkingStatus && (
                  <div className="absolute -top-2 -right-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">R$ 9,99</p>
                <p className="text-sm text-muted-foreground">Plano Mensal (30 dias)</p>
              </div>

              {/* Copy Button */}
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="w-full gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar Código PIX
                  </>
                )}
              </Button>

              {/* Countdown Timer */}
              <div className={`flex items-center gap-2 text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                <Clock className="h-4 w-4" />
                <span>
                  {isExpired ? 'Código expirado' : `Expira em ${formatTime()}`}
                </span>
              </div>

              {/* Expired State */}
              {isExpired && (
                <Button onClick={createPixPayment} variant="outline" size="sm">
                  Gerar novo código
                </Button>
              )}

              {/* Status Info */}
              {!isExpired && (
                <div className="bg-muted/50 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-yellow-500"
                    />
                    <span className="text-muted-foreground">
                      Aguardando pagamento...
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Após o pagamento, a confirmação é automática.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
