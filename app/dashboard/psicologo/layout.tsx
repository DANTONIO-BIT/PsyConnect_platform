"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Brain,
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Clock,
  LogOut,
  ChevronRight,
  Bell,
} from "lucide-react"

const NAV = [
  { href: "/dashboard/psicologo", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/psicologo/citas", label: "Mis Citas", icon: CalendarDays },
  { href: "/dashboard/psicologo/disponibilidad", label: "Disponibilidad", icon: Clock },
  { href: "/dashboard/psicologo/perfil", label: "Mi Perfil", icon: UserCircle },
]

export default function PsicologoDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col fixed h-full">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm block">PsyConnect</span>
              <span className="text-xs text-muted-foreground">Área profesional</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
          <p className="text-sm text-muted-foreground">
            {NAV.find((n) => isActive(n.href, n.exact))?.label ?? "Dashboard"}
          </p>
          <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <Bell className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
