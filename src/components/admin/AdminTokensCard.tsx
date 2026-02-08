import { Ticket, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  total: number;
  used: number;
  available: number;
}

export const AdminTokensCard = ({ total, used, available }: Props) => {
  const usagePercent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <Ticket className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-success">{used}</p>
            <p className="text-xs text-muted-foreground">Usados</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-warning">{available}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Taxa de Uso</p>
            <p className="text-sm font-bold text-primary">{usagePercent}%</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {used} de {total} tokens utilizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
