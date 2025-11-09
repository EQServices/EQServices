export interface ServiceCategoryGroup {
  name: string;
  services: string[];
}

export const SERVICE_CATEGORY_GROUPS: ServiceCategoryGroup[] = [
  {
    name: 'Serviços de Construção e Remodelação',
    services: ['Eletricista', 'Canalizador', 'Pintor', 'Gesseiro', 'Azulejista', 'Carpinteiro'],
  },
  {
    name: 'Serviços Domésticos',
    services: ['Engomadeira', 'Cozinheira', 'Ama (Babysitter)', 'Cuidador de idosos', 'Lavanderia'],
  },
  {
    name: 'Serviços de Limpeza',
    services: ['Limpeza Residencial', 'Limpeza Pós-obra', 'Limpeza Comercial', 'Limpeza de Vidros'],
  },
  {
    name: 'Serviços de Tecnologia e Informática',
    services: ['Suporte Técnico', 'Formatação', 'Instalação de Redes', 'Desenvolvimento de Sites'],
  },
  {
    name: 'Serviço Automóvel',
    services: ['Mecânica', 'Eletricista Auto', 'Chapa e Pintura', 'Mudança de Óleo'],
  },
  {
    name: 'Beleza e Estética',
    services: ['Cabeleireiro', 'Maquiador(a)', 'Manicure e Pedicure', 'Massagens'],
  },
  {
    name: 'Serviços de Saúde e Bem-Estar',
    services: ['Fisioterapia', 'Nutricionista', 'Personal Trainer', 'Psicólogo'],
  },
  {
    name: 'Serviços de Transporte e Logística',
    services: ['Transporte e Mudanças', 'Serviço de Entregas', 'Transporte Executivo', 'Aluguer de Viaturas'],
  },
  {
    name: 'Educação',
    services: ['Aulas Particulares', 'Reforço Escolar', 'Tradução'],
  },
  {
    name: 'Eventos e Festas',
    services: ['Buffet', 'Empregado de Mesa', 'DJ', 'Fotógrafo', 'Decoração'],
  },
  {
    name: 'Serviços Administrativos e Financeiros',
    services: ['Consultoria Contábil', 'Declaração de IRS', 'Consultoria Jurídica', 'Planejamento Financeiro'],
  },
  {
    name: 'Serviços Criativos e Design',
    services: ['Design Gráfico', 'Criação de Conteúdo', 'Edição de Vídeo', 'Fotografia Profissional'],
  },
  {
    name: 'Serviços de Costura/Alfaiataria/Modista',
    services: ['Fazer Bainhas', 'Apertar/Alargar Peças', 'Encurtar/Alongar Mangas', 'Reparação de Fechos'],
  },
];

export const ALL_SERVICES = SERVICE_CATEGORY_GROUPS.flatMap((group) => group.services);

export const getServiceGroup = (serviceName: string) => {
  return SERVICE_CATEGORY_GROUPS.find((group) => group.services.includes(serviceName));
};

