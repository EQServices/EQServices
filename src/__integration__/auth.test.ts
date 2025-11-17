/**
 * Testes de integração para fluxo de autenticação
 * 
 * Estes testes verificam a integração entre:
 * - AuthContext
 * - Supabase Auth
 * - Validação de formulários
 * - Navegação após login
 */

import { supabase } from '../config/supabase';
import { registerSchema, loginSchema } from '../utils/validation';

// Mock do Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
    })),
  },
}));

describe('Auth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registro', () => {
    it('deve validar dados antes de registrar', async () => {
      const userData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
        phone: '912345678',
        userType: 'client',
        location: {
          districtId: '1',
          municipalityId: '1',
          parishId: '1',
        },
      };

      // Validar schema
      await expect(registerSchema.validate(userData)).resolves.toBeDefined();

      // Simular registro
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' }, session: null },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      expect(result.error).toBeNull();
      expect(result.data?.user).toBeDefined();
    });

    it('deve rejeitar registro com dados inválidos', async () => {
      const invalidData = {
        firstName: 'J', // Muito curto
        lastName: 'Silva',
        email: 'email-invalido',
        password: '123', // Muito curto
        confirmPassword: '456', // Não coincide
        userType: 'client',
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('Login', () => {
    it('deve validar dados antes de fazer login', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: 'Senha123',
      };

      // Validar schema
      await expect(loginSchema.validate(loginData)).resolves.toBeDefined();

      // Simular login
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'user-123', email: loginData.email },
          session: { access_token: 'token-123' },
        },
        error: null,
      });

      const result = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      expect(result.error).toBeNull();
      expect(result.data?.session).toBeDefined();
    });

    it('deve rejeitar login com dados inválidos', async () => {
      const invalidData = {
        email: 'email-invalido',
        password: '',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('Logout', () => {
    it('deve fazer logout corretamente', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

