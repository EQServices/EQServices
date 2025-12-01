import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

/**
 * Envia email de verificação para o usuário
 */
export const sendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      console.error('Erro ao enviar email de verificação:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar email de verificação:', error);
    return { success: false, error: error.message || 'Erro ao enviar email de verificação' };
  }
};

/**
 * Verifica se o email do usuário está verificado
 */
export const isEmailVerified = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email_confirmed_at !== null;
  } catch (error) {
    console.error('Erro ao verificar status do email:', error);
    return false;
  }
};

/**
 * Envia email de redefinição de senha
 */
export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Usar a URL base do site para o redirect
    const baseUrl = Platform.OS === 'web' 
      ? (globalThis as any).window?.location?.origin || 'https://elastiquality.pt'
      : 'https://elastiquality.pt';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/Login`,
    });

    if (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar email de redefinição:', error);
    return { success: false, error: error.message || 'Erro ao enviar email de redefinição' };
  }
};

/**
 * Verifica o token de verificação de email
 */
export const verifyEmailToken = async (token: string, type: 'signup' | 'recovery' | 'invite' | 'email_change' = 'signup'): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type,
    });

    if (error) {
      console.error('Erro ao verificar token:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao verificar token:', error);
    return { success: false, error: error.message || 'Erro ao verificar token' };
  }
};

