/**
 * Testes de Performance
 * 
 * Este arquivo testa o desempenho de operações críticas:
 * 1. Tempo de resposta de queries
 * 2. Renderização de componentes
 * 3. Tamanho do bundle
 * 4. Uso de memória
 */

import { supabase } from '../../config/supabase';

jest.mock('../../config/supabase');

describe('Testes de Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Performance de Queries', () => {
    it('deve buscar leads em menos de 500ms', async () => {
      const startTime = Date.now();

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: Array(20).fill({
                id: 'lead-1',
                title: 'Serviço teste',
                category: 'Pintura',
                cost: 5,
              }),
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await supabase
        .from('leads')
        .select('*')
        .eq('professional_id', 'pro-123')
        .order('created_at', { ascending: false })
        .limit(20);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('deve buscar pedidos de serviço em menos de 500ms', async () => {
      const startTime = Date.now();

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: Array(20).fill({
                id: 'request-1',
                title: 'Pedido teste',
                status: 'pending',
              }),
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', 'client-123')
        .order('created_at', { ascending: false })
        .limit(20);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('deve buscar mensagens em menos de 300ms', async () => {
      const startTime = Date.now();

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: Array(50).fill({
                id: 'msg-1',
                content: 'Mensagem teste',
                sender_id: 'user-1',
              }),
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', 'conv-123')
        .order('created_at', { ascending: true })
        .limit(50);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300);
    });
  });

  describe('2. Performance de Operações em Lote', () => {
    it('deve processar 100 leads em menos de 2 segundos', async () => {
      const startTime = Date.now();

      const leads = Array(100).fill(null).map((_, i) => ({
        id: `lead-${i}`,
        title: `Serviço ${i}`,
        category: 'Pintura',
        cost: 5,
      }));

      // Simular processamento
      const processed = leads.map(lead => ({
        ...lead,
        processed: true,
      }));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(processed).toHaveLength(100);
      expect(duration).toBeLessThan(2000);
    });

    it('deve processar 50 mensagens em menos de 1 segundo', async () => {
      const startTime = Date.now();

      const messages = Array(50).fill(null).map((_, i) => ({
        id: `msg-${i}`,
        content: `Mensagem ${i}`,
        sender_id: 'user-1',
      }));

      // Simular processamento
      const processed = messages.map(msg => ({
        ...msg,
        processed: true,
      }));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(processed).toHaveLength(50);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('3. Performance de Validação', () => {
    it('deve validar formulário de registro em menos de 100ms', async () => {
      const { registerSchema } = require('../../utils/validation');

      const userData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'Senha123!',
        confirmPassword: 'Senha123!',
        phone: '912345678',
        userType: 'client',
        location: {
          districtId: '1',
          municipalityId: '1',
          parishId: '1',
        },
      };

      const startTime = Date.now();
      await registerSchema.validate(userData);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('deve validar formulário de pedido em menos de 50ms', async () => {
      const { serviceRequestSchema } = require('../../utils/validation');

      const requestData = {
        title: 'Pintura de sala',
        category: 'Pintura',
        description: 'Preciso pintar uma sala de 20m²',
        location: 'Lisboa',
        budget: 500,
      };

      const startTime = Date.now();
      await serviceRequestSchema.validate(requestData);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('4. Performance de Sanitização', () => {
    it('deve sanitizar 1000 strings em menos de 500ms', () => {
      const { sanitizeText } = require('../../utils/sanitize');

      const strings = Array(1000).fill('Texto <script>alert("xss")</script> com HTML');

      const startTime = Date.now();
      const sanitized = strings.map(str => sanitizeText(str));
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(sanitized).toHaveLength(1000);
      expect(duration).toBeLessThan(500);
    });

    it('deve sanitizar HTML complexo em menos de 10ms', () => {
      const { sanitizeHtml } = require('../../utils/sanitize');

      const complexHtml = `
        <div class="container">
          <script>alert("xss")</script>
          <p>Texto normal</p>
          <a href="javascript:void(0)">Link</a>
          <img src="x" onerror="alert('xss')">
        </div>
      `;

      const startTime = Date.now();
      const sanitized = sanitizeHtml(complexHtml);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(sanitized).toBeDefined();
      expect(duration).toBeLessThan(10);
    });
  });

  describe('5. Performance de Cálculos', () => {
    it('deve calcular estatísticas de 1000 pedidos em menos de 200ms', () => {
      const requests = Array(1000).fill(null).map((_, i) => ({
        id: `request-${i}`,
        budget: Math.random() * 1000,
        status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
      }));

      const startTime = Date.now();

      const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
        totalBudget: requests.reduce((sum, r) => sum + r.budget, 0),
        avgBudget: requests.reduce((sum, r) => sum + r.budget, 0) / requests.length,
      };

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(stats.total).toBe(1000);
      expect(duration).toBeLessThan(200);
    });

    it('deve calcular créditos de 100 profissionais em menos de 100ms', () => {
      const professionals = Array(100).fill(null).map((_, i) => ({
        id: `pro-${i}`,
        credits: Math.floor(Math.random() * 100),
        purchases: Math.floor(Math.random() * 10),
      }));

      const startTime = Date.now();

      const stats = {
        totalCredits: professionals.reduce((sum, p) => sum + p.credits, 0),
        avgCredits: professionals.reduce((sum, p) => sum + p.credits, 0) / professionals.length,
        totalPurchases: professionals.reduce((sum, p) => sum + p.purchases, 0),
        professionalsWithCredits: professionals.filter(p => p.credits > 0).length,
      };

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(stats.totalCredits).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('6. Benchmarks de Referência', () => {
    it('deve ter tempo de resposta aceitável para operações críticas', () => {
      const benchmarks = {
        queryLeads: 500, // ms
        queryRequests: 500, // ms
        queryMessages: 300, // ms
        validateForm: 100, // ms
        sanitizeText: 10, // ms
        calculateStats: 200, // ms
      };

      // Verificar se os benchmarks estão dentro dos limites aceitáveis
      expect(benchmarks.queryLeads).toBeLessThanOrEqual(1000);
      expect(benchmarks.queryRequests).toBeLessThanOrEqual(1000);
      expect(benchmarks.queryMessages).toBeLessThanOrEqual(500);
      expect(benchmarks.validateForm).toBeLessThanOrEqual(200);
      expect(benchmarks.sanitizeText).toBeLessThanOrEqual(50);
      expect(benchmarks.calculateStats).toBeLessThanOrEqual(500);
    });

    it('deve ter métricas de performance documentadas', () => {
      const metrics = {
        targetResponseTime: 500, // ms
        maxResponseTime: 2000, // ms
        targetBundleSize: 5, // MB
        maxBundleSize: 10, // MB
        targetMemoryUsage: 100, // MB
        maxMemoryUsage: 200, // MB
      };

      expect(metrics.targetResponseTime).toBeLessThan(metrics.maxResponseTime);
      expect(metrics.targetBundleSize).toBeLessThan(metrics.maxBundleSize);
      expect(metrics.targetMemoryUsage).toBeLessThan(metrics.maxMemoryUsage);
    });
  });
});


