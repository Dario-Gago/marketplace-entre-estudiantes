import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/university" />
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="products/create" />
        <Stack.Screen name="products/[id]" />
      </Stack>
    </AuthProvider>
  );
}