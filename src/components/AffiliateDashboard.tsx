import { Users, DollarSign, Clock, CheckCircle, Copy, Share2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAffiliate } from '@/hooks/useAffiliate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AffiliateDashboard = () => {
  const { 
    affiliate, 
    referrals, 
    loading, 
    stats, 
    becomeAffiliate, 
    getAffiliateLink, 
    copyAffiliateLink 
  } = useAffiliate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="animate-slide-up">
        <Card className="gradient-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Programa de Afiliados</CardTitle>
            <CardDescription className="text-base mt-2">
              Ganhe <span className="text-primary font-bold">50% de comissão</span> em cada assinatura!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Como funciona:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>Compartilhe seu link exclusivo com amigos e conhecidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>Quando alguém assinar pelo seu link, você ganha 50%</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>Acompanhe suas indicações em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>Receba seus ganhos direto na sua conta</span>
                </li>
              </ul>
            </div>

            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Nota:</strong> A comissão de 50% tem um desconto de taxas de transferência bancária, 
                resultando em um valor líquido de aproximadamente 40% do valor da assinatura.
              </p>
            </div>

            <Button 
              onClick={becomeAffiliate} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Tornar-se Afiliado
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Affiliate Link Card */}
      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Seu Link de Afiliado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm truncate font-mono">
              {getAffiliateLink()}
            </div>
            <Button onClick={copyAffiliateLink} size="icon" variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Código: <span className="font-mono font-bold text-primary">{affiliate.referral_code}</span>
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 mx-auto mb-2 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Total Indicações</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-emerald-500 mx-auto mb-2 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-success">{stats.convertedReferrals}</p>
            <p className="text-xs text-muted-foreground">Convertidas</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning to-orange-500 mx-auto mb-2 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-warning">R$ {stats.pendingEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-pink-500 mx-auto mb-2 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-accent">R$ {stats.totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Ganho</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Info */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Comissão: 50%</p>
              <p className="text-xs text-muted-foreground">
                *Valor líquido após taxas: ~40%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Já recebido</p>
              <p className="text-xl font-bold text-success">R$ {stats.paidEarnings.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Suas Indicações</CardTitle>
          <CardDescription>Histórico de pessoas que se cadastraram pelo seu link</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma indicação ainda</p>
              <p className="text-sm">Compartilhe seu link para começar a ganhar!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="text-sm">
                      {format(new Date(referral.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={referral.status === 'converted' ? 'default' : 'secondary'}
                        className={referral.status === 'converted' ? 'bg-success' : ''}
                      >
                        {referral.status === 'converted' ? 'Convertido' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {referral.commission_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
