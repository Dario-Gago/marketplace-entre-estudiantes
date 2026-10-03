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
export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert("Faltan datos", "Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña demasiado corta",
        "Debe tener al menos 6 caracteres."
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    if (!data.user) {
      Alert.alert("Error", "No se pudo crear el usuario.");
      return;
    }

    Alert.alert(
      "¡Cuenta creada!",
      "Tu cuenta se creó correctamente.",
      [
        {
          text: "Continuar",
          onPress: () => router.replace("/auth/university"),
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
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Únete al marketplace universitario
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
              placeholder="Contraseña (mínimo 6 caracteres)"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.loginLink}>Inicia sesión</Text>
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
  loginText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
    marginTop: 15,
  },
  loginLink: {
    color: "#fff",
    fontWeight: "700",
  },
});