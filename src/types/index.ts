export type UserType = 'client' | 'professional';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType: UserType;
  districtId?: string | null;
  municipalityId?: string | null;
  parishId?: string | null;
  locationLabel?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  avatarUrl?: string | null;
  createdAt: string;
  isAdmin?: boolean;
}

export interface Client extends User {
  userType: 'client';
}

export interface Professional extends User {
  userType: 'professional';
  categories: string[];
  regions: string[];
  credits: number;
  rating: number;
  reviewCount: number;
  portfolio?: string[];
  description?: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  categories: string[]; // Múltiplas categorias permitidas
  category?: string; // Mantido para compatibilidade com código legado
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  budget?: number;
  photos?: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  completedAt?: string | null;
  createdAt: string;
  referenceNumber?: string; // Número de referência único (ex: PED-12345)
}

export interface Proposal {
  id: string;
  serviceRequestId: string;
  professionalId: string;
  professionalName?: string;
  price: number;
  description: string;
  estimatedDuration?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  serviceRequestId: string;
  professionalId: string;
  clientId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  client?: {
    name?: string;
  };
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  discount?: number;
}

export interface Lead {
  id: string;
  serviceRequestId: string;
  category: string;
  cost: number;
  location: string;
  description: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  serviceRequestId?: string;
  serviceRequestTitle?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  createdAt: string;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: UserType;
  displayName?: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  readBy: string[];
  sender?: Pick<User, 'id' | 'name'>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  readAt?: string;
  createdAt: string;
}

