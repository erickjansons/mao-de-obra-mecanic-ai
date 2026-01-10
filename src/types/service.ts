export interface Service {
  id: string;
  cliente: string;
  veiculo: string;
  placa: string;
  servico: string;
  data_servico: string;
  valor_mao_obra: number;
  status: 'Em Andamento' | 'Concluído';
}

export type SortBy = 'date' | 'value' | 'client';
export type SortOrder = 'asc' | 'desc';
