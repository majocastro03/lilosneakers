-- ================================================
-- SCRIPT: Crear Usuario Administrador
-- Proyecto: Lilo Sneakers E-commerce
-- ================================================

-- INSTRUCCIONES:
-- 1. Ve a tu dashboard de Supabase
-- 2. Sección: Authentication → Users
-- 3. Crea un nuevo usuario con email y password
-- 4. Copia el UUID del usuario creado
-- 5. Reemplaza 'UUID-DEL-USUARIO-AQUI' abajo con ese UUID
-- 6. Ejecuta este script en SQL Editor de Supabase

-- ================================================
-- CREAR PERFIL DE ADMINISTRADOR
-- ================================================

-- Reemplaza 'UUID-DEL-USUARIO-AQUI' con el UUID real del usuario
INSERT INTO public.perfiles (
  id,
  nombre,
  apellido,
  username,
  telefono,
  tipo_usuario,
  created_at,
  updated_at
) VALUES (
  'UUID-DEL-USUARIO-AQUI',  -- ⚠️ REEMPLAZAR con el UUID del usuario
  'Admin',                   -- Nombre del admin
  'Principal',               -- Apellido (opcional)
  'admin',                   -- ⭐ Username para login
  NULL,                      -- Teléfono (opcional)
  'admin',                   -- ⚠️ IMPORTANTE: Debe ser 'admin' para acceso
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  tipo_usuario = 'admin',
  updated_at = NOW();

-- ================================================
-- VERIFICAR CREACIÓN
-- ================================================

-- Ejecuta esto después para verificar:
SELECT 
  p.id,
  p.nombre,
  p.username,
  p.tipo_usuario,
  au.email
FROM public.perfiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.tipo_usuario = 'admin';

-- ================================================
-- CREDENCIALES DE LOGIN
-- ================================================

-- Después de crear el usuario, podrás loguearte con:
-- Username: admin (o el que hayas puesto en la columna 'username')
-- Password: La que configuraste en Supabase Auth
-- URL de login: http://localhost:4200/login
