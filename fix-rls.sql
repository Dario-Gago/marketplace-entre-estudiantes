-- Script para corregir las políticas RLS y agregar trigger automático
-- Ejecutar esto en el SQL Editor de Supabase

-- Primero, eliminar las políticas existentes de users
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Crear nuevas políticas más permisivas para users
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id OR id = auth.uid());

-- Opción 2: Usar un trigger automático (RECOMENDADO)
-- Eliminar el trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Crear función para manejar nuevo usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta cuando se crea un usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Nota: Con este trigger, cuando uses supabase.auth.signUp(), ya no necesitas
-- insertar manualmente en la tabla users. Solo pasa el name en metadata:
--
-- const { data, error } = await supabase.auth.signUp({
--   email: email.trim(),
--   password,
--   options: {
--     data: {
--       name: name.trim()
--     }
--   }
-- });
