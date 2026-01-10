import logo from '@/assets/logo.png';
import { UserMenu } from './UserMenu';

export const Header = () => {
  return (
    <header className="glass-effect sticky top-0 z-40 shadow-2xl border-b border-border">
      <div className="px-4 py-4 animate-fade-in-scale">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="Logo Oficina" 
              className="h-20 w-auto object-contain animate-float"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gerenciador de Mão de Obra
              </h1>
              <p className="text-muted-foreground text-sm">Oficina Mecânica</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
