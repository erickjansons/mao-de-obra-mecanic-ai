import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Plus, Lock, Camera, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import ReactMarkdown from 'react-markdown';
import logo from '@/assets/logo.png';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 data URL
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mechanic-chat`;

export const MechanicChatTab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPremium } = useSubscription();

  const canUseChat = isPremium();

  const activeConv = conversations.find(c => c.id === activeConvId) || null;
  const messages = activeConv?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setPendingImage(null);
    setInput('');
    setShowSidebar(false);
  }, []);

  const deleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
    }
  };

  const updateConversation = useCallback((convId: string, updater: (conv: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => c.id === convId ? updater(c) : c));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const streamChat = async (convId: string, userMessage: string, imageData?: string | null) => {
    if (!canUseChat) return;

    const userMsg: Message = { role: 'user', content: userMessage };
    if (imageData) userMsg.image = imageData;

    // Update the conversation with user message
    updateConversation(convId, conv => {
      const updated = { ...conv, messages: [...conv.messages, userMsg] };
      if (conv.messages.length === 0) {
        updated.title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
      }
      return updated;
    });

    setIsLoading(true);
    let assistantContent = '';

    try {
      // Build messages for API - include image as multimodal content
      const allMessages = [...(conversations.find(c => c.id === convId)?.messages || []), userMsg];
      const apiMessages = allMessages.map(msg => {
        if (msg.image) {
          return {
            role: msg.role,
            content: [
              { type: 'text', text: msg.content || 'O que é essa imagem? Analise do ponto de vista mecânico.' },
              { type: 'image_url', image_url: { url: msg.image } },
            ],
          };
        }
        return { role: msg.role, content: msg.content };
      });

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Falha na conexão');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      updateConversation(convId, conv => ({
        ...conv,
        messages: [...conv.messages, { role: 'assistant', content: '' }],
      }));

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
              const captured = assistantContent;
              updateConversation(convId, conv => {
                const msgs = [...conv.messages];
                msgs[msgs.length - 1] = { role: 'assistant', content: captured };
                return { ...conv, messages: msgs };
              });
            }
          } catch {
            // Incomplete JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateConversation(convId, conv => {
        const msgs = [...conv.messages];
        if (msgs[msgs.length - 1]?.role === 'assistant') {
          msgs[msgs.length - 1] = { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' };
        } else {
          msgs.push({ role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' });
        }
        return { ...conv, messages: msgs };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !pendingImage) || isLoading || !canUseChat) return;

    let convId = activeConvId;
    if (!convId) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: 'Nova conversa',
        messages: [],
        createdAt: new Date(),
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      convId = newConv.id;
    }

    const message = input.trim() || (pendingImage ? 'Analise esta imagem' : '');
    const image = pendingImage;
    setInput('');
    setPendingImage(null);
    streamChat(convId, message, image);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!canUseChat) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
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
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-background rounded-xl border border-border/50 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <img src={logo} alt="Logo" className="h-10 w-10 rounded-full object-contain bg-white/20 p-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base">Mecanic-AI</h3>
          <p className="text-xs opacity-80 truncate">
            {activeConv ? activeConv.title : 'Assistente técnico 24h'}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-primary-foreground hover:bg-white/20 text-xs"
          >
            Histórico
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewConversation}
            className="text-primary-foreground hover:bg-white/20"
            title="Nova conversa"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Conversation History */}
        {showSidebar && (
          <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h4 className="font-semibold text-sm">Histórico de Conversas</h4>
              <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhuma conversa ainda</p>
              )}
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm group",
                    conv.id === activeConvId
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setShowSidebar(false);
                  }}
                >
                  <span className="flex-1 truncate">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border/50">
              <Button onClick={createNewConversation} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Nova conversa
              </Button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <img src={logo} alt="Logo" className="h-16 w-16 rounded-full object-contain mb-4 opacity-80" />
              <h4 className="font-semibold text-lg mb-2">Olá, Mecânico!</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Sou seu assistente virtual. Pergunte sobre diagnósticos, procedimentos ou envie uma foto para análise.
              </p>
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
                    <img src={logo} alt="Bot" className="flex-shrink-0 w-8 h-8 rounded-full object-contain bg-muted p-0.5" />
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted border border-border/50 rounded-bl-md"
                    )}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        className="max-w-full max-h-48 rounded-lg mb-2 object-contain"
                      />
                    )}
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
                  <img src={logo} alt="Bot" className="flex-shrink-0 w-8 h-8 rounded-full object-contain bg-muted p-0.5" />
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
      </div>

      {/* Pending Image Preview */}
      {pendingImage && (
        <div className="px-4 py-2 border-t border-border/30">
          <div className="relative inline-block">
            <img src={pendingImage} alt="Preview" className="h-16 rounded-lg object-cover border border-border" />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 rounded-full"
            title="Enviar foto"
          >
            <Camera className="h-5 w-5" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida ou envie uma foto..."
            disabled={isLoading}
            className="flex-1 min-h-[44px] max-h-[120px] rounded-2xl bg-muted border-border/50 focus-visible:ring-primary resize-none py-3"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || (!input.trim() && !pendingImage)}
            className="flex-shrink-0 rounded-full shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};