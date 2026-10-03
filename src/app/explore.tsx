import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
};

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, price, condition, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
}, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>UniMarket</Text>
        <Text style={styles.subtitle}>
          Compra y vende entre estudiantes
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          products.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Todavía no hay productos</Text>
            <Text style={styles.emptyText}>
              Cuando los estudiantes publiquen productos, aparecerán aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.productTitle}>{item.title}</Text>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.price}>
                  {formatPrice(item.price)}
                </Text>

                <Text style={styles.condition}>
                  {item.condition}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: '#666',
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardContent: {
    padding: 18,
  },

  productTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },

  price: {
    fontSize: 20,
    fontWeight: '800',
  },

  condition: {
    fontSize: 13,
    color: '#555',
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    padding: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 21,
  },
});