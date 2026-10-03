import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, Pressable, Image } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🎓</Text>
            <Text style={styles.appName}>UniMarket</Text>
            <Text style={styles.tagline}>
              Compra y vende entre estudiantes
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureText}>Libros y materiales</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💻</Text>
              <Text style={styles.featureText}>Electrónica</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🪑</Text>
              <Text style={styles.featureText}>Muebles</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.primaryButtonText}>
                Crear cuenta
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.secondaryButtonText}>
                Iniciar sesión
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Marketplace universitario seguro y fácil
          </Text>
        </View>
      </LinearGradient>
    </View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 60,
  },
  feature: {
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  buttons: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    marginTop: 40,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
