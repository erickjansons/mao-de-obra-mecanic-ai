import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradePromptProps {
  currentCount: number;
  limit: number;
  onUpgrade: () => void;
}

export const UpgradePrompt = ({ currentCount, limit, onUpgrade }: UpgradePromptProps) => {
  const remaining = limit - currentCount;
  const isAtLimit = remaining <= 0;

  if (!isAtLimit && remaining > 2) {
    return null;
  }

  return (
    <Card className={`mb-4 ${isAtLimit ? 'border-destructive bg-destructive/5' : 'border-warning bg-warning/5'}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Crown className={`h-5 w-5 ${isAtLimit ? 'text-destructive' : 'text-warning'}`} />
            <div>
              <p className="font-medium">
                {isAtLimit 
                  ? 'Limite de serviços atingido!' 
                  : `Você tem apenas ${remaining} ${remaining === 1 ? 'serviço restante' : 'serviços restantes'}!`}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAtLimit 
                  ? 'Faça upgrade para adicionar mais serviços.' 
                  : 'Considere fazer upgrade para serviços ilimitados.'}
              </p>
            </div>
          </div>
          <Button onClick={onUpgrade} size="sm" className="bg-primary">
            <Crown className="h-4 w-4 mr-2" />
            Ver Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
