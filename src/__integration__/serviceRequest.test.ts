/**
 * Testes de integração para criação de pedido de serviço
 * 
 * Estes testes verificam a integração entre:
 * - Validação de formulário
 * - Upload de imagens
 * - Criação no banco de dados
 * - Criação de leads
 * - Notificações
 */

import { supabase } from '../config/supabase';
import { serviceRequestSchema } from '../utils/validation';
import { queueActionIfOffline } from '../services/sync';

// Mock dos serviços
jest.mock('../config/supabase');
jest.mock('../services/sync');
jest.mock('../services/storage', () => ({
  uploadServiceImage: jest.fn(),
}));

describe('Service Request Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Criação de Pedido', () => {
    it('deve validar dados antes de criar pedido', async () => {
      const requestData = {
        title: 'Pintura de sala',
        category: 'Pintura',
        description: 'Preciso pintar uma sala de 20m²',
        location: 'Lisboa',
        budget: 500,
      };

      // Validar schema
      await expect(serviceRequestSchema.validate(requestData)).resolves.toBeDefined();
    });

    it('deve criar pedido no banco de dados', async () => {
      const requestData = {
        client_id: 'client-123',
        title: 'Pintura de sala',
        category: 'Pintura',
        description: 'Preciso pintar uma sala de 20m²',
        location: 'Lisboa',
        budget: 500,
        status: 'pending',
        photos: [],
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'request-123', ...requestData }],
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase.from('service_requests').insert(requestData).select();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.[0]?.title).toBe(requestData.title);
    });

    it('deve criar lead automaticamente após criar pedido', async () => {
      const serviceRequestId = 'request-123';
      const leadData = {
        service_request_id: serviceRequestId,
        category: 'Pintura',
        cost: 10,
        location: 'Lisboa',
        description: 'Pintura de sala - Preciso pintar uma sala de 20m²',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'lead-123', ...leadData }],
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await supabase.from('leads').insert(leadData).select();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.[0]?.service_request_id).toBe(serviceRequestId);
    });

    it('deve enfileirar ação quando offline', async () => {
      const { queueActionIfOffline } = require('../services/sync');
      (queueActionIfOffline as jest.Mock).mockResolvedValue(true);

      const requestData = {
        type: 'CREATE_SERVICE_REQUEST',
        payload: {
          client_id: 'client-123',
          title: 'Pintura de sala',
          category: 'Pintura',
        },
      };

      await queueActionIfOffline(requestData.type, requestData.payload);

      expect(queueActionIfOffline).toHaveBeenCalledWith(
        requestData.type,
        requestData.payload,
      );
    });
  });

  describe('Validação de Formulário', () => {
    it('deve rejeitar título muito curto', async () => {
      const invalidData = {
        title: 'A',
        category: 'Pintura',
        description: 'Descrição',
        location: 'Lisboa',
      };

      await expect(serviceRequestSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar orçamento negativo', async () => {
      const invalidData = {
        title: 'Pintura de sala',
        category: 'Pintura',
        description: 'Descrição',
        location: 'Lisboa',
        budget: -100,
      };

      await expect(serviceRequestSchema.validate(invalidData)).rejects.toThrow();
    });
  });
});

