import { useState, useEffect, useRef } from 'react';
import { Plus, Camera, Loader2, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePlateExtraction } from '@/hooks/usePlateExtraction';

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
  const { 
    isExtracting, 
    extractFromImage, 
    captureImage, 
    showCamera, 
    startCamera, 
    stopCamera, 
    captureFromCamera,
    stream,
    videoRef 
  } = usePlateExtraction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    veiculo: '',
    placa: '',
    servico: '',
    data_servico: '',
    valor_mao_obra: '',
  });

  // Connect video stream to video element
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      videoRef.current = localVideoRef.current;
    }
  }, [stream, videoRef]);

  const handleCaptureFromFile = async () => {
    const imageBase64 = await captureImage();
    if (!imageBase64) return;

    const extractedData = await extractFromImage(imageBase64);
    if (extractedData) {
      setFormData(prev => ({
        ...prev,
        placa: extractedData.placa || prev.placa,
        veiculo: extractedData.veiculo || prev.veiculo,
        data_servico: extractedData.data_servico || prev.data_servico,
        cliente: extractedData.cliente || prev.cliente,
      }));
    }
  };

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleCapturePhoto = async () => {
    const imageBase64 = await captureFromCamera();
    if (!imageBase64) return;

    const extractedData = await extractFromImage(imageBase64);
    if (extractedData) {
      setFormData(prev => ({
        ...prev,
        placa: extractedData.placa || prev.placa,
        veiculo: extractedData.veiculo || prev.veiculo,
        data_servico: extractedData.data_servico || prev.data_servico,
        cliente: extractedData.cliente || prev.cliente,
      }));
    }
  };

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
    <>
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/80">
            <h3 className="text-white font-semibold">Fotografe a Placa</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={stopCamera}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/60 rounded-lg w-[80%] h-24 flex items-center justify-center">
                <span className="text-white/80 text-sm bg-black/50 px-3 py-1 rounded">
                  Posicione a placa aqui
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-black/80 flex justify-center">
            <Button
              onClick={handleCapturePhoto}
              disabled={isExtracting}
              className="h-16 w-16 rounded-full bg-white hover:bg-gray-200"
            >
              {isExtracting ? (
                <Loader2 className="h-8 w-8 text-black animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-black" />
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="gradient-border rounded-xl shadow-xl p-4 border border-border animate-fade-in-scale">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-success to-emerald-500 rounded-lg flex items-center justify-center animate-float">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold flex-1">Novo Serviço</h2>
        </div>

        {/* Camera Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStartCamera}
            disabled={isExtracting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isExtracting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            Tirar Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCaptureFromFile}
            disabled={isExtracting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Galeria
          </Button>
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
    </>
  );
};
