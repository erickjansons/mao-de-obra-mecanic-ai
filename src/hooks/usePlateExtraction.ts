import { useState, useRef, useCallback } from 'react';
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
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  const compressImage = (base64: string, maxWidth = 1280, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64;
    });
  };

  const extractFromImage = async (imageBase64: string): Promise<ExtractedData | null> => {
    setIsExtracting(true);
    
    try {
      const compressed = await compressImage(imageBase64);
      const { data, error } = await supabase.functions.invoke('extract-plate-info', {
        body: { imageBase64: compressed }
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

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      setShowCamera(true);
      return mediaStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Erro ao acessar câmera',
        description: 'Verifique as permissões do navegador.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  const captureFromCamera = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !stream) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    stopCamera();
    return imageBase64;
  }, [stream, stopCamera]);

  const captureImage = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

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
    showCamera,
    startCamera,
    stopCamera,
    captureFromCamera,
    stream,
    videoRef,
  };
};
