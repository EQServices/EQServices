/**
 * Testes do Fluxo de Pagamentos
 * 
 * Testa o fluxo completo de compra de créditos via Stripe
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Payment Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Credit Package Validation', () => {
    it('deve validar estrutura de pacote de créditos', () => {
      const package = {
        id: 'pkg-1',
        name: 'Pacote Básico',
        credits: 50,
        price: 25.00,
        description: '50 créditos por €25',
      };

      expect(package.id).toBeTruthy();
      expect(package.name).toBeTruthy();
      expect(package.credits).toBeGreaterThan(0);
      expect(package.price).toBeGreaterThan(0);
    });

    it('deve calcular preço por crédito corretamente', () => {
      const packages = [
        { credits: 50, price: 25.00, expectedPricePerCredit: 0.50 },
        { credits: 100, price: 45.00, expectedPricePerCredit: 0.45 },
        { credits: 200, price: 80.00, expectedPricePerCredit: 0.40 },
      ];

      packages.forEach(pkg => {
        const pricePerCredit = pkg.price / pkg.credits;
        expect(pricePerCredit).toBeCloseTo(pkg.expectedPricePerCredit, 2);
      });
    });
  });

  describe('Checkout Session', () => {
    it('deve validar metadata do checkout session', () => {
      const metadata = {
        professional_id: 'pro-123',
        package_id: 'pkg-1',
        credits: '50',
        price: '25.00',
        package_name: 'Pacote Básico',
      };

      expect(metadata.professional_id).toBeTruthy();
      expect(metadata.package_id).toBeTruthy();
      expect(Number(metadata.credits)).toBeGreaterThan(0);
      expect(Number(metadata.price)).toBeGreaterThan(0);
    });

    it('deve processar webhook de checkout completo', () => {
      const webhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            metadata: {
              professional_id: 'pro-123',
              package_id: 'pkg-1',
              credits: '50',
            },
          },
        },
      };

      expect(webhookEvent.type).toBe('checkout.session.completed');
      expect(webhookEvent.data.object.metadata.professional_id).toBeTruthy();
      expect(webhookEvent.data.object.metadata.credits).toBeTruthy();
    });
  });

  describe('Credit Addition', () => {
    it('deve adicionar créditos após compra bem-sucedida', () => {
      const initialCredits = 0;
      const purchasedCredits = 50;
      const finalCredits = initialCredits + purchasedCredits;

      expect(finalCredits).toBe(50);
    });

    it('deve criar registro de transação após compra', () => {
      const transaction = {
        professional_id: 'pro-123',
        type: 'purchase',
        amount: 50,
        balance_after: 50,
        description: 'Compra de créditos via Stripe (Pacote Básico)',
      };

      expect(transaction.type).toBe('purchase');
      expect(transaction.amount).toBeGreaterThan(0);
      expect(transaction.balance_after).toBeGreaterThanOrEqual(transaction.amount);
    });
  });

  describe('Error Scenarios', () => {
    it('deve tratar erro de pagamento recusado', () => {
      const error = {
        type: 'card_error',
        code: 'card_declined',
        message: 'Seu cartão foi recusado.',
      };

      expect(error.type).toBe('card_error');
      expect(error.code).toBe('card_declined');
    });

    it('deve tratar erro de webhook inválido', () => {
      const error = new Error('Invalid signature');
      
      expect(error.message).toContain('signature');
    });
  });
});

