// ============================================================
// Video Call Service — Stubs for Daily.co / Jitsi / Google Meet
// ============================================================

export interface VideoRoom {
  roomId: string
  url: string
  expiresAt?: string
}

// ─── Daily.co (stub) ──────────────────────────────────────────
export async function createDailyRoom(appointmentId: string, duration: number) {
  // TODO: Implement with Daily.co
  // const response = await fetch('https://api.daily.co/v1/rooms', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.DAILY_API_KEY}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name: `psy-${appointmentId}`, properties: { max_participants: 2 } }),
  // })
  const expiresAt = new Date(Date.now() + duration * 60 * 1000 + 30 * 60 * 1000).toISOString()
  console.log(`[Daily.co STUB] Room for appointment: ${appointmentId}`)
  return {
    success: true,
    room: {
      roomId: `psy-${appointmentId}`,
      url: `https://psyconnect.daily.co/psy-${appointmentId}`,
      expiresAt,
    } as VideoRoom,
  }
}

// ─── Jitsi Meet (free, no API key needed) ──────────────────────
export function createJitsiRoom(appointmentId: string): VideoRoom {
  const roomId = `PsyConnect-${appointmentId}`
  return {
    roomId,
    url: `https://meet.jit.si/${roomId}`,
  }
}

// ─── Google Meet link (stub — requires Google Workspace) ───────
export async function createGoogleMeetLink(calendarEventId: string) {
  // TODO: Implement with Google Calendar API conferenceData
  console.log(`[Google Meet STUB] Event: ${calendarEventId}`)
  return {
    success: true,
    url: `https://meet.google.com/stub-${calendarEventId}`,
  }
}

// ─── Update appointment with session link ──────────────────────
export async function updateAppointmentLink(appointmentId: string, sessionLink: string) {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({ session_link: sessionLink })
    .eq("id", appointmentId)

  return { success: !error, error: error?.message }
}
