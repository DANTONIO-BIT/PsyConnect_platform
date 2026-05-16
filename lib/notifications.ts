// ============================================================
// Notification Service — In-app + stubs for WhatsApp/Email/Push
// ============================================================

import { createClient } from "@/lib/supabase/server"
import type { NotificationType, NotificationChannel } from "@/types/database"

export interface NotificationPayload {
  userId: string
  type: NotificationType
  title: string
  message: string
  channel?: NotificationChannel
  metadata?: Record<string, unknown>
}

// ─── In-App Notification (always works) ────────────────────────
export async function createNotification(payload: NotificationPayload) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      channel: payload.channel || "in_app",
      metadata: payload.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// ─── Get unread count for a user ───────────────────────────────
export async function getUnreadCount(userId: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) return 0
  return count ?? 0
}

// ─── Mark notification as read ─────────────────────────────────
export async function markAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)

  return { success: !error, error: error?.message }
}

// ─── Mark all as read for a user ───────────────────────────────
export async function markAllAsRead(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  return { success: !error, error: error?.message }
}

// ─── WhatsApp (stub — ready for Twilio / WhatsApp Business API) ─
export async function sendWhatsApp(phone: string, message: string) {
  // TODO: Implement with Twilio or WhatsApp Business API
  // Example with Twilio:
  // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  // await twilio.messages.create({
  //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  //   to: `whatsapp:${phone}`,
  //   body: message,
  // })
  console.log(`[WhatsApp STUB] To: ${phone} — ${message}`)
  return { success: true, provider: "stub" }
}

// ─── Email (stub — ready for Resend / SendGrid) ────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  // TODO: Implement with Resend or SendGrid
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'PsyConnect <noreply@psyconnect.cl>',
  //   to,
  //   subject,
  //   html,
  // })
  console.log(`[Email STUB] To: ${to} — Subject: ${subject}`)
  return { success: true, provider: "stub" }
}

// ─── Push Notification (stub — ready for Web Push / FCM) ───────
export async function sendPush(userId: string, title: string, body: string) {
  // TODO: Implement with Web Push API or Firebase Cloud Messaging
  console.log(`[Push STUB] User: ${userId} — ${title}: ${body}`)
  return { success: true, provider: "stub" }
}

// ─── Multi-channel dispatcher ──────────────────────────────────
export async function dispatchNotification(payload: NotificationPayload & { phone?: string; email?: string }) {
  const channels = payload.channel ? [payload.channel] : ["in_app"]
  const results: { channel: string; success: boolean }[] = []

  // Always create in-app notification
  if (channels.includes("in_app")) {
    const result = await createNotification(payload)
    results.push({ channel: "in_app", success: result.success })
  }

  // WhatsApp
  if (channels.includes("whatsapp") && payload.phone) {
    const result = await sendWhatsApp(payload.phone, payload.message)
    results.push({ channel: "whatsapp", success: result.success })
  }

  // Email
  if (channels.includes("email") && payload.email) {
    const result = await sendEmail(payload.email, payload.title, payload.message)
    results.push({ channel: "email", success: result.success })
  }

  // Push
  if (channels.includes("push")) {
    const result = await sendPush(payload.userId, payload.title, payload.message)
    results.push({ channel: "push", success: result.success })
  }

  return results
}
