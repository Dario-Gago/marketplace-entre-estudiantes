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

type UserProfile = {
  id: string;
  name: string;
  university_id: string | null;
  university_name?: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
  status: string;
  seller_id: string;
};

export default function ProfileScreen() {
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async (userId: string) => {
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, title, price, status, seller_id")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error loading products:", productsError);
    } else {
      setProducts(productsData || []);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/welcome");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*, universities(name)")
      .eq("id", user.id)
      .single();

    if (profileError) {
      Alert.alert("Error", profileError.message);
      setLoading(false);
      return;
    }

    setProfile({
      ...profileData,
      university_name: profileData.universities?.name,
    });

    await loadProducts(user.id);
    setLoading(false);
  }, [loadProducts]);

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/welcome");
      return;
    }
    loadProfile();
  }, [session, authLoading, loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    router.replace("/welcome");
  }

  async function handleDeleteProduct(productId: string) {
    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("products")
              .delete()
              .eq("id", productId);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            Alert.alert(
              "Producto eliminado",
              "El producto ha sido eliminado correctamente."
            );

            // Reload products
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              await loadProducts(user.id);
            }
          },
        },
      ]
    );
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
          <Text style={styles.title}>Mi Perfil</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={() => Alert.alert("Próximamente", "Configuración en desarrollo")}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.university}>
              {profile?.university_name || "Sin universidad"}
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {products.filter((p) => p.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {products.filter((p) => p.status === "sold").length}
            </Text>
            <Text style={styles.statLabel}>Vendidos</Text>
          </View>
        </View>

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/products/create")}
        >
          <Text style={styles.publishIcon}>➕</Text>
          <Text style={styles.actionText}>Publicar producto</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis productos</Text>

          {products.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>
                No has publicado productos aún
              </Text>
            </View>
          ) : (
            <View style={styles.products}>
              {products.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <Pressable
                    style={styles.productInfo}
                    onPress={() => router.push(`/products/${product.id}`)}
                  >
                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.productPrice}>
                      ${product.price.toLocaleString("es-CL")}
                    </Text>
                  </Pressable>
                  <View style={styles.productActions}>
                    <View
                      style={[
                        styles.statusBadge,
                        product.status === "active"
                          ? styles.statusActive
                          : styles.statusSold,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {product.status === "active" ? "Activo" : "Vendido"}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.actionIcon}
                      onPress={() => router.push(`/products/${product.id}/edit`)}
                    >
                      <Text style={styles.iconText}>✏️</Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionIcon}
                      onPress={() => handleDeleteProduct(product.id)}
                    >
                      <Text style={styles.iconText}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  university: {
    fontSize: 15,
    color: "#666",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#ddd",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    padding: 18,
    borderRadius: 14,
    marginBottom: 30,
  },
  publishIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  empty: {
    alignItems: "center",
    padding: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: "#666",
    fontSize: 15,
  },
  products: {
    gap: 12,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#667eea",
  },
  productActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#e8f5e9",
  },
  statusSold: {
    backgroundColor: "#fff3e0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ff5252",
    borderRadius: 14,
  },
  logoutText: {
    color: "#ff5252",
    fontSize: 16,
    fontWeight: "600",
  },
});
