import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ServiceFormProps {
  onSubmit: (service: {
    cliente: string;
    veiculo: string;
    placa: string;
    servico: string;
    data_servico: string;
    valor_mao_obra: number;
  }) => void;
  onSuccess?: () => void;
}

export const ServiceForm = ({ onSubmit, onSuccess }: ServiceFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    veiculo: '',
    placa: '',
    servico: '',
    data_servico: '',
    valor_mao_obra: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSubmit({
        cliente: formData.cliente || 'Cliente não informado',
        veiculo: formData.veiculo || 'Veículo não informado',
        placa: formData.placa || '',
        servico: formData.servico || 'Serviço não informado',
        data_servico: formData.data_servico || new Date().toISOString().split('T')[0],
        valor_mao_obra: parseFloat(formData.valor_mao_obra) || 0,
      });

      setFormData({
        cliente: '',
        veiculo: '',
        placa: '',
        servico: '',
        data_servico: '',
        valor_mao_obra: '',
      });

      toast({
        title: "Sucesso!",
        description: "Serviço adicionado com sucesso!",
      });

      onSuccess?.();
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao adicionar serviço",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gradient-border rounded-xl shadow-xl p-4 border border-border animate-fade-in-scale">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-success to-emerald-500 rounded-lg flex items-center justify-center animate-float">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold">Novo Serviço</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="cliente" className="text-muted-foreground">Cliente (opcional)</Label>
          <Input
            id="cliente"
            placeholder="Ex: João Silva"
            value={formData.cliente}
            onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
            className="bg-secondary border-border focus:ring-primary"
          />
        </div>

        <div>
          <Label htmlFor="veiculo" className="text-muted-foreground">Veículo (opcional)</Label>
          <Input
            id="veiculo"
            placeholder="Ex: Honda Civic 2020"
            value={formData.veiculo}
            onChange={e => setFormData(prev => ({ ...prev, veiculo: e.target.value }))}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="placa" className="text-muted-foreground">Placa (opcional)</Label>
          <Input
            id="placa"
            placeholder="Ex: ABC-1234"
            value={formData.placa}
            onChange={e => setFormData(prev => ({ ...prev, placa: e.target.value }))}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="servico" className="text-muted-foreground">Serviço (opcional)</Label>
          <Input
            id="servico"
            placeholder="Ex: Troca de óleo"
            value={formData.servico}
            onChange={e => setFormData(prev => ({ ...prev, servico: e.target.value }))}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="data_servico" className="text-muted-foreground">Data (opcional)</Label>
          <Input
            id="data_servico"
            type="date"
            value={formData.data_servico}
            onChange={e => setFormData(prev => ({ ...prev, data_servico: e.target.value }))}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="valor_mao_obra" className="text-muted-foreground">Valor da Mão de Obra (R$) (opcional)</Label>
          <Input
            id="valor_mao_obra"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.valor_mao_obra}
            onChange={e => setFormData(prev => ({ ...prev, valor_mao_obra: e.target.value }))}
            className="bg-secondary border-border"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 button-glow"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Adicionando...' : 'Adicionar Serviço'}
        </Button>
      </form>
    </div>
  );
};
