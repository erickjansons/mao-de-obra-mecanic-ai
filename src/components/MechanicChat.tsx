import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import ReactMarkdown from 'react-markdown';
import logo from '@/assets/logo.png';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mechanic-chat`;

export const MechanicChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isPremium } = useSubscription();

  const canUseChat = isPremium();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && canUseChat) {
      inputRef.current.focus();
    }
  }, [isOpen, canUseChat]);

  const streamChat = async (userMessage: string) => {
    if (!canUseChat) return;

    const userMsg: Message = { role: 'user', content: userMessage };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Falha na conexão');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !canUseChat) return;
    
    const message = input.trim();
    setInput('');
    streamChat(message);
  };

  const suggestedQuestions = [
    "Como diagnosticar falha no motor?",
    "Quando trocar pastilhas de freio?",
    "Barulho na suspensão, o que pode ser?",
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-4 bottom-24 z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90" 
            : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-[340px] bg-gradient-to-b from-background to-background/95 border-l border-border/50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header with Logo */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-12 w-12 rounded-full object-contain bg-white/20 p-1"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">Mecanic-AI</h3>
            <p className="text-xs opacity-80">Assistente técnico 24h</p>
          </div>
          <div className="flex gap-1">
            {canUseChat && messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMessages([])}
                className="text-primary-foreground hover:bg-white/20"
                title="Novo Chat"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Locked State for Free Users */}
        {!canUseChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Recurso Premium</h4>
            <p className="text-sm text-muted-foreground mb-4">
              O assistente mecânico virtual está disponível apenas para assinantes do plano pago.
            </p>
            <p className="text-xs text-muted-foreground">
              Faça upgrade do seu plano para ter acesso ilimitado ao chat com IA.
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="h-16 w-16 rounded-full object-contain mb-4 opacity-80"
                  />
                  <h4 className="font-semibold text-lg mb-2">Olá, Mecânico!</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Sou seu assistente virtual. Pergunte sobre diagnósticos, procedimentos ou qualquer dúvida técnica.
                  </p>
                  
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sugestões:</p>
                    {suggestedQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className="w-full text-left text-sm p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <img 
                          src={logo} 
                          alt="Bot" 
                          className="flex-shrink-0 w-8 h-8 rounded-full object-contain bg-muted p-0.5"
                        />
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted border border-border/50 rounded-bl-md"
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:my-1 [&>ol]:my-1">
                            <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-2 justify-start">
                      <img 
                        src={logo} 
                        alt="Bot" 
                        className="flex-shrink-0 w-8 h-8 rounded-full object-contain bg-muted p-0.5"
                      />
                      <div className="bg-muted border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida..."
                  disabled={isLoading}
                  className="flex-1 rounded-full bg-muted border-border/50 focus-visible:ring-primary"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  className="rounded-full shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
