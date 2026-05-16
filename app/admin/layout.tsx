"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Brain,
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  LogOut,
  ChevronRight,
} from "lucide-react"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/psicologos", label: "Psicólogos", icon: UserCheck },
  { href: "/admin/pacientes", label: "Pacientes", icon: Users },
  { href: "/admin/citas", label: "Citas", icon: CalendarDays },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-full">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm block">PsyConnect</span>
              <span className="text-xs text-muted-foreground">Panel Admin</span>
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

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
