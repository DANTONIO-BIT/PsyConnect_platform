/**
 * Debug Admin - PsyConnect
 * Verifica el estado del usuario admin en Supabase
 *
 * Ejecución: node scripts/debug-admin.js
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
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = "psicocontigo1312@gmail.com"

async function debug() {
  console.log("🔍 Diagnóstico de Admin en Supabase\n")
  console.log("=".repeat(50))

  // 1. Check Auth user
  console.log("\n1️⃣  Usuario en Auth:")
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  const user = authData.users.find((u) => u.email === ADMIN_EMAIL)

  if (!user) {
    console.log("   ❌ Usuario NO existe en Auth")
    return
  }

  console.log(`   ✅ User ID: ${user.id}`)
  console.log(`   ✅ Email: ${user.email}`)
  console.log(`   ✅ Email confirmado: ${user.email_confirmed_at ? "SÍ" : "NO"}`)
  console.log(`   ✅ Creado: ${user.created_at}`)
  console.log(`   ✅ Última sesión: ${user.last_sign_in_at || "Nunca"}`)

  // 2. Check profile
  console.log("\n2️⃣  Perfil en DB:")
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.log(`   ❌ Error: ${profileError.message}`)
  } else {
    console.log(`   ✅ Rol: ${profile.role}`)
    console.log(`   ✅ Nombre: ${profile.full_name}`)
    console.log(`   ✅ Email: ${profile.email}`)
    console.log(`   ✅ País: ${profile.country}`)
    console.log(`   ✅ Status: ${profile.status}`)
  }

  // 3. Test login with anon client
  console.log("\n3️⃣  Prueba de login (anon client):")
  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: "admin1234",
  })

  if (loginError) {
    console.log(`   ❌ Error de login: ${loginError.message}`)
    console.log(`   ❌ Status: ${loginError.status}`)
  } else {
    console.log(`   ✅ Login exitoso`)
    console.log(`   ✅ Session: ${loginData.session ? "SÍ" : "NO"}`)
    console.log(`   ✅ User: ${loginData.user.email}`)
  }

  // 4. Check Supabase Auth settings
  console.log("\n4️⃣  Configuración de Auth:")
  console.log(`   URL: ${SUPABASE_URL}`)
  console.log(`   Site URL: (verificar en Supabase Dashboard → Auth → URL Configuration)`)

  // 5. Check psychologists/patients records
  console.log("\n5️⃣  Registros adicionales:")
  const { data: psy } = await supabaseAdmin.from("psychologists").select("*").eq("id", user.id)
  const { data: pat } = await supabaseAdmin.from("patients").select("*").eq("id", user.id)
  console.log(`   Psychologists: ${psy?.length || 0} registros`)
  console.log(`   Patients: ${pat?.length || 0} registros`)

  console.log("\n" + "=".repeat(50))
  console.log("\n📋 Resumen:")
  if (!user.email_confirmed_at) {
    console.log("   ⚠️  El email NO está confirmado en Auth")
    console.log("   Solución: El script ya lo confirmó, pero verifica en Supabase Dashboard")
  }
  if (profile?.role !== "admin") {
    console.log("   ⚠️  El rol NO es admin")
    console.log("   Solución: Ejecuta seed-admin-full.js nuevamente")
  }
  if (loginError) {
    console.log("   ⚠️  El login falla con el cliente anon")
    console.log("   Posible causa: Email no confirmado o password incorrecto")
  }
  if (user.email_confirmed_at && profile?.role === "admin" && !loginError) {
    console.log("   ✅ Todo parece correcto. El problema podría ser:")
    console.log("      - Redirect URLs no configuradas en Supabase")
    console.log("      - Cookie/session issue en el navegador")
    console.log("      - Middleware bloqueando el acceso")
  }
}

debug()
