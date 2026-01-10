import logo from '@/assets/logo.png';

export const Header = () => {
  return (
    <header className="glass-effect sticky top-0 z-40 shadow-2xl border-b border-border">
      <div className="px-4 py-3 animate-fade-in-scale">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img 
            src={logo} 
            alt="Logo Oficina" 
            className="h-12 w-auto object-contain animate-float"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gerenciador de Mão de Obra
          </h1>
        </div>
        <p className="text-muted-foreground text-sm text-center">Oficina Mecânica</p>
      </div>
    </header>
  );
};
