import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

type FavoriteProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  seller_name: string;
  university_name: string;
};

export default function FavoritesScreen() {
  const { session, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/welcome");
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        products!inner(
          id,
          title,
          description,
          price,
          condition,
          status,
          users!inner(name),
          universities!inner(name)
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    const products = (data || []).map((fav: any) => ({
      id: fav.products.id,
      title: fav.products.title,
      description: fav.products.description,
      price: fav.products.price,
      condition: fav.products.condition,
      status: fav.products.status,
      seller_name: fav.products.users.name,
      university_name: fav.products.universities.name,
    }));

    setFavorites(products);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/welcome");
      return;
    }
    loadFavorites();
  }, [session, authLoading, loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  async function removeFavorite(productId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setFavorites(favorites.filter((f) => f.id !== productId));
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mis Favoritos</Text>
        </View>

        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart" size={24} color="#b61c1c"/>

            <Text style={styles.emptyTitle}>
              No tienes favoritos
            </Text>
            <Text style={styles.emptyText}>
              Guarda productos que te interesen
            </Text>
            <Pressable
              style={styles.browseButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.browseButtonText}>
                Explorar productos
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.products}>
            {favorites.map((product) => (
              <Pressable
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push(`/products/${product.id}` as any)}
              >
                <View style={styles.productImage}>
                  <Text style={styles.productImageIcon}>📦</Text>
                </View>

                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                      {product.title}
                    </Text>

                    <Pressable
                      style={styles.favoriteButton}
                      onPress={() => removeFavorite(product.id)}
                    >
                      <Ionicons name="heart" size={16} color="#b61c1c"  />
                      
                    </Pressable>
                  </View>

                  <Text
                    style={styles.productDescription}
                    numberOfLines={2}
                  >
                    {product.description}
                  </Text>

                  <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>
                      ${product.price.toLocaleString("es-CL")}
                    </Text>

                    <Text style={styles.productCondition}>
                      {product.condition}
                    </Text>
                  </View>

                  <View style={styles.sellerInfo}>
                    <Text style={styles.sellerText}>
                      {product.seller_name} • {product.university_name}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 22,
    paddingTop: 65,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  products: {
    gap: 14,
  },
  productCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 18,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  productImage: {
    height: 150,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  productImageIcon: {
    fontSize: 48,
  },
  productInfo: {
    padding: 16,
    gap: 8,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 20,
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "800",
  },
  productCondition: {
    fontSize: 12,
    color: "#555",
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sellerInfo: {
    marginTop: 8,
  },
  sellerText: {
    fontSize: 12,
    color: "#999",
  },
});
