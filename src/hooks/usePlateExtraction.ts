import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtractedData {
  placa: string;
  veiculo: string;
  data_servico: string;
  cliente: string;
}

export const usePlateExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const extractFromImage = async (imageBase64: string): Promise<ExtractedData | null> => {
    setIsExtracting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-plate-info', {
        body: { imageBase64 }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.data) {
        toast({
          title: 'Placa reconhecida!',
          description: 'Os campos foram preenchidos automaticamente. Você pode editá-los se necessário.',
        });
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Error extracting plate info:', error);
      toast({
        title: 'Erro ao reconhecer placa',
        description: error instanceof Error ? error.message : 'Tente novamente ou preencha manualmente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  const captureImage = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use back camera on mobile
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        // Compress and convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  };

  return {
    isExtracting,
    extractFromImage,
    captureImage,
  };
};
