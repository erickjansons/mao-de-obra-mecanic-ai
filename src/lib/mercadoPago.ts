export const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-da03d4fc-17e8-4e98-8873-47a6fc781dad';

export type MercadoPagoLikeError = {
  status?: number;
  statusCode?: number;
  error?: unknown;
  message?: unknown;
};

export function getFriendlyMercadoPagoTokenizationError(err: unknown): string {
  const e = err as MercadoPagoLikeError | null;
  const status = (e?.status ?? e?.statusCode) as number | undefined;
  const message = typeof e?.message === 'string' ? e.message.toLowerCase() : '';
  const code = typeof e?.error === 'string' ? e.error.toLowerCase() : '';
  const originalMessage = typeof (err as any)?.message === 'string' ? (err as any).message : '';

  // Handle "Failed to fetch" - network/CORS issues or SDK initialization problems
  if (message.includes('failed to fetch') || originalMessage.toLowerCase().includes('failed to fetch')) {
    return 'Erro de conexão com o servidor de pagamentos. Verifique sua internet e tente novamente em alguns segundos.';
  }

  // Resource not found - usually invalid/mismatched public key
  if (status === 404 && code === 'resource not found') {
    return 'Configuração de pagamento inválida. Entre em contato com o suporte.';
  }

  // Card validation errors
  if (message.includes('invalid') || message.includes('inválido')) {
    return 'Dados do cartão inválidos. Verifique o número, validade e CVV.';
  }

  if (originalMessage && !originalMessage.includes('developers.mercadopago.com')) {
    return originalMessage;
  }
  
  return 'Não foi possível validar o cartão. Verifique os dados e tente novamente.';
}
