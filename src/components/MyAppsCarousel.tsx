import { ExternalLink } from 'lucide-react';

interface AppItem {
  name: string;
  description: string;
  url: string;
  emoji: string;
}

const apps: AppItem[] = [
  {
    name: 'Orçamento Automotivo',
    description: 'Crie orçamentos profissionais para seus clientes',
    url: 'https://mecanic-ai-orcamentos.lovable.app/',
    emoji: '🧾',
  },
];

export const MyAppsCarousel = () => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-3 text-foreground">Meus Aplicativos</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {apps.map((app) => (
          <a
            key={app.url}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-start shrink-0 w-64 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="text-4xl mb-3">{app.emoji}</div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {app.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{app.description}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Abrir</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>
        ))}

        {/* Placeholder "Em breve" */}
        <div className="snap-start shrink-0 w-64 rounded-xl border border-dashed border-border bg-muted/30 p-5 flex flex-col items-center justify-center text-muted-foreground">
          <span className="text-3xl mb-2">🔜</span>
          <span className="text-sm font-medium">Em breve...</span>
        </div>
      </div>
    </div>
  );
};
