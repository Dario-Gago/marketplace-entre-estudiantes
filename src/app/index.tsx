import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
type Category = {
  id: string;
  name: string;
  icon: string | null;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
};
type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function HomeScreen() {
  const { session, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/welcome");
    }
  }, [session, authLoading]);

  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, icon")
      .order("name");

    if (error) {
      console.log("Error cargando categorías:", error.message);
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  }, []);

  const loadProducts = useCallback(async () => {
    let query = supabase
      .from("products")
      .select("id, title, description, price, condition, status")
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Error cargando productos:", error.message);
      return;
    }

    setProducts(data || []);
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, loadProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCategories(), loadProducts()]);
    setRefreshing(false);
  }, [loadCategories, loadProducts]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <TextInput
          style={styles.search}
          placeholder="🔍  Buscar productos..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Categorías
          </Text>
          {selectedCategory && (
            <Pressable onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilter}>Ver todas</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.category,
                  selectedCategory === category.id && styles.categoryActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as IconName}
                  size={24}
                  color="#0d1e68"
                />

                <Text style={styles.categoryName}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Productos recientes
          </Text>

          <Text style={styles.seeAll}>
            Ver todos
          </Text>
        </View>

        {products.length === 0 ? (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>
      🛍️
    </Text>

    <Text style={styles.emptyTitle}>
      Todavía no hay productos
    </Text>

    <Text style={styles.emptyText}>
      Sé uno de los primeros estudiantes en publicar algo.
    </Text>

    <Pressable
      style={styles.publishButton}
      onPress={() => router.push("/products/create")}
    >
      <Text style={styles.publishButtonText}>
        + Publicar producto
      </Text>
    </Pressable>
  </View>
) : (
  <View style={styles.products}>
   {products.map((product) => (
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

        <Pressable style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>♡</Text>
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
    </View>
  </Pressable>
))}
  </View>
)}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.tab}>
          <Ionicons name="home" size={24} color="#667eea" />
          <Text style={styles.activeTabText}>Inicio</Text>
        </Pressable>

        <Pressable
          style={styles.tab}
          onPress={() => router.push("/favorites")}
        >
          <Ionicons name="heart" size={24} color={'#da1010'} />
          <Text style={styles.tabText}>Favoritos</Text>
        </Pressable>

        <Pressable
          style={styles.tab}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person" size={24} color={'#170954'} />
          <Text style={styles.tabText}>Perfil</Text>
        </Pressable>
      </View>
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
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#777",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 18,
    color: "#666",
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    fontSize: 22,
  },

  search: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginTop: 25,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  seeAll: {
    color: "#666",
    fontSize: 14,
  },
  clearFilter: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },

  categories: {
    gap: 12,
    paddingRight: 20,
  },

  category: {
    width: 90,
    height: 100,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },

  categoryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  categoryName: {
    fontSize: 12,
    textAlign: "center",
  },
  categoryActive: {
    backgroundColor: "#667eea",
    borderWidth: 0,
  },

  empty: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    marginTop: 5,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 8,
    lineHeight: 20,
  },

  publishButton: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },

  publishButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabIcon: {
    fontSize: 21,
  },

  activeTabText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  tabText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
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
  backgroundColor: "#f5f5f5",
  justifyContent: "center",
  alignItems: "center",
},

favoriteIcon: {
  fontSize: 24,
  color: "#333",
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
});