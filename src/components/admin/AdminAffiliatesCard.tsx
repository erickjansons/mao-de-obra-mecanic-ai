import { Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AffiliateDetail } from '@/hooks/useAdminDashboard';

interface Props {
  total: number;
  active: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalReferrals: number;
  convertedReferrals: number;
  pendingReferrals: number;
  details: AffiliateDetail[];
}

export const AdminAffiliatesCard = ({
  total,
  active,
  totalEarnings,
  pendingEarnings,
  paidEarnings,
  totalReferrals,
  convertedReferrals,
  pendingReferrals,
  details,
}: Props) => {
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Afiliados ({active} ativos)</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-success">{convertedReferrals}/{totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Convertidas/Total</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-warning">R$ {pendingEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">A pagar</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-accent">R$ {paidEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Já pago</p>
          </CardContent>
        </Card>
      </div>

      {/* Total earnings */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total em comissões</p>
              <p className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Indicações pendentes</p>
              <p className="text-lg font-bold text-warning">{pendingReferrals}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Details Table */}
      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detalhes dos Afiliados</CardTitle>
          <CardDescription>Performance individual de cada afiliado</CardDescription>
        </CardHeader>
        <CardContent>
          {details.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Nenhum afiliado ainda</p>
          ) : (
            <div className="space-y-3">
              {details
                .sort((a, b) => b.total_earnings - a.total_earnings)
                .map((affiliate) => (
                  <Card key={affiliate.id} className="bg-secondary/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="truncate max-w-[60%]">
                          <p className="text-sm font-semibold truncate">{affiliate.email}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {affiliate.referral_code}
                          </p>
                        </div>
                        <Badge variant={affiliate.is_active ? 'default' : 'secondary'}>
                          {affiliate.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div>
                          <p className="font-bold text-primary">{affiliate.total_referrals}</p>
                          <p className="text-muted-foreground">Indicações</p>
                        </div>
                        <div>
                          <p className="font-bold text-success">{affiliate.converted_referrals}</p>
                          <p className="text-muted-foreground">Convertidas</p>
                        </div>
                        <div>
                          <p className="font-bold text-warning">R$ {affiliate.pending_earnings.toFixed(2)}</p>
                          <p className="text-muted-foreground">Saldo</p>
                        </div>
                        <div>
                          <p className="font-bold text-accent">R$ {affiliate.paid_earnings.toFixed(2)}</p>
                          <p className="text-muted-foreground">Pago</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Total ganhos: <span className="font-semibold text-foreground">R$ {affiliate.total_earnings.toFixed(2)}</span>
                        </p>
                      </div>
                      {affiliate.pix_key && (
                        <p className="text-xs text-muted-foreground mt-2">
                          PIX ({affiliate.pix_key_type}): {affiliate.pix_key}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Desde {format(new Date(affiliate.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
