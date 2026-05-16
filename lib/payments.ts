// ============================================================
// Payment Service — Stubs for Stripe / MercadoPago
// ============================================================

import { createClient } from "@/lib/supabase/server"

export interface PaymentIntent {
  appointmentId: string
  amount: number
  currency: "CLP" | "EUR" | "USD"
  patientId: string
  psychologistId: string
}

// ─── Create payment record ─────────────────────────────────────
export async function createPaymentRecord(intent: PaymentIntent) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("payments")
    .insert({
      appointment_id: intent.appointmentId,
      patient_id: intent.patientId,
      psychologist_id: intent.psychologistId,
      amount: intent.amount,
      currency: intent.currency,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating payment:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// ─── Stripe (stub) ─────────────────────────────────────────────
export async function createStripeCheckoutSession(paymentId: string, amount: number, currency: string, successUrl: string, cancelUrl: string) {
  // TODO: Implement with Stripe
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   line_items: [{ price_data: { currency, unit_amount: amount * 100, product_data: { name: 'PsyConnect Session' } }, quantity: 1 }],
  //   mode: 'payment',
  //   success_url: successUrl,
  //   cancel_url: cancelUrl,
  // })
  console.log(`[Stripe STUB] Payment: ${paymentId} — ${amount} ${currency}`)
  return { success: true, sessionId: "stub_session_id", url: "https://checkout.stripe.com/stub" }
}

// ─── MercadoPago (stub) ────────────────────────────────────────
export async function createMercadoPagoPreference(paymentId: string, amount: number, title: string) {
  // TODO: Implement with MercadoPago SDK
  // const mercadopago = require('mercadopago')
  // mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN })
  // const preference = await mercadopago.preferences.create({ ... })
  console.log(`[MercadoPago STUB] Payment: ${paymentId} — ${amount}`)
  return { success: true, preferenceId: "stub_preference_id", url: "https://mpago.st/stub" }
}

// ─── Mark payment as paid ──────────────────────────────────────
export async function markPaymentPaid(paymentId: string, providerRef: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      provider_ref: providerRef,
    })
    .eq("id", paymentId)

  return { success: !error, error: error?.message }
}

// ─── Get payments for a user ───────────────────────────────────
export async function getUserPayments(userId: string, role: "patient" | "psychologist") {
  const supabase = await createClient()
  const column = role === "patient" ? "patient_id" : "psychologist_id"

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq(column, userId)
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}
