import { ExternalLink, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AppItem {
  name: string;
  description: string;
  url: string;
  emoji: string;
  gradient: string;
}

const apps: AppItem[] = [
  {
    name: 'Orçamento Automotivo',
    description: 'Crie orçamentos profissionais para seus clientes',
    url: 'https://mecanic-ai-orcamentos.lovable.app/',
    emoji: '🧾',
    gradient: 'from-blue-600 to-cyan-500',
  },
];

export const MyAppsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-10"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">🚀 Meus Aplicativos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Arraste para explorar →</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground animate-pulse" />
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {apps.map((app, i) => (
          <motion.a
            key={app.url}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            onClick={(e) => { if (isDragging) e.preventDefault(); }}
            className="snap-start shrink-0 w-72 rounded-2xl overflow-hidden group relative select-none"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Content */}
            <div className="relative p-6 h-40 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300 inline-block">
                  {app.emoji}
                </span>
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-base drop-shadow">
                  {app.name}
                </h4>
                <p className="text-white/80 text-xs mt-1 line-clamp-2 drop-shadow">
                  {app.description}
                </p>
              </div>
            </div>
          </motion.a>
        ))}

        {/* Em breve card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="snap-start shrink-0 w-72 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 backdrop-blur-sm p-6 h-40 flex flex-col items-center justify-center gap-2 select-none"
        >
          <span className="text-3xl">🔜</span>
          <span className="text-sm font-semibold text-muted-foreground">Em breve...</span>
          <span className="text-xs text-muted-foreground/60">Novos apps chegando</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
