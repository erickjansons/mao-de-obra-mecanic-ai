import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.img 
              src={logo} 
              alt="Logo Oficina" 
              className="h-28 w-auto object-contain mx-auto mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Gerenciador de
              </span>
              <br />
              <span className="text-foreground">Mão de Obra</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A ferramenta completa para mecânicos e oficinas controlarem serviços, 
              clientes e faturamento de forma simples e profissional.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-lg"
                onClick={onGetStarted}
              >
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg border-2"
                onClick={onGetStarted}
              >
                Já tenho conta
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Grátis para começar • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
            </p>
          </motion.div>
        </div>
      </section>

      {/* App Demo Section */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Veja como funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interface simples e intuitiva para você focar no que importa: seu trabalho.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Dashboard Completo',
                description: 'Visualize faturamento, serviços pendentes e estatísticas em tempo real.',
                icon: BarChart3,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Cadastro Rápido',
                description: 'Registre novos serviços em segundos com formulário otimizado.',
                icon: Zap,
                color: 'from-green-500 to-emerald-500',
              },
              {
                title: 'Controle Total',
                description: 'Filtre por data, status, cliente e exporte relatórios em PDF.',
                icon: FileText,
                color: 'from-violet-500 to-purple-500',
              },
            ].map((demo, index) => (
              <motion.div
                key={demo.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                <div className="glass-effect rounded-2xl p-8 border border-border h-full flex flex-col items-center text-center hover-lift">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <demo.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{demo.title}</h3>
                  <p className="text-muted-foreground">{demo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Mock Phone Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative">
              <div className="w-72 h-[500px] bg-gradient-to-br from-card to-secondary rounded-[3rem] p-3 shadow-2xl border-4 border-border">
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-border rounded-b-2xl" />
                  
                  {/* Mock app content */}
                  <div className="pt-10 px-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
                        <span className="font-bold text-sm">Dashboard</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-3 border border-green-500/30">
                        <p className="text-xs text-muted-foreground">Faturamento</p>
                        <p className="text-lg font-bold text-green-500">R$ 4.850</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3 border border-blue-500/30">
                        <p className="text-xs text-muted-foreground">Serviços</p>
                        <p className="text-lg font-bold text-blue-500">12</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Recentes</p>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-muted rounded w-24 mb-1" />
                            <div className="h-2 bg-muted/50 rounded w-16" />
                          </div>
                          <div className="text-xs font-bold text-green-500">R$ {150 + i * 50}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-2xl" />
            </div>
          </motion.div>
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
