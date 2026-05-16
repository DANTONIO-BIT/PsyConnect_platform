// ============================================================
// Database types — mirrors the Supabase schema exactly (v2)
// Run scripts/schema.sql in Supabase SQL Editor first
// ============================================================

export type UserRole = "patient" | "psychologist" | "admin"
export type PsychologistStatus = "pending" | "approved" | "rejected"
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
export type Country = "CL" | "ES"
export type RecordType = "session_note" | "assessment" | "treatment_plan" | "progress_note"
export type RiskLevel = "low" | "medium" | "high" | "critical"
export type NotificationType = "appointment_created" | "appointment_reminder" | "appointment_cancelled" | "appointment_completed" | "new_patient" | "payment_received" | "document_uploaded" | "system"
export type NotificationChannel = "in_app" | "email" | "whatsapp" | "push"
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed"
export type PaymentProvider = "stripe" | "mercadopago" | "manual"

// ------ profiles (extends auth.users) ------
export interface Profile {
  id: string // uuid — matches auth.users.id
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  country: Country
  phone: string | null
  created_at: string
  updated_at: string
}

// ------ psychologists ------
export interface Psychologist {
  id: string // references profiles.id
  specialties: string[]
  bio: string
  experience_years: number
  registration_number: string // colegiado (ES) / Minsal (CL)
  languages: string[]
  session_price_clp: number | null
  session_price_eur: number | null
  status: PsychologistStatus
  rejection_reason: string | null
  documents_urls: string[]
  available_hours: AvailableHours
  session_modality: ("online" | "presential" | "both")[]
  created_at: string
  updated_at: string
  profile?: Profile
}

// ------ patients ------
export interface Patient {
  id: string // references profiles.id
  date_of_birth: string | null
  emergency_contact: string | null
  notes: string | null
  assigned_psychologist_id: string | null
  created_at: string
  profile?: Profile
}

// ------ appointments ------
export interface Appointment {
  id: string
  psychologist_id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: AppointmentStatus
  session_link: string | null
  notes: string | null
  google_event_id: string | null
  created_at: string
  updated_at: string
  psychologist?: Psychologist & { profile: Profile }
  patient?: Patient & { profile: Profile }
}

// ------ patient_records (clinical notes / fichas) ------
export interface PatientRecord {
  id: string
  patient_id: string
  psychologist_id: string
  session_date: string
  record_type: RecordType
  title: string
  content: string
  mood_score: number | null // 1-10
  risk_level: RiskLevel | null
  next_steps: string | null
  created_at: string
  updated_at: string
  patient?: Patient & { profile: Profile }
}

// ------ notifications ------
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  channel: NotificationChannel
  metadata: Record<string, unknown>
  sent_at: string | null
  created_at: string
}

// ------ payments ------
export interface Payment {
  id: string
  appointment_id: string
  patient_id: string
  psychologist_id: string
  amount: number
  currency: "CLP" | "EUR" | "USD"
  status: PaymentStatus
  provider: PaymentProvider | null
  provider_ref: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

// ------ helpers ------
export type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type AvailableHours = Partial<Record<WeekDay, string[]>>

// ------ Supabase DB helper type ------
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at" | "updated_at">; Update: Partial<Profile> }
      psychologists: { Row: Psychologist; Insert: Omit<Psychologist, "created_at" | "updated_at">; Update: Partial<Psychologist> }
      patients: { Row: Patient; Insert: Omit<Patient, "created_at">; Update: Partial<Patient> }
      appointments: { Row: Appointment; Insert: Omit<Appointment, "id" | "created_at" | "updated_at">; Update: Partial<Appointment> }
      patient_records: { Row: PatientRecord; Insert: Omit<PatientRecord, "id" | "created_at" | "updated_at">; Update: Partial<PatientRecord> }
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Notification> }
      payments: { Row: Payment; Insert: Omit<Payment, "id" | "created_at" | "updated_at">; Update: Partial<Payment> }
    }
  }
}
