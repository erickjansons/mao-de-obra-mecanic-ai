import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Shield, DollarSign, Users, Award, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminRevenueCard } from '@/components/admin/AdminRevenueCard';
import { AdminUsersCard } from '@/components/admin/AdminUsersCard';
import { AdminAffiliatesCard } from '@/components/admin/AdminAffiliatesCard';
import { AdminTokensCard } from '@/components/admin/AdminTokensCard';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, isAdmin, refetch, createTokens, deleteToken } = useAdminDashboard();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin === false && !loading) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={handleRefresh}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold">Painel Admin</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {data && (
        <main className="px-3 py-4">
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="revenue" className="text-xs flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="hidden sm:inline">Receita</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="affiliates" className="text-xs flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span className="hidden sm:inline">Afiliados</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="text-xs flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                <span className="hidden sm:inline">Tokens</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="animate-slide-up">
              <AdminRevenueCard
                monthlyRevenue={data.revenue.monthly_revenue}
                totalRevenue={data.revenue.total_revenue}
                directRevenue={data.revenue.direct_revenue}
                tokenRevenue={data.revenue.token_revenue}
                totalPaidSubscriptions={data.revenue.total_paid_subscriptions}
                totalPaidEver={data.revenue.total_paid_ever}
                revenueByMonth={data.revenue.revenue_by_month}
              />
            </TabsContent>

            <TabsContent value="users" className="animate-slide-up">
              <AdminUsersCard
                total={data.users.total}
                premium={data.users.premium}
                free={data.users.free}
                details={data.users.details}
              />
            </TabsContent>

            <TabsContent value="affiliates" className="animate-slide-up">
              <AdminAffiliatesCard
                total={data.affiliates.total}
                active={data.affiliates.active}
                totalEarnings={data.affiliates.total_earnings}
                pendingEarnings={data.affiliates.pending_earnings}
                paidEarnings={data.affiliates.paid_earnings}
                totalReferrals={data.affiliates.total_referrals}
                convertedReferrals={data.affiliates.converted_referrals}
                pendingReferrals={data.affiliates.pending_referrals}
                details={data.affiliates.details}
              />
            </TabsContent>

            <TabsContent value="tokens" className="animate-slide-up">
              <AdminTokensCard
                total={data.tokens.total}
                used={data.tokens.used}
                available={data.tokens.available}
                details={data.tokens.details}
                onCreateTokens={createTokens}
                onDeleteToken={deleteToken}
              />
            </TabsContent>
          </Tabs>
        </main>
      )}
    </div>
  );
};

export default Admin;
