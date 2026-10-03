import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";

type University = {
  id: string;
  name: string;
  short_name: string | null;
};

export default function UniversityScreen() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  async function loadUniversities() {
    const { data, error } = await supabase
      .from("universities")
      .select("id, name, short_name")
      .order("name");

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    setUniversities(data || []);
    setLoading(false);
  }

  async function selectUniversity(universityId: string) {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      Alert.alert("Error", "No hay una sesión activa.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        university_id: universityId,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    router.replace("/");
  }

  if (loading) {
    return (
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.container}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            Cargando universidades...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>¿Dónde estudias?</Text>
          <Text style={styles.subtitle}>
            Selecciona tu universidad para comenzar
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {universities.map((university) => (
            <Pressable
              key={university.id}
              style={styles.university}
              onPress={() => selectUniversity(university.id)}
              disabled={saving}
            >
              <View>
                <Text style={styles.name}>
                  {university.name}
                </Text>

                {university.short_name && (
                  <Text style={styles.shortName}>
                    {university.short_name}
                  </Text>
                )}
              </View>

              <Text style={styles.arrow}>
                →
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  backIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#fff",
  },
  list: {
    paddingBottom: 30,
  },
  university: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  shortName: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  arrow: {
    fontSize: 22,
    color: "#fff",
  },
});