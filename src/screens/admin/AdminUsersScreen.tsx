import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';

interface User {
  id: string;
  email: string;
  nome_completo: string;
  user_type: 'client' | 'professional';
  created_at: string;
  phone: string | null;
  location_label: string | null;
  creditos: number | null;
  avaliacao: number | null;
}

export const AdminUsersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigation.navigate('Login');
      return;
    }
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.nome_completo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('admin_users_summary').select('*').order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.nome_completo || 'Sem nome'}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <Chip
            icon={item.user_type === 'professional' ? 'briefcase' : 'account'}
            style={[
              styles.typeChip,
              { backgroundColor: item.user_type === 'professional' ? colors.professional : colors.client },
            ]}
            textStyle={styles.chipText}
          >
            {item.user_type === 'professional' ? 'Profissional' : 'Cliente'}
          </Chip>
        </View>
        {item.user_type === 'professional' && (
          <View style={styles.professionalInfo}>
            <Text style={styles.infoText}>Créditos: {item.creditos || 0}</Text>
            {item.avaliacao && <Text style={styles.infoText}>Avaliação: {item.avaliacao.toFixed(1)} ⭐</Text>}
          </View>
        )}
        {item.phone && <Text style={styles.infoText}>Telefone: {item.phone}</Text>}
        {item.location_label && <Text style={styles.infoText}>Localização: {item.location_label}</Text>}
        <Text style={styles.dateText}>Cadastrado em: {new Date(item.created_at).toLocaleDateString('pt-PT')}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>A carregar usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Pesquisar usuários..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  searchbar: {
    margin: 16,
    backgroundColor: colors.surface,
  },
  list: {
    padding: 16,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  typeChip: {
    marginLeft: 8,
  },
  chipText: {
    color: colors.textLight,
  },
  professionalInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

