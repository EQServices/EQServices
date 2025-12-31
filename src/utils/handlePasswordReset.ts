import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

/**
 * Processa o token de reset de senha quando vem via query parameters
 * O Supabase às vezes envia o link como: /auth/v1/verify?token=...&type=recovery&redirect_to=...
 */
export const handlePasswordResetFromQuery = async (): Promise<boolean> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const type = urlParams.get('type');
  const hash = window.location.hash;
  const pathname = window.location.pathname;

  // Verificar se há erro no hash
  if (hash && hash.includes('error=')) {
    console.log('Erro detectado no hash da URL:', hash);
    // Redirecionar para reset-password mesmo com erro para mostrar mensagem amigável
    const resetUrl = `${window.location.origin}/reset-password`;
    window.location.href = resetUrl;
    return true;
  }

  // Verificar se é um link de recovery (query parameters OU hash)
  const hasRecoveryToken = (token && type === 'recovery') || 
                          (hash && hash.includes('access_token') && hash.includes('type=recovery'));

  // Verificar se é um magic link (query parameters OU hash)
  const hasMagicLink = (token && type === 'magiclink') ||
                       (hash && hash.includes('access_token') && hash.includes('type=magiclink'));

  if (hasRecoveryToken) {
    try {
      console.log('Processando token de recovery detectado na URL');

      // Se há token nos query parameters, verificar primeiro
      if (token && type === 'recovery') {
        console.log('Token encontrado nos query parameters, verificando...');
        
        // Verificar o token usando verifyOtp
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (error) {
          console.error('Erro ao verificar token:', error);
          // Mesmo com erro, tentar redirecionar para reset-password
          // O usuário pode tentar novamente lá
          const resetUrl = `${window.location.origin}/reset-password`;
          window.location.href = resetUrl;
          return true;
        }

        if (data) {
          console.log('Token verificado com sucesso');
        }
      }

      // Aguardar um pouco para o Supabase processar (se veio via hash)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se há sessão criada
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Sessão criada, redirecionando para reset-password');
        const resetUrl = `${window.location.origin}/reset-password`;
        window.location.href = resetUrl;
        return true;
      } else {
        // Mesmo sem sessão, redirecionar para reset-password
        // A tela de reset tentará processar novamente
        console.log('Redirecionando para reset-password (sessão será verificada lá)');
        const resetUrl = `${window.location.origin}/reset-password?token=${token || ''}&type=recovery`;
        window.location.href = resetUrl;
        return true;
      }
    } catch (err) {
      console.error('Erro ao processar token de recovery:', err);
      // Mesmo com erro, redirecionar para reset-password
      const resetUrl = `${window.location.origin}/reset-password`;
      window.location.href = resetUrl;
      return true;
    }
  }

  // Se é magic link, verificar e processar
  if (hasMagicLink) {
    try {
      console.log('Magic link detectado na URL');

      // Se há token nos query parameters, verificar primeiro
      if (token && type === 'magiclink') {
        console.log('Token de magic link encontrado nos query parameters, verificando...');
        
        // Verificar o token usando verifyOtp
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'magiclink',
        });

        if (error) {
          console.error('Erro ao verificar magic link:', error);
          // Redirecionar para login mesmo com erro
          const loginUrl = `${window.location.origin}/login`;
          window.location.href = loginUrl;
          return true;
        }

        if (data) {
          console.log('Magic link verificado com sucesso');
        }
      }

      // Aguardar um pouco para o Supabase processar (se veio via hash)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se há sessão criada
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Sessão criada via magic link, redirecionando para home');
        // Limpar hash/query da URL antes de redirecionar
        window.history.replaceState({}, '', '/');
        // Recarregar a página para aplicar a nova sessão
        window.location.reload();
        return true;
      } else {
        // Mesmo sem sessão, tentar redirecionar para login
        console.log('Magic link não criou sessão, redirecionando para login');
        const loginUrl = `${window.location.origin}/login`;
        window.location.href = loginUrl;
        return true;
      }
    } catch (err) {
      console.error('Erro ao processar magic link:', err);
      const loginUrl = `${window.location.origin}/login`;
      window.location.href = loginUrl;
      return true;
    }
  }

  // Se chegou na raiz após um redirect do Supabase (hash vazio ou apenas #)
  // e não há token, pode ser que o Supabase já processou mas não redirecionou corretamente
  if ((pathname === '/' || pathname === '') && (hash === '' || hash === '#') && !token) {
    // Verificar se há sessão recente (pode ter sido criada pelo Supabase)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Sessão detectada na raiz após redirect, recarregando página');
      // Recarregar para aplicar a sessão
      window.location.reload();
      return true;
    }
  }

  return false;
};

