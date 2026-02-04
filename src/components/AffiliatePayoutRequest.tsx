import { useState } from 'react';
import { Wallet, AlertCircle, Banknote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAffiliatePayouts } from '@/hooks/useAffiliatePayouts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliatePayoutRequestProps {
  affiliateId: string;
  pendingEarnings: number;
  pixKey?: string | null;
  pixKeyType?: string | null;
  onPixKeySaved?: () => void;
}

const MIN_PAYOUT_AMOUNT = 10; // Minimum R$ 10 to request payout

export const AffiliatePayoutRequest = ({
  affiliateId,
  pendingEarnings,
  pixKey: savedPixKey,
  pixKeyType: savedPixKeyType,
  onPixKeySaved,
}: AffiliatePayoutRequestProps) => {
  const { toast } = useToast();
  const { requestPayout, requesting, stats } = useAffiliatePayouts(affiliateId);
  
  const [pixKey, setPixKey] = useState(savedPixKey || '');
  const [pixKeyType, setPixKeyType] = useState(savedPixKeyType || '');
  const [amount, setAmount] = useState('');
  const [savingPixKey, setSavingPixKey] = useState(false);

  const handleSavePixKey = async () => {
    if (!pixKey || !pixKeyType) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha a chave PIX e o tipo.',
        variant: 'destructive',
      });
      return;
    }

    setSavingPixKey(true);
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ pix_key: pixKey, pix_key_type: pixKeyType })
        .eq('id', affiliateId);

      if (error) throw error;

      toast({
        title: 'Chave PIX salva!',
        description: 'Sua chave PIX foi salva com sucesso.',
      });
      onPixKeySaved?.();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a chave PIX.',
        variant: 'destructive',
      });
    } finally {
      setSavingPixKey(false);
    }
  };

  const handleRequestPayout = async () => {
    const requestAmount = parseFloat(amount);
    
    if (!requestAmount || requestAmount < MIN_PAYOUT_AMOUNT) {
      toast({
        title: 'Valor mínimo',
        description: `O valor mínimo para saque é R$ ${MIN_PAYOUT_AMOUNT.toFixed(2)}.`,
        variant: 'destructive',
      });
      return;
    }

    if (requestAmount > pendingEarnings) {
      toast({
        title: 'Saldo insuficiente',
        description: 'Você não tem saldo suficiente para este saque.',
        variant: 'destructive',
      });
      return;
    }

    if (!savedPixKey || !savedPixKeyType) {
      toast({
        title: 'Chave PIX necessária',
        description: 'Salve sua chave PIX antes de solicitar o saque.',
        variant: 'destructive',
      });
      return;
    }

    const result = await requestPayout({
      amount: requestAmount,
      pixKey: savedPixKey,
      pixKeyType: savedPixKeyType,
    });

    if (result.success) {
      setAmount('');
    }
  };

  const canRequestPayout = pendingEarnings >= MIN_PAYOUT_AMOUNT && savedPixKey && !stats.hasPendingRequest;

  return (
    <Card className="gradient-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Solicitar Saque
        </CardTitle>
        <CardDescription>
          Solicite o saque dos seus ganhos via PIX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PIX Key Section */}
        <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
          <Label className="text-sm font-medium">Sua Chave PIX</Label>
          
          <div className="grid grid-cols-3 gap-2">
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Aleatória</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              className="col-span-2"
              placeholder="Sua chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
          </div>

          {(!savedPixKey || pixKey !== savedPixKey || pixKeyType !== savedPixKeyType) && (
            <Button 
              onClick={handleSavePixKey} 
              disabled={savingPixKey || !pixKey || !pixKeyType}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {savingPixKey ? 'Salvando...' : 'Salvar Chave PIX'}
            </Button>
          )}
        </div>

        {/* Balance Info */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
            <p className="text-xl font-bold text-primary">R$ {pendingEarnings.toFixed(2)}</p>
          </div>
          <Banknote className="w-8 h-8 text-primary/50" />
        </div>

        {/* Payout Request */}
        {stats.hasPendingRequest ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você já tem uma solicitação de saque pendente. Aguarde a conclusão para solicitar um novo.
            </AlertDescription>
          </Alert>
        ) : pendingEarnings < MIN_PAYOUT_AMOUNT ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa de pelo menos R$ {MIN_PAYOUT_AMOUNT.toFixed(2)} para solicitar um saque.
            </AlertDescription>
          </Alert>
        ) : !savedPixKey ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Salve sua chave PIX acima para solicitar saques.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Valor do saque"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={MIN_PAYOUT_AMOUNT}
                  max={pendingEarnings}
                  step="0.01"
                />
              </div>
              <Button
                onClick={() => setAmount(pendingEarnings.toString())}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Sacar tudo
              </Button>
            </div>
            
            <Button
              onClick={handleRequestPayout}
              disabled={requesting || !canRequestPayout}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {requesting ? 'Solicitando...' : 'Solicitar Saque'}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Saques são processados em até 3 dias úteis após a solicitação.
        </p>
      </CardContent>
    </Card>
  );
};
