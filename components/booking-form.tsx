"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, UserCheck, CalendarDays, ArrowRight } from "lucide-react"

// The landing booking form now drives users into the real platform flow
// instead of being a disconnected static form.

export function BookingForm() {
  const router = useRouter()

  const steps = [
    {
      icon: Search,
      title: "Encuentra tu psicólogo",
      description: "Filtra por especialidad, país e idioma en nuestro directorio verificado.",
    },
    {
      icon: CalendarDays,
      title: "Elige fecha y horario",
      description: "Selecciona el horario que mejor encaje con tu agenda.",
    },
    {
      icon: UserCheck,
      title: "Confirma y conecta",
      description: "Recibes confirmación al instante. Únete a tu sesión por videollamada segura.",
    },
  ]

  return (
    <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">Agenda tu primera sesión</h3>
        <p className="text-sm text-muted-foreground mt-1">
          En menos de 2 minutos conectas con el profesional adecuado.
        </p>
      </div>

      {/* Mini steps */}
      <div className="space-y-4">
        {steps.map(({ icon: Icon, title, description }, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={() => router.push("/auth/signup")}
          className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full py-5 text-sm gap-2 group"
        >
          Crear cuenta gratuita
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/psicologos")}
          className="w-full rounded-full py-5 text-sm border-primary text-primary hover:bg-primary/10"
        >
          Ver psicólogos disponibles
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={() => router.push("/auth/login")}
          className="text-primary hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </div>
  )
}
