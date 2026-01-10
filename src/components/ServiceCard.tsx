import { useState } from 'react';
import { User, Settings, Calendar, Edit, Trash2, CheckCircle, RotateCcw, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service } from '@/types/service';
import { cn } from '@/lib/utils';
import { generateServicePDF, shareOnWhatsApp } from '@/utils/pdfGenerator';
import { WhatsAppDialog } from './WhatsAppDialog';

interface ServiceCardProps {
  service: Service;
  onToggleStatus: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Service>) => void;
  onDelete: (id: string) => void;
}

export const ServiceCard = ({ service, onToggleStatus, onUpdate, onDelete }: ServiceCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [editData, setEditData] = useState({
    cliente: service.cliente,
    veiculo: service.veiculo,
    placa: service.placa,
    servico: service.servico,
    data_servico: service.data_servico,
    valor_mao_obra: service.valor_mao_obra.toString(),
    status: service.status,
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Não informada';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const handleSave = () => {
    onUpdate(service.id, {
      ...editData,
      valor_mao_obra: parseFloat(editData.valor_mao_obra) || 0,
      status: editData.status as 'Em Andamento' | 'Concluído',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      cliente: service.cliente,
      veiculo: service.veiculo,
      placa: service.placa,
      servico: service.servico,
      data_servico: service.data_servico,
      valor_mao_obra: service.valor_mao_obra.toString(),
      status: service.status,
    });
    setIsEditing(false);
  };

  const handleWhatsAppConfirm = (phone: string) => {
    shareOnWhatsApp(service, phone);
  };

  if (isEditing) {
    return (
      <div className="px-6 py-4 bg-secondary/50 border border-accent/50 rounded-lg animate-fade-in-scale">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Cliente</label>
            <Input
              value={editData.cliente}
              onChange={e => setEditData(prev => ({ ...prev, cliente: e.target.value }))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Veículo</label>
            <Input
              value={editData.veiculo}
              onChange={e => setEditData(prev => ({ ...prev, veiculo: e.target.value }))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Placa</label>
            <Input
              value={editData.placa}
              onChange={e => setEditData(prev => ({ ...prev, placa: e.target.value }))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Serviço</label>
            <Input
              value={editData.servico}
              onChange={e => setEditData(prev => ({ ...prev, servico: e.target.value }))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Data</label>
            <Input
              type="date"
              value={editData.data_servico}
              onChange={e => setEditData(prev => ({ ...prev, data_servico: e.target.value }))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editData.valor_mao_obra}
              onChange={e => setEditData(prev => ({ ...prev, valor_mao_obra: e.target.value }))}
              className="bg-muted border-border"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-2">Status</label>
            <Select value={editData.status} onValueChange={v => setEditData(prev => ({ ...prev, status: v as 'Em Andamento' | 'Concluído' }))}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-success to-emerald-500">
            Salvar
          </Button>
          <Button onClick={handleCancel} variant="secondary" className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4 hover:bg-secondary/30 transition-colors duration-200 animate-fade-in-scale">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{service.cliente || 'Cliente não informado'}</h3>
              <p className="text-sm text-muted-foreground">
                {service.veiculo || 'Veículo não informado'} {service.placa ? `• ${service.placa}` : ''}
              </p>
            </div>
          </div>
          <span className={cn(
            "px-3 py-1 text-xs font-medium rounded-full border flex-shrink-0",
            service.status === 'Concluído'
              ? "bg-success/20 text-success border-success/30"
              : "bg-warning/20 text-warning border-warning/30"
          )}>
            {service.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Serviço:</span> {service.servico || 'Serviço não informado'}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Data:</span> {formatDate(service.data_servico)}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Valor da Mão de Obra</p>
              <p className="text-2xl font-bold text-success">R$ {(service.valor_mao_obra || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onToggleStatus(service.id)}
            className={cn(
              "flex-1 min-w-0",
              service.status === 'Concluído'
                ? "bg-gradient-to-r from-warning to-orange-500 hover:from-warning/90 hover:to-orange-500/90"
                : "bg-gradient-to-r from-success to-emerald-500 hover:from-success/90 hover:to-emerald-500/90"
            )}
          >
            {service.status === 'Concluído' ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reabrir
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </>
            )}
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={() => generateServicePDF(service)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-500/90 hover:to-cyan-500/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={() => setShowWhatsAppDialog(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={() => onDelete(service.id)}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <WhatsAppDialog
        open={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        onConfirm={handleWhatsAppConfirm}
      />
    </>
  );
};
