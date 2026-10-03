import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
    });

    if (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      Alert.alert("Error", "No se pudo crear el usuario.");
      return;
    }

    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        name: name.trim(),
      });

    setLoading(false);

    if (profileError) {
      Alert.alert(
        "Error al crear perfil",
        profileError.message
      );
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
    <View style={styles.container}>
      <Text style={styles.title}>
        Crear cuenta
      </Text>

      <Text style={styles.subtitle}>
        Únete al Marketplace de Estudiantes
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
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
          {loading
            ? "Creando cuenta..."
            : "Crear cuenta"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>
          Volver
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    paddingTop: 90,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 35,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  backText: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 16,
  },
});