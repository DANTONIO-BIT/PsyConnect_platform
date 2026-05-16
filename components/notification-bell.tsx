"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      setNotifications(data || [])
      setUnread(data?.filter((n: any) => !n.is_read).length ?? 0)
    }
    load()
  }, [userId])

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
    setUnread(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ahora"
    if (mins < 60) return `Hace ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${Math.floor(hours / 24)}d`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <CheckCheck className="w-3 h-3" /> Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 ${
                      !n.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Sin notificaciones
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
