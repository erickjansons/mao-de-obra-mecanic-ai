import { Users, Crown, User, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { UserDetail } from '@/hooks/useAdminDashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  total: number;
  premium: number;
  free: number;
  renewed: number;
  details: UserDetail[];
}

export const AdminUsersCard = ({ total, premium, free, renewed, details }: Props) => {
  const pieData = [
    { name: 'Premium', value: premium },
    { name: 'Gratuito', value: free },
  ];

  const COLORS = ['hsl(160 84% 39%)', 'hsl(215 28% 25%)'];

  const paidUsers = details
    .filter((u) => u.plan_type !== 'free' && u.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <Crown className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-warning">{premium}</p>
            <p className="text-xs text-muted-foreground">Premium</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <User className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-xl font-bold">{free}</p>
            <p className="text-xs text-muted-foreground">Gratuito</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <RefreshCw className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-primary">{renewed}</p>
            <p className="text-xs text-muted-foreground">Renovados</p>
          </CardContent>
        </Card>
      </div>

      {total > 0 && (
        <Card className="gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(217 33% 17%)',
                    border: '1px solid hsl(215 28% 25%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 98%)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Paid Users Table */}
      {paidUsers.length > 0 && (
        <Card className="gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-4 h-4 text-warning" />
              Usuários Pagos ({paidUsers.length})
            </CardTitle>
            <CardDescription>Todos os usuários com plano ativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-sm truncate max-w-[150px]">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-success">
                          {user.plan_type === 'monthly' ? 'Mensal' : user.plan_type === 'annual' ? 'Anual' : 'Premium'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.current_period_start
                          ? format(new Date(user.current_period_start), 'dd/MM/yy', { locale: ptBR })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.current_period_end
                          ? format(new Date(user.current_period_end), 'dd/MM/yy', { locale: ptBR })
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Últimos Usuários</CardTitle>
          <CardDescription>Cadastros mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 20)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-sm truncate max-w-[150px]">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.plan_type !== 'free' ? 'default' : 'secondary'}
                          className={user.plan_type !== 'free' ? 'bg-success' : ''}
                        >
                          {user.plan_type === 'free' ? 'Gratuito' : 'Premium'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.current_period_start
                          ? format(new Date(user.current_period_start), 'dd/MM/yy', { locale: ptBR })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.current_period_end
                          ? format(new Date(user.current_period_end), 'dd/MM/yy', { locale: ptBR })
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
