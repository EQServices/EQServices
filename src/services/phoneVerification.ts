import { supabase } from '../config/supabase';

/**
 * Envia código de verificação SMS para o telefone
 * Nota: Requer configuração de provedor SMS no Supabase (Twilio, etc.)
 */
export const sendPhoneVerificationCode = async (phone: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Formatar telefone para formato internacional (Portugal: +351)
    const formattedPhone = phone.startsWith('+') ? phone : `+351${phone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      console.error('Erro ao enviar código SMS:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar código SMS:', error);
    return { success: false, error: error.message || 'Erro ao enviar código SMS' };
  }
};

/**
 * Verifica o código SMS enviado
 */
export const verifyPhoneCode = async (phone: string, code: string): Promise<{ success: boolean; error?: string } => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+351${phone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: code,
      type: 'sms',
    });

    if (error) {
      console.error('Erro ao verificar código SMS:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao verificar código SMS:', error);
    return { success: false, error: error.message || 'Erro ao verificar código SMS' };
  }
};

/**
 * Verifica se o telefone do usuário está verificado
 */
export const isPhoneVerified = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.phone_confirmed_at !== null;
  } catch (error) {
    console.error('Erro ao verificar status do telefone:', error);
    return false;
  }
};

/**
 * Atualiza o telefone do usuário e envia código de verificação
 */
export const updatePhoneAndSendCode = async (phone: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+351${phone}`;

    const { error } = await supabase.auth.updateUser({
      phone: formattedPhone,
    });

    if (error) {
      console.error('Erro ao atualizar telefone:', error);
      return { success: false, error: error.message };
    }

    // Enviar código de verificação
    return await sendPhoneVerificationCode(formattedPhone);
  } catch (error: any) {
    console.error('Erro ao atualizar telefone:', error);
    return { success: false, error: error.message || 'Erro ao atualizar telefone' };
  }
};

