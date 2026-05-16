"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react"

interface Props {
  psychologistId: string
  currentStatus: string
}

export const PsychologistActions = ({ psychologistId, currentStatus }: Props) => {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)

  const updateStatus = async (status: "approved" | "rejected", reason?: string) => {
    setLoading(status === "approved" ? "approve" : "reject")
    const supabase = createClient()

    await supabase
      .from("psychologists")
      .update({ status, rejection_reason: reason ?? null })
      .eq("id", psychologistId)

    setLoading(null)
    setShowRejectModal(false)
    router.refresh()
  }

  if (currentStatus === "approved") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
      </span>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <a
          href={`/admin/psicologos/${psychologistId}`}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Ver perfil completo"
        >
          <Eye className="w-4 h-4" />
        </a>

        {currentStatus === "pending" && (
          <>
            <button
              onClick={() => updateStatus("approved")}
              disabled={loading !== null}
              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors disabled:opacity-50"
              title="Aprobar"
            >
              {loading === "approve" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading !== null}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
              title="Rechazar"
            >
              {loading === "reject" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-semibold text-foreground mb-2">Rechazar solicitud</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explica brevemente el motivo del rechazo. El psicólogo recibirá esta información por email.
            </p>
            <textarea
              placeholder="Ej: La documentación adjunta no es legible. Por favor re-sube los documentos con mayor resolución."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateStatus("rejected", rejectReason)}
                disabled={!rejectReason.trim() || loading !== null}
                className="px-4 py-2 text-sm rounded-xl bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading === "reject" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
