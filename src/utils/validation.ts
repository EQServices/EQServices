import * as yup from 'yup';

// Schema de validação para registro
export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required('O primeiro nome é obrigatório')
    .min(2, 'O primeiro nome deve ter pelo menos 2 caracteres')
    .max(50, 'O primeiro nome deve ter no máximo 50 caracteres'),
  lastName: yup
    .string()
    .trim()
    .required('O último nome é obrigatório')
    .min(2, 'O último nome deve ter pelo menos 2 caracteres')
    .max(50, 'O último nome deve ter no máximo 50 caracteres'),
  email: yup
    .string()
    .trim()
    .lowercase()
    .required('O email é obrigatório')
    .email('Email inválido')
    .max(255, 'O email deve ter no máximo 255 caracteres'),
  password: yup
    .string()
    .required('A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
    ),
  confirmPassword: yup
    .string()
    .required('Confirme a senha')
    .oneOf([yup.ref('password')], 'As senhas não coincidem'),
  phone: yup
    .string()
    .trim()
    .test('phone-format', 'O telemóvel deve conter 9 dígitos numéricos', (value) => {
      if (!value || value.length === 0) return true; // Opcional
      return /^\d{9}$/.test(value);
    }),
  userType: yup.string().oneOf(['client', 'professional'], 'Tipo de usuário inválido').required(),
  location: yup.object().shape({
    districtId: yup.string().required('Selecione um distrito'),
    municipalityId: yup.string().required('Selecione um concelho'),
    parishId: yup.string().required('Selecione uma freguesia'),
  }),
  professionalRegions: yup.array().when('userType', {
    is: 'professional',
    then: (schema) => schema.min(1, 'Adicione pelo menos um distrito de atendimento'),
    otherwise: (schema) => schema,
  }),
  professionalServices: yup.array().when('userType', {
    is: 'professional',
    then: (schema) => schema.min(1, 'Selecione pelo menos um serviço/categoria'),
    otherwise: (schema) => schema,
  }),
});

// Schema de validação para login
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .lowercase()
    .required('O email é obrigatório')
    .email('Email inválido'),
  password: yup.string().required('A senha é obrigatória'),
});

// Schema de validação para perfil
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('O nome é obrigatório')
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  phone: yup
    .string()
    .trim()
    .test('phone-format', 'O telemóvel deve conter 9 dígitos numéricos', (value) => {
      if (!value || value.length === 0) return true; // Opcional
      return /^\d{9}$/.test(value);
    }),
});

// Schema de validação para pedido de serviço
export const serviceRequestSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('O título é obrigatório')
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  description: yup
    .string()
    .trim()
    .required('A descrição é obrigatória')
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
  category: yup.string().required('Selecione uma categoria'),
  location: yup.object().shape({
    districtId: yup.string().required('Selecione um distrito'),
    municipalityId: yup.string().required('Selecione um concelho'),
    parishId: yup.string().required('Selecione uma freguesia'),
  }),
  budget: yup
    .string()
    .test('budget-format', 'Orçamento inválido', (value) => {
      if (!value || value.trim().length === 0) return true; // Opcional
      const num = parseFloat(value.replace(',', '.'));
      return !isNaN(num) && num > 0;
    }),
});

// Schema de validação para proposta
export const proposalSchema = yup.object().shape({
  price: yup
    .number()
    .required('O valor é obrigatório')
    .positive('O valor deve ser positivo')
    .min(0.01, 'O valor mínimo é €0.01'),
  description: yup
    .string()
    .trim()
    .required('A descrição é obrigatória')
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres'),
  estimatedDuration: yup.string().trim(),
});

// Função helper para validar com schema
export const validateForm = async <T>(schema: yup.ObjectSchema<any>, data: T): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err: any) {
    const errors: Record<string, string> = {};
    if (err.inner) {
      err.inner.forEach((error: yup.ValidationError) => {
        if (error.path) {
          errors[error.path] = error.message;
        }
      });
    }
    return { isValid: false, errors };
  }
};

