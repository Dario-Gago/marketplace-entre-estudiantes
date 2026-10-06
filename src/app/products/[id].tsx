import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
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
import { supabase } from "../../lib/supabase";

type ProductDetail = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  image_url: string | null;
  created_at: string;
  seller_id: string;
  seller: {
    name: string;
    university_name: string;
  };
  is_favorite: boolean;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const loadProduct = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        users!inner(name, universities(name))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isFav = false;
    if (user) {
      const { data: favData } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", id)
        .single();

      isFav = !!favData;
    }

    setProduct({
      ...data,
      seller_id: data.seller_id,
      seller: {
        name: data.users.name,
        university_name: data.users.universities?.name || "Sin universidad",
      },
      is_favorite: isFav,
    });
    setIsFavorite(isFav);
    setIsOwner(user?.id === data.seller_id);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [id, loadProduct]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProduct();
    setRefreshing(false);
  }, [loadProduct]);

  async function toggleFavorite() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para guardar favoritos",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Iniciar sesión",
            onPress: () => router.push("/auth/login"),
          },
        ]
      );
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setIsFavorite(false);
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: id,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setIsFavorite(true);
    }
  }

  async function handleDelete() {
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
              .eq("id", id);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            Alert.alert(
              "Producto eliminado",
              "El producto ha sido eliminado correctamente.",
              [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]
            );
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

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Producto no encontrado</Text>
      </View>
    );
  }

  const conditionLabels: Record<string, string> = {
    nuevo: "Nuevo",
    usado: "Usado",
    como_nuevo: "Como nuevo",
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.imageContainer}>
          <Text style={styles.imageIcon}>📦</Text>
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>
              {product.title}
            </Text>

            <Pressable
              style={[
                styles.favoriteButton,
                isFavorite && styles.favoriteActive,
              ]}
              onPress={toggleFavorite}
            >
             
              <Ionicons name="heart" size={24} color={isFavorite ? "#b61c1c" : "#667eea"} />
            </Pressable>
          </View>

          <Text style={styles.price}>
            ${product.price.toLocaleString("es-CL")}
          </Text>

          <View style={styles.meta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conditionLabels[product.condition] || product.condition}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                product.status === "active"
                  ? styles.statusActive
                  : styles.statusSold,
              ]}
            >
              <Text style={styles.statusText}>
                {product.status === "active" ? "Disponible" : "Vendido"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendedor</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {product.seller.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <Text style={styles.sellerUniversity}>
                {product.seller.university_name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publicado</Text>
          <Text style={styles.date}>
            {new Date(product.created_at).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {isOwner && (
          <View style={styles.ownerActions}>
            <Pressable
              style={[styles.actionButton, styles.editButton]}
              onPress={() => router.push(`/products/${id}/edit`)}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </Pressable>
          </View>
        )}

        {product.status === "active" && !isOwner && (
          <Pressable style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contactar vendedor</Text>
          </Pressable>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  backButton: {
    position: "absolute",
    top: 65,
    left: 22,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  imageContainer: {
    height: 280,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  imageIcon: {
    fontSize: 64,
  },
  mainInfo: {
    padding: 22,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    marginRight: 12,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteActive: {
    backgroundColor: "#ffebee",
  },
  favoriteIcon: {
    fontSize: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: "#667eea",
    marginBottom: 16,
  },
  meta: {
    flexDirection: "row",
    gap: 10,
  },
  badge: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#e8f5e9",
  },
  statusSold: {
    backgroundColor: "#fff3e0",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: 22,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    padding: 16,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sellerAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sellerUniversity: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 15,
    color: "#666",
  },
  contactButton: {
    margin: 22,
    backgroundColor: "#111",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  ownerActions: {
    flexDirection: "row",
    gap: 12,
    margin: 22,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#667eea",
  },
  deleteButton: {
    backgroundColor: "#ff5252",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
