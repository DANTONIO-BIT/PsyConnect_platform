# PsyConnect — Centro de Psicología Online

Plataforma web completa para un centro de psicología online que conecta psicólogos verificados con pacientes en **Chile** (CLP) y **España** (EUR).

## Demo en vivo
- **Landing pública**: `/` — información, servicios, directorio de psicólogos
- **Admin**: `/admin` — panel CRM completo
- **Psicólogo**: `/dashboard/psicologo` — área profesional
- **Paciente**: `/dashboard/paciente` — panel del paciente

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| AI Chat | Ollama (local) + OpenRouter (cloud fallback) |
| Calendar | Google Calendar API |
| Deploy | Vercel |

## Requisitos Previos

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Proyecto Supabase configurado
- (Opcional) Ollama instalado para chat local
- (Opcional) Credenciales de Google Calendar

## Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/DANTONIO-BIT/PsyConnect_platform.git
cd PsyConnect_platform

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# 4. Ejecutar en desarrollo
pnpm dev
```

## Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com/dashboard)
2. Ir a **SQL Editor** → **New Query**
3. Copiar y ejecutar el contenido de `scripts/schema.sql`
4. Ir a **Storage** → crear dos buckets:
   - `avatars` (público)
   - `psicologos-docs` (privado)
5. Copiar las credenciales desde **Project Settings → API** a `.env.local`

## Variables de Entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave service_role (solo server) |
| `GOOGLE_CLIENT_ID` | No | Para Google Calendar |
| `GOOGLE_CLIENT_SECRET` | No | Para Google Calendar |
| `GOOGLE_REFRESH_TOKEN` | No | Para Google Calendar |
| `GOOGLE_CALENDAR_ID` | No | ID del calendario (default: primary) |
| `OLLAMA_BASE_URL` | No | URL de Ollama (default: http://localhost:11434) |
| `OLLAMA_MODEL` | No | Modelo Ollama (default: llama3.2) |
| `OPENROUTER_API_KEY` | No | API key de OpenRouter |
| `OPENROUTER_MODEL` | No | Modelo OpenRouter (default: llama-3.1-8b-instruct:free) |

## Comandos

```bash
pnpm dev      # Desarrollo en localhost:3000
pnpm build    # Build de producción
pnpm start    # Servir build de producción
pnpm lint     # Linting
```

## Arquitectura

### Roles de Usuario
- **admin** → Panel CRM (`/admin`) — gestiona psicólogos, pacientes, citas
- **psychologist** → Dashboard profesional (`/dashboard/psicologo`) — citas, disponibilidad, perfil
- **patient** → Panel paciente (`/dashboard/paciente`) — agendar citas, historial

### Flujo de Booking
1. Paciente busca psicólogo → selecciona día/hora → confirma
2. Se guarda en tabla `appointments` de Supabase
3. Se crea evento en Google Calendar (si credenciales configuradas)
4. Si Google Calendar falla, la cita en Supabase igual se guarda

### Flujo de Chat
1. Intenta Ollama local primero
2. Si Ollama no disponible → usa OpenRouter (cloud)
3. Si ambos fallan → muestra error amigable

### Modo Mock
Si `NEXT_PUBLIC_SUPABASE_URL` contiene "placeholder", el proyecto usa datos mock para desarrollo sin Supabase conectado.

## Estructura del Proyecto

```
app/                          # Next.js App Router
  admin/                      # Panel de administración
  api/                        # API routes (book, chat)
  auth/                       # Login, signup, callback, reset
  dashboard/                  # Dashboards (paciente, psicólogo)
  psicologos/                 # Directorio público
  registro-psicologo/         # Registro profesional multi-paso
components/                   # Componentes React
  ui/                         # shadcn/ui components
lib/                          # Utilidades
  supabase/                   # Clientes Supabase (real + mock)
  calendar.ts                 # Google Calendar integration
  ollama.ts                   # AI chat (Ollama + OpenRouter)
scripts/
  schema.sql                  # Schema de Supabase
  dev-fixed-port.mjs          # Script de dev con puerto fijo
types/
  database.ts                 # Tipos TypeScript de la DB
docs/                         # Documentación del proyecto
.engram/                      # Memoria de desarrollo (local)
```

## Licencia

Privado — todos los derechos reservados.
