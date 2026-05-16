# PsyConnect — Arquitectura del Proyecto

## Visión
Plataforma de psicología online que conecta psicólogos verificados con pacientes en **Chile** (CLP) y **España** (EUR).

## Roles de Usuario
| Rol | Acceso | Ruta principal |
|-----|--------|----------------|
| `admin` | Panel CRM completo | `/admin` |
| `psychologist` | Dashboard profesional | `/dashboard/psicologo` |
| `patient` | Panel de paciente | `/dashboard/paciente` |

## Estructura de Rutas
```
/                          → Landing pública
/psicologos                → Directorio público con filtros
/psicologos/[id]           → Perfil público de psicólogo
/auth/login                → Login unificado (redirige por rol)
/auth/signup               → Registro (paciente o psicólogo)
/auth/callback             → Handler OAuth Supabase
/auth/reset                → Reset de contraseña
/registro-psicologo        → Formulario multi-paso (4 pasos) para psicólogos
/admin                     → Dashboard admin (stats + pendientes)
/admin/psicologos          → Gestión de psicólogos (aprobar/rechazar)
/admin/psicologos/[id]     → Detalle completo de un psicólogo
/admin/pacientes           → Lista de pacientes con búsqueda
/admin/citas               → Todas las citas del sistema
/dashboard/psicologo       → Inicio del psicólogo
/dashboard/psicologo/citas → Historial de citas
/dashboard/psicologo/disponibilidad → Editor de horarios
/dashboard/psicologo/perfil → Perfil editable
/dashboard/paciente        → Inicio del paciente
/dashboard/paciente/citas  → Historial de citas
/dashboard/paciente/agendar → Flujo de agendamiento (3 pasos)
```

## Decisiones de Arquitectura
- **Server Components** para páginas con data fetching
- **Client Components** (`"use client"`) para formularios e interactividad
- **Layouts anidados** para sidebars de cada dashboard
- **Middleware** protege `/admin/*` y `/dashboard/*`
- **Mock mode automático**: si `NEXT_PUBLIC_SUPABASE_URL` contiene "placeholder", usa datos mock
- **Booking dual**: Supabase (siempre) + Google Calendar (opcional)
- **Chat dual**: Ollama local primero, OpenRouter como fallback

## Flujo de Booking
1. Paciente busca psicólogo → selecciona día/hora → confirma
2. `POST /api/book` valida con Zod
3. Inserta en tabla `appointments` de Supabase
4. Intenta crear evento en Google Calendar (no bloqueante)
5. Retorna confirmación con `appointmentId` + `googleEventId`

## Flujo de Registro de Psicólogo
1. Signup en `/auth/signup` → selecciona rol "psychologist"
2. Redirect a `/registro-psicologo`
3. Formulario de 4 pasos: Datos → Formación → Disponibilidad → Documentos
4. Submit crea registro en `psychologists` con `status: "pending"`
5. Admin revisa en `/admin/psicologos` y aprueba/rechaza
