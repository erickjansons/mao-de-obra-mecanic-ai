import { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TokenRedemptionProps {
  onSuccess: () => void;
}

export const TokenRedemption = ({ onSuccess }: TokenRedemptionProps) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!token.trim()) {
      toast({
        title: 'Token inválido',
        description: 'Por favor, insira um token válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-token', {
        body: { token: token.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: 'Erro',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso!',
        description: data.message || 'Plano PRO ativado com sucesso!',
      });

      setToken('');
      onSuccess();
    } catch (error: any) {
      console.error('Error redeeming token:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao resgatar token. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Tem um código de resgate?
        </CardTitle>
        <CardDescription>
          Insira seu código para ativar o plano PRO gratuitamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Digite seu código"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isLoading}
            maxLength={10}
            className="flex-1"
          />
          <Button onClick={handleRedeem} disabled={isLoading || !token.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Resgatar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
