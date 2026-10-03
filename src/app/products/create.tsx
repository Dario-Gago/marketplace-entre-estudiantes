import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export default function CreateProductScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProduct = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !price.trim() ||
      !condition.trim()
    ) {
      Alert.alert('Faltan datos', 'Completa todos los campos.');
      return;
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido.');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        Alert.alert(
          'Sesión requerida',
          'Debes iniciar sesión para publicar un producto.'
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile?.university_id) {
        Alert.alert(
          'Universidad no seleccionada',
          'Debes seleccionar tu universidad antes de publicar.'
        );
        return;
      }

      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        university_id: profile.university_id,
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        condition: condition.trim(),
        status: 'active',
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        '¡Producto publicado!',
        'Tu producto se guardó correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      setTitle('');
      setDescription('');
      setPrice('');
      setCondition('');
    } catch (error: any) {
      console.error('Error creando producto:', error);

      Alert.alert(
        'Error',
        error?.message || 'No se pudo publicar el producto.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Publicar producto</Text>

        <Text style={styles.label}>Título</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej: Calculadora científica Casio"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descripción</Text>

        <TextInput
          style={[styles.input, styles.description]}
          placeholder="Describe tu producto..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Precio</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej: 15000"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Estado del producto</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej: Nuevo, usado, buen estado..."
          value={condition}
          onChangeText={setCondition}
        />

        <Pressable
          style={[styles.button, loading && styles.disabled]}
          onPress={handleCreateProduct}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Publicando...' : 'Publicar producto'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    padding: 24,
    paddingTop: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },

  description: {
    height: 120,
    textAlignVertical: 'top',
  },

  button: {
    marginTop: 30,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});