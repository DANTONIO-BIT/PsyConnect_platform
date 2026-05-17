/**
 * Reset Admin Password - PsyConnect
 *
 * Resetea la password del admin principal.
 * Ejecución: node scripts/reset-admin-password.js
 */

const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

// ─── Read .env ────────────────────────────────────────────────
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = "psicocontigo1312@gmail.com"
const NEW_PASSWORD = "admin1234"

async function resetPassword() {
  console.log("🔑 Reseteando password del admin...\n")

  // 1. Find user
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData.users.find((u) => u.email === ADMIN_EMAIL)

  if (!user) {
    console.error("❌ Usuario no encontrado en Auth")
    process.exit(1)
  }

  console.log(`✅ Usuario encontrado: ${user.id}`)

  // 2. Update password
  const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: NEW_PASSWORD }
  )

  if (error) {
    console.error("❌ Error al resetear password:", error.message)
    process.exit(1)
  }

  console.log("✅ Password actualizada exitosamente")

  // 3. Verify login works
  const { createClient: createAnonClient } = require("@supabase/supabase-js")
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseAnon = createAnonClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: NEW_PASSWORD,
  })

  if (loginError) {
    console.error("❌ Login de verificación falló:", loginError.message)
    process.exit(1)
  }

  console.log("✅ Login verificado exitosamente")

  console.log("\n" + "=".repeat(50))
  console.log("✅ PASSWORD RESETEADO EXITOSAMENTE")
  console.log("=".repeat(50))
  console.log(`📧 Email:    ${ADMIN_EMAIL}`)
  console.log(`🔑 Password: ${NEW_PASSWORD}`)
  console.log("=".repeat(50))
  console.log("\n🚀 Ahora puedes entrar a /admin con estas credenciales")
}

resetPassword()
