import {
  registerSchema,
  loginSchema,
  profileSchema,
  serviceRequestSchema,
  proposalSchema,
} from '../validation';

describe('validation schemas', () => {
  describe('registerSchema', () => {
    it('deve validar dados corretos', async () => {
      const validData = {
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

      await expect(registerSchema.validate(validData)).resolves.toBeDefined();
    });

    it('deve rejeitar email inválido', async () => {
      const invalidData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'email-invalido',
        password: 'Senha123',
        confirmPassword: 'Senha123',
        userType: 'client',
        location: {
          districtId: '1',
          municipalityId: '1',
          parishId: '1',
        },
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar senha muito curta', async () => {
      const invalidData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: '123',
        confirmPassword: '123',
        userType: 'client',
        location: {
          districtId: '1',
          municipalityId: '1',
          parishId: '1',
        },
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar senhas que não coincidem', async () => {
      const invalidData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'Senha123',
        confirmPassword: 'Senha456',
        userType: 'client',
        location: {
          districtId: '1',
          municipalityId: '1',
          parishId: '1',
        },
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar telefone inválido', async () => {
      const invalidData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
        phone: '123', // Muito curto
        userType: 'client',
        location: {
          districtId: '1',
          municipalityId: '1',
          parishId: '1',
        },
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('deve validar dados corretos', async () => {
      const validData = {
        email: 'joao@example.com',
        password: 'Senha123',
      };

      await expect(loginSchema.validate(validData)).resolves.toBeDefined();
    });

    it('deve rejeitar email inválido', async () => {
      const invalidData = {
        email: 'email-invalido',
        password: 'Senha123',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar senha vazia', async () => {
      const invalidData = {
        email: 'joao@example.com',
        password: '',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('profileSchema', () => {
    it('deve validar dados corretos', async () => {
      const validData = {
        name: 'João Silva',
        phone: '912345678',
      };

      await expect(profileSchema.validate(validData)).resolves.toBeDefined();
    });

    it('deve rejeitar nome muito curto', async () => {
      const invalidData = {
        name: 'J',
        phone: '912345678',
      };

      await expect(profileSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('serviceRequestSchema', () => {
    it('deve validar dados corretos', async () => {
      const validData = {
        title: 'Pintura de sala',
        category: 'Pintura',
        description: 'Preciso pintar uma sala',
        location: 'Lisboa',
        budget: 500,
      };

      await expect(serviceRequestSchema.validate(validData)).resolves.toBeDefined();
    });

    it('deve rejeitar título muito curto', async () => {
      const invalidData = {
        title: 'A',
        category: 'Pintura',
        description: 'Preciso pintar uma sala',
        location: 'Lisboa',
      };

      await expect(serviceRequestSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar orçamento negativo', async () => {
      const invalidData = {
        title: 'Pintura de sala',
        category: 'Pintura',
        description: 'Preciso pintar uma sala',
        location: 'Lisboa',
        budget: -100,
      };

      await expect(serviceRequestSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('proposalSchema', () => {
    it('deve validar dados corretos', async () => {
      const validData = {
        price: 500,
        description: 'Posso fazer o serviço',
        estimatedDuration: '2 semanas',
      };

      await expect(proposalSchema.validate(validData)).resolves.toBeDefined();
    });

    it('deve rejeitar preço negativo', async () => {
      const invalidData = {
        price: -100,
        description: 'Posso fazer o serviço',
        estimatedDuration: '2 semanas',
      };

      await expect(proposalSchema.validate(invalidData)).rejects.toThrow();
    });

    it('deve rejeitar descrição muito curta', async () => {
      const invalidData = {
        price: 500,
        description: 'A',
        estimatedDuration: '2 semanas',
      };

      await expect(proposalSchema.validate(invalidData)).rejects.toThrow();
    });
  });
});

