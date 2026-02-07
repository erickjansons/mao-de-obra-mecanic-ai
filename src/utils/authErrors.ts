/**
 * Translates common Supabase/auth error messages to Portuguese.
 */
export const translateAuthError = (message: string): string => {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
    'User already registered': 'Este email já está cadastrado',
    'Signup requires a valid password': 'É necessário uma senha válida para cadastro',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'Email rate limit exceeded': 'Muitas tentativas. Tente novamente mais tarde',
    'For security purposes, you can only request this once every 60 seconds': 'Por segurança, você só pode solicitar isso uma vez a cada 60 segundos',
    'New password should be different from the old password.': 'A nova senha deve ser diferente da senha atual',
    'Auth session missing!': 'Sessão expirada. Faça login novamente',
    'Token has expired or is invalid': 'Link expirado ou inválido. Solicite um novo',
    'User not found': 'Usuário não encontrado',
    'Email link is invalid or has expired': 'Link inválido ou expirado. Solicite um novo',
    'Too many requests': 'Muitas tentativas. Aguarde um momento e tente novamente',
    'Network error': 'Erro de conexão. Verifique sua internet',
  };

  // Check for exact match
  if (translations[message]) {
    return translations[message];
  }

  // Check for partial matches
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('already registered') || lowerMessage.includes('already been registered')) {
    return 'Este email já está cadastrado';
  }
  if (lowerMessage.includes('invalid login')) {
    return 'Email ou senha incorretos';
  }
  if (lowerMessage.includes('email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada';
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return 'Muitas tentativas. Aguarde um momento e tente novamente';
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet';
  }
  if (lowerMessage.includes('session') && (lowerMessage.includes('missing') || lowerMessage.includes('expired'))) {
    return 'Sessão expirada. Faça login novamente';
  }
  if (lowerMessage.includes('token') && (lowerMessage.includes('expired') || lowerMessage.includes('invalid'))) {
    return 'Link expirado ou inválido. Solicite um novo';
  }
  if (lowerMessage.includes('password') && lowerMessage.includes('different')) {
    return 'A nova senha deve ser diferente da senha atual';
  }
  if (lowerMessage.includes('weak password') || lowerMessage.includes('password') && lowerMessage.includes('short')) {
    return 'A senha é muito fraca. Use pelo menos 6 caracteres';
  }

  // Return original if no translation found
  return message;
};
