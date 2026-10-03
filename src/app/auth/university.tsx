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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Cargando universidades...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ¿Dónde estudias?
      </Text>

      <Text style={styles.subtitle}>
        Selecciona tu universidad para comenzar.
      </Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25,
    paddingTop: 80,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 25,
  },

  list: {
    paddingBottom: 30,
  },

  university: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  shortName: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },

  arrow: {
    fontSize: 22,
    color: "#666",
  },
});