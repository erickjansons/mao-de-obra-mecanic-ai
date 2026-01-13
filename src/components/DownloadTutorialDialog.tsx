import { useState } from 'react';
import { Download, Smartphone, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DownloadTutorialDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-primary/50 hover:bg-primary/10"
        >
          <Download className="h-4 w-4" />
          Baixar App
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Instalar no seu celular
          </DialogTitle>
          <DialogDescription>
            Siga o tutorial abaixo para adicionar o app à tela inicial do seu dispositivo
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="android" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="android" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Android
            </TabsTrigger>
            <TabsTrigger value="ios" className="gap-2">
              <Apple className="h-4 w-4" />
              iOS (iPhone)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="android" className="mt-4 space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <h4 className="font-semibold text-foreground">Passo a passo - Android:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Abra este site no navegador <strong>Chrome</strong></li>
                <li>Toque no menu <strong>⋮</strong> (três pontinhos) no canto superior direito</li>
                <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong></li>
                <li>Confirme tocando em <strong>"Adicionar"</strong></li>
                <li>Pronto! O ícone do app aparecerá na sua tela inicial</li>
              </ol>
            </div>
            <div className="text-xs text-muted-foreground bg-primary/10 p-3 rounded-lg">
              💡 <strong>Dica:</strong> Após instalar, você pode acessar o app diretamente pelo ícone, sem precisar abrir o navegador!
            </div>
          </TabsContent>
          
          <TabsContent value="ios" className="mt-4 space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <h4 className="font-semibold text-foreground">Passo a passo - iPhone/iPad:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Abra este site no navegador <strong>Safari</strong></li>
                <li>Toque no ícone de <strong>compartilhar</strong> (quadrado com seta para cima) na barra inferior</li>
                <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                <li>Edite o nome se desejar e toque em <strong>"Adicionar"</strong></li>
                <li>Pronto! O ícone do app aparecerá na sua tela inicial</li>
              </ol>
            </div>
            <div className="text-xs text-muted-foreground bg-primary/10 p-3 rounded-lg">
              💡 <strong>Importante:</strong> O tutorial só funciona no Safari. Outros navegadores no iOS não suportam essa função.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
