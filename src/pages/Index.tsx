import { useState } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation, TabType } from '@/components/TabNavigation';
import { Dashboard } from '@/components/Dashboard';
import { ServiceForm } from '@/components/ServiceForm';
import { ServiceList } from '@/components/ServiceList';
import { useServices } from '@/hooks/useServices';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const {
    services,
    filteredServices,
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
  } = useServices();

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
