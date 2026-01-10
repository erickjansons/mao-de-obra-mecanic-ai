import { FlaskConical } from 'lucide-react';

export const Header = () => {
  return (
    <header className="glass-effect sticky top-0 z-40 shadow-2xl border-b border-border">
      <div className="px-4 py-3 animate-fade-in-scale">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center animate-float shadow-lg">
            <FlaskConical className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gerenciador de Mão de Obra
          </h1>
        </div>
        <p className="text-muted-foreground text-sm text-center">Oficina Mecânica</p>
      </div>
    </header>
  );
};
