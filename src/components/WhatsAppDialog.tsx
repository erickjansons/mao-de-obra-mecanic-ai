import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (phone: string) => void;
}

export const WhatsAppDialog = ({ open, onOpenChange, onConfirm }: WhatsAppDialogProps) => {
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('oficina_whatsapp_phone') || '';
  });

  const handleConfirm = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned) {
      localStorage.setItem('oficina_whatsapp_phone', cleaned);
    }
    onConfirm(cleaned);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            Enviar por WhatsApp
          </DialogTitle>
          <DialogDescription>
            Digite o número do WhatsApp para enviar a mensagem
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número do WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="5511999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              Digite o número com código do país (ex: 5511999999999)
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
