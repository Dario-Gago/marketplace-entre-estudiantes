-- Script SQL para configurar la base de datos de UniMarket en Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- Tabla de universidades (crear primero porque users la referencia)
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (perfil extendido)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('nuevo', 'usado', 'como_nuevo')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_university ON products(university_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Política adicional para permitir insertar during signup (sin auth.uid() activo)
CREATE POLICY "Service role can insert users" ON users FOR INSERT TO service_role WITH CHECK (true);

-- Políticas RLS para universities (público)
CREATE POLICY "Universities are public" ON universities FOR SELECT USING (true);

-- Políticas RLS para categories (público)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);

-- Políticas RLS para products
CREATE POLICY "Products are public" ON products FOR SELECT USING (true);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = seller_id);

-- Políticas RLS para favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Insertar datos iniciales de universidades
INSERT INTO universities (name, short_name) VALUES
  ('Universidad de Chile', 'UChile'),
  ('Pontificia Universidad Católica de Chile', 'UC'),
  ('Universidad de Santiago de Chile', 'USACH'),
  ('Universidad Técnica Federico Santa María', 'UTFSM'),
  ('Universidad Andrés Bello', 'UNAB'),
  ('Universidad de Concepción', 'UdeC'),
  ('Universidad Austral de Chile', 'UACh')
ON CONFLICT (name) DO NOTHING;

-- Insertar datos iniciales de categorías
INSERT INTO categories (name, icon) VALUES
  ('Libros', '📚'),
  ('Electrónica', '💻'),
  ('Ropa', '👕'),
  ('Muebles', '🪑'),
  ('Deportes', '⚽'),
  ('Música', '🎵'),
  ('Arte', '🎨'),
  ('Otros', '📦')
ON CONFLICT (name) DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
