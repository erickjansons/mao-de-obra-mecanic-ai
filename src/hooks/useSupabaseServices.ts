import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type ServiceStatus = 'Em Andamento' | 'Concluído';
export type SortBy = 'date' | 'value' | null;
export type SortOrder = 'asc' | 'desc';

export interface Service {
  id: string;
  cliente: string;
  veiculo: string;
  placa: string;
  servico: string;
  valor_mao_obra: number;
  data_servico: string;
  status: ServiceStatus;
}

export const useSupabaseServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchServices = useCallback(async () => {
    if (!user) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedServices: Service[] = (data || []).map((s) => ({
        id: s.id,
        cliente: s.cliente,
        veiculo: s.veiculo || '',
        placa: s.placa || '',
        servico: s.servico,
        valor_mao_obra: Number(s.valor_mao_obra),
        data_servico: s.data_servico,
        status: s.status as ServiceStatus,
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar serviços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (service: Omit<Service, 'id' | 'status'>) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('services').insert({
        user_id: user.id,
        cliente: service.cliente,
        veiculo: service.veiculo,
        placa: service.placa,
        servico: service.servico,
        valor_mao_obra: service.valor_mao_obra,
        data_servico: service.data_servico,
        status: 'Em Andamento',
      });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Serviço adicionado com sucesso',
      });

      fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar serviço',
        variant: 'destructive',
      });
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Serviço atualizado',
      });

      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar serviço',
        variant: 'destructive',
      });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Serviço excluído',
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir serviço',
        variant: 'destructive',
      });
    }
  };

  const toggleStatus = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;

    const newStatus: ServiceStatus =
      service.status === 'Em Andamento' ? 'Concluído' : 'Em Andamento';

    await updateService(id, { status: newStatus });
  };

  const filteredServices = useMemo(() => {
    let result = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.cliente.toLowerCase().includes(term) ||
          s.veiculo.toLowerCase().includes(term) ||
          s.placa.toLowerCase().includes(term) ||
          s.servico.toLowerCase().includes(term)
      );
    }

    if (selectedMonth) {
      result = result.filter((s) => {
        const date = new Date(s.data_servico + 'T00:00:00');
        const monthYear = date.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        });
        return monthYear === selectedMonth;
      });
    }

    if (selectedStatus) {
      result = result.filter((s) => s.status === selectedStatus);
    }

    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.data_servico).getTime();
          const dateB = new Date(b.data_servico).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortBy === 'value') {
          return sortOrder === 'asc'
            ? a.valor_mao_obra - b.valor_mao_obra
            : b.valor_mao_obra - a.valor_mao_obra;
        }
        return 0;
      });
    }

    return result;
  }, [services, searchTerm, selectedMonth, selectedStatus, sortBy, sortOrder]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    services.forEach((s) => {
      const date = new Date(s.data_servico + 'T00:00:00');
      const monthYear = date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      months.add(monthYear);
    });
    return Array.from(months).sort((a, b) => {
      const [monthA, yearA] = a.split(' de ');
      const [monthB, yearB] = b.split(' de ');
      const yearDiff = parseInt(yearB) - parseInt(yearA);
      if (yearDiff !== 0) return yearDiff;
      return 0;
    });
  }, [services]);

  const stats = useMemo(() => {
    return {
      total: services.length,
      inProgress: services.filter((s) => s.status === 'Em Andamento').length,
      completed: services.filter((s) => s.status === 'Concluído').length,
      totalValue: services.reduce((sum, s) => sum + s.valor_mao_obra, 0),
    };
  }, [services]);

  const filteredStats = useMemo(() => {
    return {
      total: filteredServices.length,
      inProgress: filteredServices.filter((s) => s.status === 'Em Andamento')
        .length,
      completed: filteredServices.filter((s) => s.status === 'Concluído').length,
      totalValue: filteredServices.reduce((sum, s) => sum + s.valor_mao_obra, 0),
    };
  }, [filteredServices]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedStatus('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return {
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
  };
};
