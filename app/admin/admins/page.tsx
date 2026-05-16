import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Users, UserPlus, Shield } from "lucide-react"

// ─── Create Admin Action ──────────────────────────────────────
async function createAdmin(formData: FormData) {
  "use server"
  const supabase = await createClient()

  const email = formData.get("email") as string
  const fullName = formData.get("full_name") as string

  if (!email || !fullName) {
    return
  }

  // Check if user exists in profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .single()

  if (!existingProfile || existingProfile.role === "admin") {
    return
  }

  // Update role to admin
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", existingProfile.id)

  if (updateError) {
    return
  }

  // Remove from psychologists/patients if exists
  await supabase.from("psychologists").delete().eq("id", existingProfile.id)
  await supabase.from("patients").delete().eq("id", existingProfile.id)

  revalidatePath("/admin")
  redirect("/admin")
}

// ─── Page ─────────────────────────────────────────────────────
export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administradores</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona los administradores del centro</p>
      </div>

      {/* Create admin form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Crear administrador secundario</h2>
            <p className="text-xs text-muted-foreground">El usuario debe estar registrado primero</p>
          </div>
        </div>

        <form action={createAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nombre completo</label>
              <input
                name="full_name"
                type="text"
                required
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nombre del admin"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Promover a administrador
          </button>
          <p className="text-xs text-muted-foreground">
            El usuario debe estar registrado primero en la plataforma.
          </p>
        </form>
      </div>

      {/* Admins list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Administradores registrados</h2>
        </div>

        {admins && admins.length > 0 ? (
          <div className="divide-y divide-border">
            {admins.map((admin: any) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {admin.full_name?.[0] ?? "A"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{admin.full_name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Admin
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            No hay administradores registrados
          </div>
        )}
      </div>
    </div>
  )
}
