import { useState, useEffect } from 'react';
import { Phone, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export const Header = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('oficina_whatsapp_phone');
    if (saved) setPhoneNumber(saved);
  }, []);

  const savePhone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    localStorage.setItem('oficina_whatsapp_phone', cleaned);
  };

  return (
    <header className="glass-effect sticky top-0 z-40 shadow-2xl border-b border-border">
      <div className="px-4 py-4 animate-fade-in-scale">
        <div className="flex items-center justify-center gap-4 mb-3">
          <img 
            src={logo} 
            alt="Logo Oficina" 
            className="h-20 w-auto object-contain animate-float"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gerenciador de Mão de Obra
            </h1>
            <p className="text-muted-foreground text-sm">Oficina Mecânica</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Phone className="w-4 h-4 text-success" />
          <Input
            type="tel"
            placeholder="WhatsApp: 5511999999999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-secondary border-border text-sm h-9 flex-1"
          />
          <Button size="sm" onClick={savePhone} className="bg-success hover:bg-success/80 h-9">
            <Save className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">Digite o número com código do país (ex: 5511999999999)</p>
      </div>
    </header>
  );
};