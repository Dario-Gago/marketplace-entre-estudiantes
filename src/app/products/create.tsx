import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { supabase } from '../../lib/supabase';

type Category = {
  id: string;
  name: string;
  icon: string | null;
};

export default function CreateProductScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('name');

    if (error) {
      console.error('Error cargando categorías:', error);
    } else {
      setCategories(data || []);
    }
  }

  const handleCreateProduct = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !price.trim() ||
      !condition.trim() ||
      !selectedCategory
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
        category_id: selectedCategory,
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
      setSelectedCategory(null);
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

        <Text style={styles.label}>Categoría</Text>

        {categories.length === 0 ? (
          <ActivityIndicator size="small" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>
                  {category.icon || '📦'}
                </Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Estado del producto</Text>

        <View style={styles.conditionOptions}>
          {['nuevo', 'usado', 'como_nuevo'].map((opt) => (
            <Pressable
              key={opt}
              style={[
                styles.conditionButton,
                condition === opt && styles.conditionButtonActive,
              ]}
              onPress={() => setCondition(opt)}
            >
              <Text
                style={[
                  styles.conditionButtonText,
                  condition === opt && styles.conditionButtonTextActive,
                ]}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

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
  conditionOptions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  conditionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  conditionButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  conditionButtonTextActive: {
    color: '#fff',
  },
  categoriesContainer: {
    gap: 10,
    paddingBottom: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryNameActive: {
    color: '#fff',
  },
});