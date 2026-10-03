# UniMarket - Marketplace Universitario

Una aplicación móvil para comprar y vender productos entre estudiantes universitarios, construida con Expo React Native y Supabase.

## 🎨 Características

- ✅ **Autenticación completa**: Registro, login y selección de universidad
- ✅ **Perfil de usuario**: Información personal y estadísticas
- ✅ **Publicación de productos**: Crear y gestionar tus productos
- ✅ **Feed de productos**: Explorar productos de otros estudiantes
- ✅ **Favoritos**: Guardar productos que te interesan
- ✅ **Detalles de producto**: Ver información completa de cada producto
- ✅ **Diseño moderno**: UI atractiva con gradientes y animaciones
- ✅ **Seguridad**: Row Level Security (RLS) en Supabase

## 🚀 Configuración

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo
2. Ve al SQL Editor en tu proyecto Supabase
3. Copia y ejecuta el contenido del archivo `supabase-schema.sql`
4. Ve a Settings > API y copia:
   - `Project URL` → Añade a `.env` como `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public key` → Añade a `.env` como `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_key_publica
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar la aplicación

```bash
npx expo start
```

- Escanea el QR code con Expo Go (iOS/Android)
- O presiona `w` para abrir en el navegador web
- O presiona `a` para Android / `i` para iOS (simulador)

## 📱 Flujo de la aplicación

1. **Pantalla de bienvenida**: Usuario ve landing con opciones de login/registro
2. **Registro**: Usuario crea cuenta con email y contraseña
3. **Selección de universidad**: Usuario elige su universidad
4. **Home**: Usuario ve productos recientes y categorías
5. **Publicar producto**: Usuario puede publicar productos para vender
6. **Favoritos**: Usuario puede guardar productos de interés
7. **Perfil**: Usuario ve su información y productos publicados

## 🗄️ Estructura de la base de datos

El esquema SQL incluye:

- **users**: Perfil extendido de usuarios (vinculado a auth.users)
- **universities**: Lista de universidades chilenas
- **categories**: Categorías de productos
- **products**: Productos publicados por usuarios
- **favorites**: Productos guardados por usuarios

## 🎨 Diseño

La aplicación usa:
- Gradientes púrpura/azul para pantallas de autenticación
- Diseño limpio y minimalista
- Navegación por tabs inferior
- Cards elegantes para productos
- Emojis como iconos (sin dependencias externas)

## 🔒 Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Los usuarios solo pueden ver/crear sus propios datos
- Los productos son públicos pero solo el vendedor puede editarlos
- Los favoritos son privados por usuario

## 📝 Scripts disponibles

```bash
npm start          # Inicia el servidor de desarrollo
npx expo lint      # Ejecuta el linter
npx tsc --noEmit   # Verifica tipos TypeScript
```

## 🛠️ Tecnologías

- **Expo SDK 57** - Framework React Native
- **Expo Router** - Navegación
- **Supabase** - Backend y autenticación
- **TypeScript** - Tipado estático
- **expo-linear-gradient** - Gradientes en UI

## 📦 Estructura del proyecto

```
src/
├── app/
│   ├── welcome.tsx           # Pantalla de bienvenida
│   ├── auth/
│   │   ├── login.tsx        # Login
│   │   ├── register.tsx     # Registro
│   │   └── university.tsx    # Selección de universidad
│   ├── index.tsx             # Home / Feed de productos
│   ├── profile.tsx           # Perfil de usuario
│   ├── favorites.tsx         # Favoritos
│   └── products/
│       ├── create.tsx        # Crear producto
│       └── [id].tsx          # Detalles de producto
├── contexts/
│   └── AuthContext.tsx       # Contexto de autenticación
└── lib/
    └── supabase.ts           # Cliente de Supabase
```

## 🎯 Próximas mejoras

- [ ] Chat entre comprador y vendedor
- [ ] Subida de imágenes reales
- [ ] Filtros por categoría y precio
- [ ] Sistema de calificaciones
- [ ] Notificaciones push
- [ ] Mapa de ubicación

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
