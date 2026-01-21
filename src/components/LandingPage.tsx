import { motion } from 'framer-motion';
import { 
  Wrench, 
  FileText, 
  BarChart3, 
  Shield, 
  Zap, 
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Smartphone,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const features = [
    {
      icon: Wrench,
      title: 'Cadastro de Serviços',
      description: 'Registre todos os serviços realizados com detalhes completos do veículo e cliente.',
    },
    {
      icon: FileText,
      title: 'Geração de PDF',
      description: 'Crie orçamentos e recibos profissionais em PDF com um clique.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'Visualize estatísticas de faturamento, serviços pendentes e muito mais.',
    },
    {
      icon: Clock,
      title: 'Histórico Completo',
      description: 'Acesse todo o histórico de serviços por cliente, veículo ou período.',
    },
    {
      icon: MessageCircle,
      title: 'Envio via WhatsApp',
      description: 'Envie relatórios de serviços para você ou seu patrão e mantenha o controle total.',
    },
    {
      icon: Shield,
      title: 'Dados Seguros',
      description: 'Seus dados ficam protegidos na nuvem com backup automático.',
    },
    {
      icon: Smartphone,
      title: '100% Mobile',
      description: 'Use no celular, tablet ou computador. Sempre sincronizado.',
    },
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Mecânico Automotivo',
      content: 'Facilitou muito minha organização. Agora sei exatamente quanto faturei no mês!',
      rating: 5,
    },
    {
      name: 'Roberto Almeida',
      role: 'Dono de Oficina',
      content: 'A geração de PDF é sensacional. Meus clientes adoram receber o orçamento na hora.',
      rating: 5,
    },
    {
      name: 'João Pereira',
      role: 'Funileiro',
      content: 'Simples de usar e me ajuda a não esquecer nenhum serviço pendente.',
      rating: 5,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Floating orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div
              animate={floatAnimation}
              className="inline-block"
            >
              <motion.img 
                src={logo} 
                alt="Logo Oficina" 
                className="h-32 sm:h-40 w-auto object-contain mx-auto mb-8 drop-shadow-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
              />
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
            >
              <motion.span 
                className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent inline-block"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              >
                Gerenciador de
              </motion.span>
              <br />
              <span className="text-foreground">Mão de Obra</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              A ferramenta completa para mecânicos e oficinas controlarem serviços, 
              clientes e faturamento de forma simples e profissional.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-shadow"
                  onClick={onGetStarted}
                >
                  Começar Grátis
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/10"
                  onClick={onGetStarted}
                >
                  Já tenho conta
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.p 
              variants={itemVariants}
              className="text-sm text-muted-foreground mt-6"
            >
              ✓ Grátis para começar • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
            </motion.p>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-3 bg-primary rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* App Demo Section */}
      <section className="py-20 sm:py-32 bg-secondary/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              ✨ Demonstração
            </motion.span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Veja como funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interface simples e intuitiva para você focar no que importa: seu trabalho.
            </p>
          </motion.div>
          
          {/* Phone Mockup with Logo */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
            {/* Left side features */}
            <motion.div 
              className="space-y-6 max-w-sm"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {[
                { icon: BarChart3, title: 'Dashboard Completo', desc: 'Estatísticas em tempo real', color: 'from-primary to-accent' },
                { icon: Zap, title: 'Cadastro Rápido', desc: 'Registre em segundos', color: 'from-success to-success' },
                { icon: FileText, title: 'Relatórios PDF', desc: 'Exporte com um clique', color: 'from-warning to-warning' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex items-center gap-4 glass-effect rounded-xl p-4 border border-border"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative"
              style={{ perspective: 1000 }}
            >
              <motion.div 
                animate={floatAnimation}
                className="relative z-10"
              >
                <div className="w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] bg-gradient-to-br from-foreground/90 to-foreground rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-foreground rounded-b-2xl z-20" />
                    
                    {/* Mock app content */}
                    <div className="pt-12 px-4 space-y-4 h-full bg-gradient-to-b from-secondary/50 to-background">
                      {/* Header with Logo */}
                      <motion.div 
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-2">
                          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                          <span className="font-bold text-sm">Dashboard</span>
                        </div>
                        <motion.div 
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent"
                          animate={pulseAnimation}
                        />
                      </motion.div>
                      
                      {/* Stats Cards */}
                      <motion.div 
                        className="grid grid-cols-2 gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.div 
                          className="bg-success/10 rounded-xl p-3 border border-success/30"
                          whileHover={{ scale: 1.05 }}
                        >
                          <p className="text-xs text-muted-foreground">Faturamento</p>
                          <p className="text-xl font-bold text-success">R$ 4.850</p>
                          <p className="text-xs text-success">+12% este mês</p>
                        </motion.div>
                        <motion.div 
                          className="bg-primary/10 rounded-xl p-3 border border-primary/30"
                          whileHover={{ scale: 1.05 }}
                        >
                          <p className="text-xs text-muted-foreground">Serviços</p>
                          <p className="text-xl font-bold text-primary">12</p>
                          <p className="text-xs text-primary">3 pendentes</p>
                        </motion.div>
                      </motion.div>
                      
                      {/* Recent services */}
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                      >
                        <p className="text-xs font-semibold text-muted-foreground">Serviços Recentes</p>
                        {[
                          { name: 'Troca de óleo', car: 'Civic 2020', value: 150 },
                          { name: 'Alinhamento', car: 'Corolla 2019', value: 200 },
                          { name: 'Freios', car: 'HB20 2021', value: 350 },
                        ].map((service, i) => (
                          <motion.div 
                            key={i}
                            className="bg-card/80 backdrop-blur rounded-xl p-3 flex items-center gap-3 border border-border/50"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            whileHover={{ x: 5, backgroundColor: 'hsl(var(--secondary))' }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{service.name}</p>
                              <p className="text-xs text-muted-foreground">{service.car}</p>
                            </div>
                            <span className="text-sm font-bold text-success">R$ {service.value}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                      
                      {/* Bottom nav mockup */}
                      <motion.div 
                        className="absolute bottom-4 left-4 right-4 h-14 bg-card/90 backdrop-blur rounded-2xl flex items-center justify-around border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 }}
                      >
                        <div className="flex flex-col items-center text-primary">
                          <BarChart3 className="w-5 h-5" />
                          <span className="text-[10px]">Dashboard</span>
                        </div>
                        <motion.div 
                          className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-2xl text-primary-foreground">+</span>
                        </motion.div>
                        <div className="flex flex-col items-center text-muted-foreground">
                          <FileText className="w-5 h-5" />
                          <span className="text-[10px]">Lista</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-accent/40 to-primary/40 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Right side features */}
            <motion.div 
              className="space-y-6 max-w-sm"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {[
                { icon: MessageCircle, title: 'WhatsApp', desc: 'Envie relatórios fácil', color: 'from-success to-success' },
                { icon: Shield, title: 'Dados Seguros', desc: 'Backup automático', color: 'from-primary to-accent' },
                { icon: Smartphone, title: '100% Mobile', desc: 'Use em qualquer lugar', color: 'from-warning to-warning' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex items-center gap-4 glass-effect rounded-xl p-4 border border-border"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  whileHover={{ x: -10, transition: { duration: 0.2 } }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simplifique a gestão da sua oficina com recursos pensados para o dia a dia do mecânico.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-effect rounded-xl p-6 hover-lift border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-primary-foreground">
            {[
              { value: '500+', label: 'Usuários ativos' },
              { value: '15k+', label: 'Serviços registrados' },
              { value: '99.9%', label: 'Uptime garantido' },
              { value: '4.9★', label: 'Avaliação média' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-muted-foreground text-lg">
              Mecânicos e donos de oficina confiam no nosso sistema.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-effect rounded-xl p-6 border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Planos simples e acessíveis
            </h2>
            <p className="text-muted-foreground text-lg">
              Comece grátis e faça upgrade quando precisar.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-effect rounded-xl p-6 border border-border"
            >
              <h3 className="text-xl font-bold mb-2">Grátis</h3>
              <div className="text-3xl font-bold mb-4">R$ 0</div>
              <ul className="space-y-3 mb-6">
                {['Até 5 serviços', 'Dashboard básico', 'Suporte por email'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onGetStarted}
              >
                Começar Grátis
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-effect rounded-xl p-6 border-2 border-primary relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-3xl font-bold mb-1">
                A partir de <span className="text-primary">R$ 10,90</span>/mês
              </div>
              <p className="text-sm text-muted-foreground mb-4">No plano anual</p>
              <ul className="space-y-3 mb-6">
                {['Serviços ilimitados', 'Geração de PDF', 'Dashboard completo', 'WhatsApp integrado', 'Suporte prioritário'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={onGetStarted}
              >
                Começar Agora
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pronto para organizar sua oficina?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a centenas de profissionais que já usam nossa plataforma.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-lg"
              onClick={onGetStarted}
            >
              <Zap className="mr-2 h-5 w-5" />
              Criar Conta Grátis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 Gerenciador de Mão de Obra. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
