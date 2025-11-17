import {
  sanitizeHtml,
  sanitizeAlphanumeric,
  sanitizeNumeric,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
} from '../sanitize';

describe('sanitize', () => {
  describe('sanitizeHtml', () => {
    it('deve remover tags HTML', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('deve escapar caracteres perigosos', () => {
      expect(sanitizeHtml('<div>test</div>')).toBe('&lt;div&gt;test&lt;&#x2F;div&gt;');
      expect(sanitizeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(sanitizeHtml("'single'")).toBe('&#x27;single&#x27;');
    });
  });

  describe('sanitizeAlphanumeric', () => {
    it('deve manter apenas letras, números e espaços', () => {
      expect(sanitizeAlphanumeric('abc123 DEF!@#')).toBe('abc123 DEF');
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(sanitizeAlphanumeric('')).toBe('');
    });
  });

  describe('sanitizeNumeric', () => {
    it('deve manter apenas números', () => {
      expect(sanitizeNumeric('abc123def456')).toBe('123456');
      expect(sanitizeNumeric('(123) 456-7890')).toBe('1234567890');
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(sanitizeNumeric('')).toBe('');
    });
  });

  describe('sanitizeName', () => {
    it('deve manter letras, espaços e caracteres acentuados', () => {
      expect(sanitizeName('João Silva')).toBe('João Silva');
      expect(sanitizeName('Maria José')).toBe('Maria José');
      expect(sanitizeName('José-Maria')).toBe('José-Maria');
    });

    it('deve remover caracteres especiais', () => {
      expect(sanitizeName('João@Silva')).toBe('JoãoSilva');
      expect(sanitizeName('João123')).toBe('João');
    });

    it('deve normalizar espaços múltiplos', () => {
      expect(sanitizeName('João    Silva')).toBe('João Silva');
    });

    it('deve remover espaços no início e fim', () => {
      expect(sanitizeName('  João Silva  ')).toBe('João Silva');
    });
  });

  describe('sanitizeEmail', () => {
    it('deve manter formato válido de email', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
    });

    it('deve remover caracteres perigosos', () => {
      expect(sanitizeEmail('test<script>@example.com')).toBe('testscript@example.com');
    });

    it('deve converter para lowercase', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('deve manter apenas dígitos', () => {
      expect(sanitizePhone('(123) 456-7890')).toBe('1234567890');
      expect(sanitizePhone('+351 912 345 678')).toBe('351912345678');
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('deve remover tags HTML e caracteres perigosos', () => {
      expect(sanitizeText('<p>Hello</p>')).toBe('Hello');
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('deve normalizar espaços', () => {
      expect(sanitizeText('Hello    World')).toBe('Hello World');
    });

    it('deve remover espaços no início e fim', () => {
      expect(sanitizeText('  Hello World  ')).toBe('Hello World');
    });
  });
});

