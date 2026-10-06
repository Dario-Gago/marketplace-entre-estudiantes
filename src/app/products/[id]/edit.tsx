import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

import { supabase } from '../../../lib/supabase';

type Category = {
  id: string;
  name: string;
  icon: string | null;
};
type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadProductAndCategories = useCallback(async () => {
    const [
      { data: productData, error: productError },
      { data: categoriesData, error: categoriesError },
    ] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('categories').select('id, name, icon').order('name'),
    ]);

    if (productError) {
      Alert.alert('Error', productError.message);
      setInitialLoading(false);
      return;
    }

    if (categoriesError) {
      console.error('Error cargando categorías:', categoriesError);
    }

    setTitle(productData.title);
    setDescription(productData.description);
    setPrice(productData.price.toString());
    setCondition(productData.condition);
    setSelectedCategory(productData.category_id);
    setCategories(categoriesData || []);
    setInitialLoading(false);
  }, [id]);

  useEffect(() => {
    loadProductAndCategories();
  }, [loadProductAndCategories]);

  const handleUpdateProduct = async () => {
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
      const { error } = await supabase
        .from('products')
        .update({
          category_id: selectedCategory,
          title: title.trim(),
          description: description.trim(),
          price: numericPrice,
          condition: condition.trim(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      Alert.alert(
        '¡Producto actualizado!',
        'Tu producto se actualizó correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error actualizando producto:', error);

      Alert.alert(
        'Error',
        error?.message || 'No se pudo actualizar el producto.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Editar producto</Text>

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
                <Ionicons
                  name={category.icon as IconName}
                  size={16}
                  color="#667eea"
                />
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
          onPress={handleUpdateProduct}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Actualizando...' : 'Guardar cambios'}
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#000000',
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
