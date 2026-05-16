"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type NavUser = { name: string; role: string } | null

export function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [navUser, setNavUser]          = useState<NavUser>(null)
  const [userLoading, setUserLoading]  = useState(true)
  const [dropdownOpen, setDropdown]    = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single()
          if (profile) setNavUser({ name: profile.full_name, role: profile.role })
        }
      } catch { /* Supabase not configured yet */ }
      setUserLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setNavUser(null)
    setDropdown(false)
    router.push("/")
    router.refresh()
  }

  const dashboardHref =
    navUser?.role === "admin"        ? "/admin" :
    navUser?.role === "psychologist" ? "/dashboard/psicologo" :
    "/dashboard/paciente"

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container-main py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-lg">PsyConnect</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            onClick={() => scrollTo("services")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Servicios
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Cómo funciona
          </button>
          <Link
            href="/psicologos"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Psicólogos
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!userLoading && (
            navUser ? (
              /* Logged-in user menu */
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:border-primary/40 transition-colors text-sm"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {navUser.name?.[0] ?? "U"}
                  </div>
                  <span className="text-foreground font-medium max-w-24 truncate hidden sm:block">
                    {navUser.name?.split(" ")[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs font-semibold text-foreground truncate">{navUser.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{
                          navUser.role === "psychologist" ? "Psicólogo/a" :
                          navUser.role === "admin" ? "Administrador" : "Paciente"
                        }</p>
                      </div>
                      <Link
                        href={dashboardHref}
                        onClick={() => setDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        Mi panel
                      </Link>
                      <Link
                        href={navUser.role === "psychologist" ? "/dashboard/psicologo/perfil" : "/dashboard/paciente"}
                        onClick={() => setDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full border-t border-border"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex text-sm rounded-full text-muted-foreground hover:text-foreground"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-accent text-primary-foreground rounded-full text-sm px-5"
                  >
                    Comenzar
                  </Button>
                </Link>
              </div>
            )
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Menú"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {[
              { label: "Servicios",    action: () => scrollTo("services") },
              { label: "Cómo funciona", action: () => scrollTo("how-it-works") },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="text-left px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {label}
              </button>
            ))}
            <Link
              href="/psicologos"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Psicólogos
            </Link>

            <div className="border-t border-border mt-2 pt-3 space-y-2">
              {navUser ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    Mi panel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full text-sm">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full text-sm">
                      Comenzar gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
