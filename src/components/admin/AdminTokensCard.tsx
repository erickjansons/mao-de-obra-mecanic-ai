import { useState } from 'react';
import { Ticket, CheckCircle, Clock, Plus, Trash2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TokenDetail } from '@/hooks/useAdminDashboard';

interface Props {
  total: number;
  used: number;
  available: number;
  details: TokenDetail[];
  onCreateTokens: (tokens: string[]) => Promise<any>;
  onDeleteToken: (tokenId: string) => Promise<any>;
}

export const AdminTokensCard = ({
  total,
  used,
  available,
  details,
  onCreateTokens,
  onDeleteToken,
}: Props) => {
  const [newTokens, setNewTokens] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const usagePercent = total > 0 ? Math.round((used / total) * 100) : 0;

  const handleCreate = async () => {
    const tokens = newTokens
      .split(/[\n,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      toast.error('Digite pelo menos um token');
      return;
    }

    try {
      setCreating(true);
      const result = await onCreateTokens(tokens);
      toast.success(`${result.created} token(s) criado(s)${result.duplicates > 0 ? ` (${result.duplicates} duplicados ignorados)` : ''}`);
      setNewTokens('');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar tokens');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tokenId: string) => {
    try {
      setDeletingId(tokenId);
      await onDeleteToken(tokenId);
      toast.success('Token excluído');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir token');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copiado!');
  };

  const sortedDetails = [...details].sort((a, b) => {
    if (a.is_used !== b.is_used) return a.is_used ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <Ticket className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-success">{used}</p>
            <p className="text-xs text-muted-foreground">Usados</p>
          </CardContent>
        </Card>
        <Card className="gradient-border">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-warning">{available}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage bar */}
      <Card className="gradient-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Taxa de Uso</p>
            <p className="text-sm font-bold text-primary">{usagePercent}%</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create tokens */}
      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Criar Tokens
          </CardTitle>
          <CardDescription>Separe por vírgula, ponto-e-vírgula ou nova linha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Ex: TOKEN1, TOKEN2, TOKEN3"
            value={newTokens}
            onChange={(e) => setNewTokens(e.target.value)}
          />
          <Button
            onClick={handleCreate}
            disabled={creating || !newTokens.trim()}
            className="w-full"
            size="sm"
          >
            {creating ? 'Criando...' : 'Criar Tokens'}
          </Button>
        </CardContent>
      </Card>

      {/* Token list */}
      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Todos os Tokens ({details.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {sortedDetails.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono truncate">{t.token}</code>
                    <Badge variant={t.is_used ? 'secondary' : 'default'} className="shrink-0 text-[10px]">
                      {t.is_used ? 'Usado' : 'Disponível'}
                    </Badge>
                  </div>
                  {t.is_used && t.used_by_email && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Por: {t.used_by_email} • {t.used_at ? format(new Date(t.used_at), 'dd/MM/yy HH:mm', { locale: ptBR }) : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToken(t.token)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  {!t.is_used && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {details.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhum token cadastrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
