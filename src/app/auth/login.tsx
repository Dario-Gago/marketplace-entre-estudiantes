import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Completa todos los campos.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert(
      "¡Bienvenido!",
      "Has iniciado sesión correctamente.",
      [
        {
          text: "Continuar",
          onPress: () => router.replace("/"),
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradient}
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
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para continuar
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Iniciando..." : "Iniciar sesión"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/auth/register")}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta?{" "}
                <Text style={styles.registerLink}>Regístrate</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  button: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "700",
  },
  registerText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
    marginTop: 15,
  },
  registerLink: {
    color: "#fff",
    fontWeight: "700",
  },
});
