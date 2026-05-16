-- ============================================================
-- SEED: Admin Principal de PsyConnect
-- Ejecutar UNA SOLA VEZ en Supabase → SQL Editor
-- ============================================================

-- 1. Crear el usuario en auth.users (si no existe)
-- Nota: Esto requiere que primero te registres desde la web
-- con psicocontigo1312@gmail.com para que se cree en auth.users

-- 2. Cambiar el rol a admin principal
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'psicocontigo1312@gmail.com';

-- 3. Eliminar registro de psychologist si se creó
DELETE FROM public.psychologists 
WHERE id = (SELECT id FROM public.profiles WHERE email = 'psicocontigo1312@gmail.com');

-- 4. Eliminar registro de patient si se creó
DELETE FROM public.patients 
WHERE id = (SELECT id FROM public.profiles WHERE email = 'psicocontigo1312@gmail.com');

-- ============================================================
-- Si el usuario NO existe aún en Supabase, ejecuta esto primero:
-- Ve a Auth → Users → Add user → email: psicocontigo1312@gmail.com
-- Luego ejecuta el SQL de arriba.
-- ============================================================
