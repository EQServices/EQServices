import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import { User, UserType } from '../types';
import { Session } from '@supabase/supabase-js';
import { registerForPushNotificationsAsync } from '../services/notifications';

interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: UserType;
  location?: {
    districtId: string;
    municipalityId: string;
    parishId: string;
    label: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  professionalCategories?: string[];
  professionalRegions?: string[];
}

interface AuthContextData {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserContext: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushRegistered, setPushRegistered] = useState(false);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
            id,
            email,
            name,
            first_name,
            last_name,
            phone,
            user_type,
            district_id,
            municipality_id,
            parish_id,
            location_label,
            avatar_url,
            created_at,
            is_admin
          `,
        )
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const mappedUser: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          phone: data.phone ?? undefined,
          userType: data.user_type,
          districtId: data.district_id ?? null,
          municipalityId: data.municipality_id ?? null,
          parishId: data.parish_id ?? null,
          locationLabel: data.location_label ?? null,
          avatarUrl: data.avatar_url ?? null,
          createdAt: data.created_at,
          isAdmin: data.is_admin ?? false,
        };

        setUser(mappedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Após login bem-sucedido, verificar se o userType está correto no banco
    // Isso garante que o tipo de usuário não foi alterado manualmente
    const { data: session } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (userData && userData.user_type !== 'client' && userData.user_type !== 'professional') {
        console.error('Tipo de usuário inválido no banco de dados:', userData.user_type);
        await supabase.auth.signOut();
        throw new Error('Erro ao carregar perfil. Entre em contato com o suporte.');
      }
    }
  };

  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
    phone,
    userType,
    location,
    professionalCategories,
    professionalRegions,
  }: SignUpInput) => {
    // Verificar se o email já existe antes de tentar criar a conta
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, user_type')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingUser) {
      throw new Error(
        `Este email já está registrado como ${existingUser.user_type === 'client' ? 'cliente' : 'profissional'}. Use outro email ou faça login.`,
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Se o erro for de email já existente, fornecer mensagem mais clara
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new Error('Este email já está registrado. Use outro email ou faça login.');
      }
      throw error;
    }

    if (data.user) {
      const now = new Date().toISOString();
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      if (!location) {
        throw new Error('Localização obrigatória não fornecida.');
      }

      // Criar perfil do usuário
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        user_type: userType,
        phone: phone?.trim() || null,
        district_id: location.districtId,
        municipality_id: location.municipalityId,
        parish_id: location.parishId,
        location_label: location.label,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        created_at: now,
        updated_at: now,
      });

      if (profileError) throw profileError;

      if (userType === 'professional') {
        const categoriesToInsert = professionalCategories ?? [];
        const regionsToInsert = professionalRegions ?? [];

        if (categoriesToInsert.length === 0 || regionsToInsert.length === 0) {
          throw new Error('Dados profissionais obrigatórios não foram fornecidos.');
        }

        const { error: professionalError } = await supabase.from('professionals').insert({
          id: data.user.id,
          categories: categoriesToInsert,
          regions: regionsToInsert,
          credits: 0,
          rating: 0,
          review_count: 0,
          portfolio: [],
          description: null,
          created_at: now,
          updated_at: now,
        });

        if (professionalError) {
          console.warn('Não foi possível criar dados adicionais do profissional:', professionalError);
        }
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setPushRegistered(false);
  };

  const refreshUser = async () => {
    const targetId = session?.user?.id || user?.id;
    if (!targetId) return;
    await loadUserData(targetId);
  };

  const updateUserContext = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  useEffect(() => {
    let cancelled = false;
    if (user?.id && !pushRegistered) {
      registerForPushNotificationsAsync(user.id)
        .catch((err) => console.warn('Falha ao registar notificações:', err))
        .finally(() => {
          if (!cancelled) {
            setPushRegistered(true);
          }
        });
    }
    if (!user?.id && pushRegistered) {
      setPushRegistered(false);
    }

    return () => {
      cancelled = true;
    };
  }, [pushRegistered, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

