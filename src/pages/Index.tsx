import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TabNavigation, TabType } from '@/components/TabNavigation';
import { Dashboard } from '@/components/Dashboard';
import { ServiceForm } from '@/components/ServiceForm';
import { ServiceList } from '@/components/ServiceList';
import { useSupabaseServices } from '@/hooks/useSupabaseServices';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
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
      
      <main className="px-3 py-4">
        {activeTab === 'dashboard' && (
          <Dashboard stats={stats} services={services} />
        )}
        
        {activeTab === 'novo' && (
          <ServiceForm 
            onSubmit={addService} 
            onSuccess={() => setActiveTab('dashboard')}
          />
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
      </main>
    </div>
  );
};

export default Index;
