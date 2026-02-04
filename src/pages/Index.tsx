import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TabNavigation, TabType } from '@/components/TabNavigation';
import { Dashboard } from '@/components/Dashboard';
import { ServiceForm } from '@/components/ServiceForm';
import { ServiceList } from '@/components/ServiceList';
import { PricingPlans } from '@/components/PricingPlans';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { SubscriptionExpiryAlert } from '@/components/SubscriptionExpiryAlert';
import { MechanicChat } from '@/components/MechanicChat';
import { AffiliateDashboard } from '@/components/AffiliateDashboard';
import { useSupabaseServices } from '@/hooks/useSupabaseServices';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { canAddService, getServiceLimit, isPremium, refetch: refetchSubscription } = useSubscription();
  
  const {
    services,
    filteredServices,
    loading,
    addService,
    updateService,
    deleteService,
    toggleStatus,
    searchTerm,
    setSearchTerm,
    selectedMonth,
    setSelectedMonth,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    sortOrder,
    toggleSort,
    clearFilters,
    availableMonths,
    stats,
    filteredStats,
  } = useSupabaseServices();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Handle Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: 'Assinatura realizada!',
        description: 'Sua assinatura foi ativada com sucesso.',
      });
      refetchSubscription();
      // Clean URL
      window.history.replaceState({}, '', '/');
    } else if (canceled === 'true') {
      toast({
        title: 'Checkout cancelado',
        description: 'O processo de pagamento foi cancelado.',
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, toast, refetchSubscription]);

  const handleAddService = (service: Parameters<typeof addService>[0]) => {
    if (!canAddService(services.length)) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite de serviços do plano gratuito. Faça upgrade para continuar.',
        variant: 'destructive',
      });
      setActiveTab('planos');
      return;
    }
    addService(service);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <MechanicChat />
      
      <main className="px-3 py-4">
        {/* Subscription Expiry Alert - shown on all tabs for premium users */}
        <SubscriptionExpiryAlert onRenew={() => setActiveTab('planos')} />
        
        {activeTab === 'dashboard' && (
          <>
            {!isPremium() && (
              <UpgradePrompt 
                currentCount={services.length} 
                limit={getServiceLimit()} 
                onUpgrade={() => setActiveTab('planos')} 
              />
            )}
            <Dashboard stats={stats} services={services} />
          </>
        )}
        
        {activeTab === 'novo' && (
          <>
            {!isPremium() && (
              <UpgradePrompt 
                currentCount={services.length} 
                limit={getServiceLimit()} 
                onUpgrade={() => setActiveTab('planos')} 
              />
            )}
            <ServiceForm 
              onSubmit={handleAddService} 
              onSuccess={() => setActiveTab('dashboard')}
            />
          </>
        )}
        
        {activeTab === 'lista' && (
          <ServiceList
            services={services}
            filteredServices={filteredServices}
            onToggleStatus={toggleStatus}
            onUpdate={updateService}
            onDelete={deleteService}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onClearFilters={clearFilters}
            availableMonths={availableMonths}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onToggleSort={toggleSort}
            filteredStats={filteredStats}
            onSwitchToNew={() => setActiveTab('novo')}
          />
        )}

        {activeTab === 'planos' && (
          <PricingPlans />
        )}

        {activeTab === 'afiliados' && (
          <AffiliateDashboard />
        )}
      </main>
    </div>
  );
};

export default Index;
