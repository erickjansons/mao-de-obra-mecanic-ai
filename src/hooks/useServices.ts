import { useState, useCallback, useMemo } from 'react';
import { Service, SortBy, SortOrder } from '@/types/service';

const STORAGE_KEY = 'gerenciador_servicos_data';

const loadFromLocalStorage = (): Service[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (data: Service[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

export const useServices = () => {
  const [services, setServices] = useState<Service[]>(() => loadFromLocalStorage());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const addService = useCallback((service: Omit<Service, 'id' | 'status'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      status: 'Em Andamento',
    };
    
    setServices(prev => {
      const updated = [...prev, newService];
      saveToLocalStorage(updated);
      return updated;
    });
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setServices(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      saveToLocalStorage(updated);
      return updated;
    });
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setServices(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: s.status === 'Concluído' ? 'Em Andamento' : 'Concluído'
          } as Service;
        }
        return s;
      });
      saveToLocalStorage(updated);
      return updated;
    });
  }, []);

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(service => {
        if (!service.data_servico) return false;
        const date = new Date(service.data_servico + 'T00:00:00');
        const serviceMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return serviceMonth === selectedMonth;
      });
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(service => service.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(service => {
        return (
          service.cliente?.toLowerCase().includes(search) ||
          service.veiculo?.toLowerCase().includes(search) ||
          service.placa?.toLowerCase().includes(search) ||
          service.servico?.toLowerCase().includes(search)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      if (sortBy === 'date') {
        valueA = a.data_servico ? new Date(a.data_servico + 'T00:00:00').getTime() : 0;
        valueB = b.data_servico ? new Date(b.data_servico + 'T00:00:00').getTime() : 0;
      } else if (sortBy === 'value') {
        valueA = a.valor_mao_obra || 0;
        valueB = b.valor_mao_obra || 0;
      } else {
        valueA = (a.cliente || '').toLowerCase();
        valueB = (b.cliente || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      }
      return valueA < valueB ? 1 : -1;
    });

    return filtered;
  }, [services, selectedMonth, selectedStatus, searchTerm, sortBy, sortOrder]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    services.forEach(service => {
      if (service.data_servico) {
        const date = new Date(service.data_servico + 'T00:00:00');
        months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(months).sort().reverse();
  }, [services]);

  const stats = useMemo(() => {
    const total = services.length;
    const inProgress = services.filter(s => s.status === 'Em Andamento').length;
    const completed = services.filter(s => s.status === 'Concluído').length;
    const totalValue = services.reduce((sum, s) => sum + (s.valor_mao_obra || 0), 0);
    return { total, inProgress, completed, totalValue };
  }, [services]);

  const filteredStats = useMemo(() => {
    const total = filteredServices.length;
    const inProgress = filteredServices.filter(s => s.status === 'Em Andamento').length;
    const completed = filteredServices.filter(s => s.status === 'Concluído').length;
    const totalValue = filteredServices.reduce((sum, s) => sum + (s.valor_mao_obra || 0), 0);
    return { total, inProgress, completed, totalValue };
  }, [filteredServices]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedStatus('');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  const toggleSort = useCallback((newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy]);

  return {
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
  };
};
