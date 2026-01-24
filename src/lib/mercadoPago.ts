export const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-ed63f81e-02c2-446f-9d17-43e3bcf5f46a';

export type MercadoPagoLikeError = {
  status?: number;
  statusCode?: number;
  error?: unknown;
  message?: unknown;
};

export function getFriendlyMercadoPagoTokenizationError(err: unknown): string {
  const e = err as MercadoPagoLikeError | null;
  const status = (e?.status ?? e?.statusCode) as number | undefined;
  const message = typeof e?.message === 'string' ? e.message : '';
  const code = typeof e?.error === 'string' ? e.error : '';

  // This is the exact message users are seeing when MP can't find the resource.
  // In practice it usually happens when the Public Key is invalid/outdated or the environment is mismatched.
  if (status === 404 && code.toLowerCase() === 'resource not found' && message.includes('developers.mercadopago.com')) {
    return 'Não foi possível validar o cartão agora. A configuração do pagamento (chave pública) pode estar incorreta. Tente novamente; se persistir, precisamos atualizar a chave pública do Mercado Pago.';
  }

  if (message) return message;
  return 'Não foi possível validar o cartão. Verifique os dados e tente novamente.';
}
