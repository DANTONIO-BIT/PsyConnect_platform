/**
 * Seed Admin Principal - PsyConnect
 *
 * Crea el usuario admin principal en Supabase Auth + DB.
 * Usa Service Role Key (solo local, nunca exponer).
 *
 * Ejecución: node scripts/seed-admin-full.js
 */

const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

// ─── Read .env.local manually (no dotenv needed) ──────────────
const envPath = path.resolve(__dirname, "..", ".env")
const envContent = fs.readFileSync(envPath, "utf-8")

const env = {}
envContent.split("\n").forEach((line) => {
  line = line.trim()
  if (!line || line.startsWith("#")) return
  const [key, ...rest] = line.split("=")
  env[key.trim()] = rest.join("=").trim()
})

const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontrados en .env.local")
  process.exit(1)
}

// ─── Config ───────────────────────────────────────────────────
const ADMIN_EMAIL = "psicocontigo1312@gmail.com"
const ADMIN_PASSWORD = "admin1234"
const ADMIN_NAME = "Admin Principal"
const ADMIN_COUNTRY = "Chile"

// ─── Create Supabase Admin Client ─────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedAdmin() {
  console.log("🔑 Conectando a Supabase...")

  // 1. Check if user already exists in Auth
  const { data: existingUsers, error: searchError } =
    await supabase.auth.admin.listUsers()

  if (searchError) {
    console.error("❌ Error al buscar usuarios:", searchError.message)
    process.exit(1)
  }

  const existingUser = existingUsers.users.find((u) => u.email === ADMIN_EMAIL)

  if (existingUser) {
    console.log(`⚠️  Usuario ya existe en Auth: ${existingUser.id}`)
    console.log("   Actualizando perfil a admin...")
  } else {
    // 2. Create user in Auth
    console.log(`📝 Creando usuario en Auth: ${ADMIN_EMAIL}`)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name: ADMIN_NAME,
          role: "admin",
        },
      })

    if (authError) {
      console.error("❌ Error al crear usuario en Auth:", authError.message)
      process.exit(1)
    }

    console.log(`✅ Usuario creado en Auth: ${authData.user.id}`)
  }

  const userId = existingUser?.id || existingUsers.users.find((u) => u.email === ADMIN_EMAIL)?.id

  // 3. Get user ID (re-fetch if needed)
  const { data: allUsers } = await supabase.auth.admin.listUsers()
  const user = allUsers.users.find((u) => u.email === ADMIN_EMAIL)

  if (!user) {
    console.error("❌ No se encontró el usuario después de crearlo")
    process.exit(1)
  }

  console.log(`🆔 User ID: ${user.id}`)

  // 4. Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (existingProfile) {
    console.log("⚠️  Perfil ya existe. Actualizando a admin...")
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id)

    if (updateError) {
      console.error("❌ Error al actualizar perfil:", updateError.message)
      process.exit(1)
    }
    console.log("✅ Perfil actualizado a admin")
  } else {
    // 5. Create profile
    console.log("📝 Creando perfil en DB...")
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      country: ADMIN_COUNTRY,
      role: "admin",
      status: "active",
    })

    if (insertError) {
      console.error("❌ Error al crear perfil:", insertError.message)
      process.exit(1)
    }
    console.log("✅ Perfil creado en DB")
  }

  // 6. Clean up psychologist/patient records if any
  await supabase.from("psychologists").delete().eq("id", user.id)
  await supabase.from("patients").delete().eq("id", user.id)
  console.log("🧹 Registros de psicólogo/paciente limpiados")

  // 7. Final verification
  const { data: finalProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  console.log("\n" + "=".repeat(50))
  console.log("✅ ADMIN PRINCIPAL CREADO EXITOSAMENTE")
  console.log("=".repeat(50))
  console.log(`📧 Email:    ${ADMIN_EMAIL}`)
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
  console.log(`👤 Nombre:   ${ADMIN_NAME}`)
  console.log(`🌍 País:     ${ADMIN_COUNTRY}`)
  console.log(`🛡️  Rol:      ${finalProfile?.role}`)
  console.log("=".repeat(50))
  console.log("\n🚀 Ahora puedes entrar a /admin con estas credenciales")
  console.log("⚠️  IMPORTANTE: Cambia la contraseña después desde la app")
}

seedAdmin()
