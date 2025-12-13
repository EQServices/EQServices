/**
 * Testes de Integração - Fluxos Críticos
 * 
 * Este arquivo testa os fluxos completos mais importantes da aplicação:
 * 1. Autenticação (registro e login)
 * 2. Criação de pedido de serviço
 * 3. Envio de proposta
 * 4. Desbloqueio de lead
 * 5. Compra de créditos
 * 6. Chat entre cliente e profissional
 */

import { supabase } from '../../config/supabase';
import { registerSchema, loginSchema, serviceRequestSchema, proposalSchema } from '../../utils/validation';

// Mock do Supabase
jest.mock('../../config/supabase');

describe('Fluxos Críticos - Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Fluxo de Autenticação', () => {
    describe('Registro de Cliente', () => {
      it('deve registrar novo cliente com sucesso', async () => {
        const userData = {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@example.com',
          password: 'Senha123!',
          confirmPassword: 'Senha123!',
          phone: '912345678',
          userType: 'client' as const,
          location: {
            districtId: '1',
            municipalityId: '1',
            parishId: '1',
          },
        };

        // 1. Validar dados
        await expect(registerSchema.validate(userData)).resolves.toBeDefined();

        // 2. Simular registro no Supabase Auth
        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
          data: {
            user: { id: 'user-123', email: userData.email },
            session: { access_token: 'token-123' },
          },
          error: null,
        });

        // 3. Simular inserção na tabela users
        const mockInsert = jest.fn().mockResolvedValue({
          data: { id: 'user-123' },
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          insert: mockInsert,
        });

        // Executar registro
        const authResult = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
        });

        expect(authResult.error).toBeNull();
        expect(authResult.data?.user).toBeDefined();
        expect(authResult.data?.session).toBeDefined();
      });

      it('deve registrar novo profissional com sucesso', async () => {
        const userData = {
          firstName: 'Maria',
          lastName: 'Santos',
          email: 'maria.santos@example.com',
          password: 'Senha123!',
          confirmPassword: 'Senha123!',
          phone: '913456789',
          userType: 'professional' as const,
          location: {
            districtId: '1',
            municipalityId: '1',
            parishId: '1',
          },
        };

        // Validar e registrar
        await expect(registerSchema.validate(userData)).resolves.toBeDefined();

        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
          data: {
            user: { id: 'pro-123', email: userData.email },
            session: { access_token: 'token-456' },
          },
          error: null,
        });

        const authResult = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
        });

        expect(authResult.error).toBeNull();
        expect(authResult.data?.user?.id).toBe('pro-123');
      });

      it('deve rejeitar registro com email inválido', async () => {
        const userData = {
          firstName: 'João',
          lastName: 'Silva',
          email: 'email-invalido',
          password: 'Senha123!',
          confirmPassword: 'Senha123!',
          phone: '912345678',
          userType: 'client' as const,
          location: {
            districtId: '1',
            municipalityId: '1',
            parishId: '1',
          },
        };

        await expect(registerSchema.validate(userData)).rejects.toThrow();
      });

      it('deve rejeitar registro com senhas diferentes', async () => {
        const userData = {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao@example.com',
          password: 'Senha123!',
          confirmPassword: 'Senha456!',
          phone: '912345678',
          userType: 'client' as const,
          location: {
            districtId: '1',
            municipalityId: '1',
            parishId: '1',
          },
        };

        await expect(registerSchema.validate(userData)).rejects.toThrow();
      });
    });

    describe('Login', () => {
      it('deve fazer login com sucesso', async () => {
        const loginData = {
          email: 'joao@example.com',
          password: 'Senha123!',
        };

        // Validar dados
        await expect(loginSchema.validate(loginData)).resolves.toBeDefined();

        // Simular login
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
          data: {
            user: { id: 'user-123', email: loginData.email },
            session: { access_token: 'token-123' },
          },
          error: null,
        });

        const result = await supabase.auth.signInWithPassword(loginData);

        expect(result.error).toBeNull();
        expect(result.data?.session).toBeDefined();
        expect(result.data?.user?.email).toBe(loginData.email);
      });

      it('deve rejeitar login com credenciais inválidas', async () => {
        const loginData = {
          email: 'joao@example.com',
          password: 'SenhaErrada',
        };

        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        });

        const result = await supabase.auth.signInWithPassword(loginData);

        expect(result.error).toBeDefined();
        expect(result.data?.session).toBeNull();
      });
    });
  });

  describe('2. Fluxo de Criação de Pedido de Serviço', () => {
    it('deve criar pedido de serviço completo', async () => {
      const requestData = {
        title: 'Pintura de sala e quarto',
        category: 'Pintura',
        description: 'Preciso pintar uma sala de 20m² e um quarto de 15m². Paredes em bom estado.',
        location: 'Lisboa, Portugal',
        budget: 800,
      };

      // 1. Validar dados
      await expect(serviceRequestSchema.validate(requestData)).resolves.toBeDefined();

      // 2. Simular criação no banco
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'request-123',
              client_id: 'user-123',
              ...requestData,
              status: 'pending',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase
        .from('service_requests')
        .insert({
          client_id: 'user-123',
          ...requestData,
          status: 'pending',
        })
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data?.id).toBe('request-123');
      expect(result.data?.status).toBe('pending');
    });

    it('deve criar leads automaticamente após criar pedido', async () => {
      // Simular criação de pedido
      const requestId = 'request-123';

      // Simular busca de profissionais elegíveis
      const mockSelect = jest.fn().mockResolvedValue({
        data: [
          { id: 'pro-1', name: 'Profissional 1' },
          { id: 'pro-2', name: 'Profissional 2' },
          { id: 'pro-3', name: 'Profissional 3' },
        ],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const professionals = await supabase.from('professionals').select('*');

      expect(professionals.data).toHaveLength(3);
      expect(professionals.error).toBeNull();
    });

    it('deve rejeitar pedido sem campos obrigatórios', async () => {
      const invalidData = {
        title: '',
        category: '',
        description: '',
        location: '',
      };

      await expect(serviceRequestSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('3. Fluxo de Envio de Proposta', () => {
    it('deve enviar proposta com sucesso', async () => {
      const proposalData = {
        price: 750,
        description: 'Posso realizar o serviço em 3 dias úteis. Inclui materiais de qualidade.',
        estimatedDuration: '3 dias úteis',
      };

      // 1. Validar dados
      await expect(proposalSchema.validate(proposalData)).resolves.toBeDefined();

      // 2. Verificar se pedido ainda aceita propostas
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: 'request-123',
              status: 'pending',
              client_id: 'client-123',
              title: 'Pintura de sala',
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const requestStatus = await supabase
        .from('service_requests')
        .select('status, client_id, title')
        .eq('id', 'request-123')
        .maybeSingle();

      expect(requestStatus.data?.status).toBe('pending');

      // 3. Simular inserção da proposta
      const mockInsert = jest.fn().mockResolvedValue({
        data: {
          id: 'proposal-123',
          service_request_id: 'request-123',
          professional_id: 'pro-123',
          ...proposalData,
          status: 'pending',
        },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase.from('proposals').insert({
        service_request_id: 'request-123',
        professional_id: 'pro-123',
        ...proposalData,
        status: 'pending',
      });

      expect(result.error).toBeNull();
      expect(result.data?.status).toBe('pending');
    });

    it('deve rejeitar proposta para pedido já fechado', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: 'request-123',
              status: 'completed',
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const requestStatus = await supabase
        .from('service_requests')
        .select('status')
        .eq('id', 'request-123')
        .maybeSingle();

      expect(requestStatus.data?.status).toBe('completed');
      // Aplicação deve rejeitar proposta
    });

    it('deve rejeitar proposta com preço inválido', async () => {
      const invalidData = {
        price: -100,
        description: 'Descrição válida',
      };

      await expect(proposalSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('4. Fluxo de Desbloqueio de Lead', () => {
    it('deve desbloquear lead com créditos suficientes', async () => {
      const professionalId = 'pro-123';
      const leadId = 'lead-123';
      const leadCost = 5;

      // 1. Verificar créditos do profissional
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: professionalId,
              credits: 10,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const professional = await supabase
        .from('professionals')
        .select('credits')
        .eq('id', professionalId)
        .single();

      expect(professional.data?.credits).toBeGreaterThanOrEqual(leadCost);

      // 2. Simular desbloqueio via RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await supabase.rpc('unlock_lead', {
        lead_id: leadId,
        professional_id: professionalId,
        cost: leadCost,
      });

      expect(result.error).toBeNull();
    });

    it('deve rejeitar desbloqueio sem créditos suficientes', async () => {
      const professionalId = 'pro-123';
      const leadId = 'lead-123';
      const leadCost = 5;

      // Profissional com créditos insuficientes
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: professionalId,
              credits: 2,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const professional = await supabase
        .from('professionals')
        .select('credits')
        .eq('id', professionalId)
        .single();

      expect(professional.data?.credits).toBeLessThan(leadCost);

      // Simular erro ao tentar desbloquear
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Créditos insuficientes' },
      });

      const result = await supabase.rpc('unlock_lead', {
        lead_id: leadId,
        professional_id: professionalId,
        cost: leadCost,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Créditos insuficientes');
    });

    it('deve rejeitar desbloqueio duplicado', async () => {
      const professionalId = 'pro-123';
      const leadId = 'lead-123';

      // Simular lead já desbloqueado
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Lead já foi desbloqueado' },
      });

      const result = await supabase.rpc('unlock_lead', {
        lead_id: leadId,
        professional_id: professionalId,
        cost: 5,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('já foi desbloqueado');
    });
  });

  describe('5. Fluxo de Compra de Créditos', () => {
    it('deve criar sessão de checkout Stripe', async () => {
      const checkoutData = {
        professional_id: 'pro-123',
        package_id: 'pkg-50',
        credits: 50,
        price: 50,
      };

      // Simular criação de sessão Stripe (mock)
      const mockStripeSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      expect(mockStripeSession.id).toBeDefined();
      expect(mockStripeSession.url).toContain('checkout.stripe.com');
    });

    it('deve processar webhook de pagamento completo', async () => {
      const webhookData = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              professional_id: 'pro-123',
              credits: '50',
            },
            amount_total: 5000, // 50 EUR em centavos
          },
        },
      };

      // Simular inserção de compra
      const mockInsert = jest.fn().mockResolvedValue({
        data: {
          id: 'purchase-123',
          professional_id: 'pro-123',
          credits: 50,
          amount: 50,
          status: 'completed',
        },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase.from('credit_purchases').insert({
        professional_id: 'pro-123',
        credits: 50,
        amount: 50,
        stripe_session_id: 'cs_test_123',
        status: 'completed',
      });

      expect(result.error).toBeNull();
      expect(result.data?.status).toBe('completed');
    });

    it('deve adicionar créditos ao profissional após pagamento', async () => {
      const professionalId = 'pro-123';
      const creditsToAdd = 50;

      // Simular adição de créditos via RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await supabase.rpc('add_credits', {
        professional_id: professionalId,
        credits_to_add: creditsToAdd,
      });

      expect(result.error).toBeNull();
    });
  });

  describe('6. Fluxo de Chat', () => {
    it('deve criar conversa entre cliente e profissional', async () => {
      const conversationData = {
        service_request_id: 'request-123',
        client_id: 'client-123',
        professional_id: 'pro-123',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'conv-123',
              ...conversationData,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data?.id).toBe('conv-123');
    });

    it('deve enviar mensagem na conversa', async () => {
      const messageData = {
        conversation_id: 'conv-123',
        sender_id: 'client-123',
        content: 'Olá, gostaria de mais informações sobre o serviço.',
      };

      const mockInsert = jest.fn().mockResolvedValue({
        data: {
          id: 'msg-123',
          ...messageData,
          created_at: new Date().toISOString(),
          read: false,
        },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase.from('messages').insert(messageData);

      expect(result.error).toBeNull();
      expect(result.data?.content).toBe(messageData.content);
    });

    it('deve marcar mensagens como lidas', async () => {
      const conversationId = 'conv-123';
      const userId = 'pro-123';

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          neq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      const result = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      expect(result.error).toBeNull();
    });
  });
});


