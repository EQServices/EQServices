/**
 * Utilitários de sanitização para prevenir XSS e limpar inputs
 */

/**
 * Remove tags HTML e caracteres perigosos
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Remove caracteres especiais, mantendo apenas letras, números e espaços
 */
export const sanitizeAlphanumeric = (input: string): string => {
  if (!input) return '';
  return input.replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Remove caracteres especiais, mantendo apenas números
 */
export const sanitizeNumeric = (input: string): string => {
  if (!input) return '';
  return input.replace(/\D/g, '');
};

/**
 * Sanitiza nome (remove caracteres especiais, mantém letras, espaços e alguns caracteres acentuados)
 */
export const sanitizeName = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Sanitiza email (remove caracteres perigosos, mantém formato válido)
 */
export const sanitizeEmail = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>\"'`]/g, '');
};

/**
 * Sanitiza telefone (remove tudo exceto números)
 */
export const sanitizePhone = (input: string): string => {
  if (!input) return '';
  return sanitizeNumeric(input);
};

/**
 * Sanitiza texto geral (remove tags HTML e caracteres perigosos)
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Sanitiza URL (valida e limpa)
 */
export const sanitizeUrl = (input: string): string => {
  if (!input) return '';
  
  try {
    const url = new URL(input);
    return url.toString();
  } catch {
    // Se não for uma URL válida, remove caracteres perigosos
    return input.replace(/[<>\"'`]/g, '');
  }
};

/**
 * Sanitiza número decimal
 */
export const sanitizeDecimal = (input: string): string => {
  if (!input) return '';
  return input.replace(/[^\d.,]/g, '').replace(',', '.');
};

/**
 * Sanitiza query de busca
 */
export const sanitizeQuery = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>\"'`]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Sanitiza objeto completo recursivamente
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T, rules?: Partial<Record<keyof T, (value: any) => any>>): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      if (rules && rules[key]) {
        sanitized[key] = rules[key](sanitized[key]);
      } else {
        sanitized[key] = sanitizeText(sanitized[key]);
      }
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key], rules);
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    }
  }
  
  return sanitized;
};

