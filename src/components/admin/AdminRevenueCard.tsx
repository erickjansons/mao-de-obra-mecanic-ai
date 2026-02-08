import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  monthlyRevenue: number;
  totalPaidSubscriptions: number;
  revenueByMonth: Record<string, number>;
}

export const AdminRevenueCard = ({ monthlyRevenue, totalPaidSubscriptions, revenueByMonth }: Props) => {
  const chartData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({
      month: month.substring(5), // MM only
      valor: Number(value.toFixed(2)),
    }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-emerald-500 mx-auto mb-2 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-success">
              R$ {monthlyRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Receita Mensal</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 mx-auto mb-2 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-primary">{totalPaidSubscriptions}</p>
            <p className="text-xs text-muted-foreground">Assinaturas Ativas</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Receita por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="hsl(215 20% 65%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(217 33% 17%)',
                    border: '1px solid hsl(215 28% 25%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 98%)',
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                />
                <Bar dataKey="valor" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
