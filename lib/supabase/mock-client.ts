// ================================================================
// Mock Supabase client — used when NEXT_PUBLIC_SUPABASE_URL is a
// placeholder. Mimics the chained query-builder API so every page
// works without a real database connection.
// ================================================================

import {
  MOCK_PROFILES,
  MOCK_PSYCHOLOGISTS,
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
} from "@/lib/mock-data"

// ─── Pre-build joined row shapes ─────────────────────────────────
// Pages access nested relations (profiles, patient, psychologist…).
// We embed them upfront so the QB's eq/filter logic just works.

/** psychologists rows → { ...psy, profiles: profile } */
const PSY_ROWS = MOCK_PSYCHOLOGISTS.map(({ profile, ...psy }) => ({
  ...psy,
  profiles: profile,
}))

/** patients rows → { ...pat, profiles, assigned_psychologist, appointments:[{count}] } */
const PAT_ROWS = MOCK_PATIENTS.map(({ profile, ...pat }) => {
  const assignedPsy = MOCK_PSYCHOLOGISTS.find(
    (p) => p.id === pat.assigned_psychologist_id
  )
  const apptCount = MOCK_APPOINTMENTS.filter(
    (a) => a.patient_id === pat.id
  ).length
  return {
    ...pat,
    profiles: profile,
    assigned_psychologist: assignedPsy
      ? { profiles: { full_name: assignedPsy.profile.full_name } }
      : null,
    appointments: [{ count: apptCount }],
  }
})

/** appointments rows — both alias styles ("patient" and "patients") */
const APT_ROWS = MOCK_APPOINTMENTS.map((apt) => {
  const psy = MOCK_PSYCHOLOGISTS.find((p) => p.id === apt.psychologist_id)
  const pat = MOCK_PATIENTS.find((p) => p.id === apt.patient_id)
  const patProfiles = pat
    ? {
        full_name: pat.profile.full_name,
        email:     pat.profile.email,
        avatar_url: pat.profile.avatar_url,
      }
    : null
  const psyProfiles = psy
    ? { full_name: psy.profile.full_name }
    : null
  return {
    ...apt,
    // Supabase alias: "patient:patients(...)"  → apt.patient
    patient:       pat ? { profiles: patProfiles } : null,
    // plain join:  "patients(...)"             → apt.patients
    patients:      pat ? { profiles: patProfiles } : null,
    // Supabase alias: "psychologist:psychologists(...)" → apt.psychologist
    psychologist:  psy ? { profiles: psyProfiles } : null,
    // plain join:  "psychologists(...)"        → apt.psychologists
    psychologists: psy ? { profiles: psyProfiles } : null,
  }
})

const TABLE: Record<string, any[]> = {
  profiles:      MOCK_PROFILES,
  psychologists: PSY_ROWS,
  patients:      PAT_ROWS,
  appointments:  APT_ROWS,
}

// ─── Query Builder ───────────────────────────────────────────────

class QueryBuilder {
  private rows: any[]
  private _isCount = false
  private _isHead  = false

  constructor(table: string, opts?: { count?: string; head?: boolean }) {
    this.rows      = [...(TABLE[table] ?? [])]
    this._isCount  = opts?.count === "exact"
    this._isHead   = opts?.head ?? false
  }

  // Subsequent .select() calls (e.g., after .from().select()) re-configure opts
  select(cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count === "exact") this._isCount = true
    if (opts?.head)              this._isHead  = true
    return this
  }

  eq(col: string, val: any) {
    this.rows = this.rows.filter((r) => this._get(r, col) === val)
    return this
  }

  neq(col: string, val: any) {
    this.rows = this.rows.filter((r) => this._get(r, col) !== val)
    return this
  }

  in(col: string, vals: any[]) {
    this.rows = this.rows.filter((r) => vals.includes(this._get(r, col)))
    return this
  }

  gte(col: string, val: any) {
    this.rows = this.rows.filter((r) => {
      const v = this._get(r, col)
      return v != null && v >= val
    })
    return this
  }

  gt(col: string, val: any) {
    this.rows = this.rows.filter((r) => {
      const v = this._get(r, col)
      return v != null && v > val
    })
    return this
  }

  lte(col: string, val: any) {
    this.rows = this.rows.filter((r) => {
      const v = this._get(r, col)
      return v != null && v <= val
    })
    return this
  }

  lt(col: string, val: any) {
    this.rows = this.rows.filter((r) => {
      const v = this._get(r, col)
      return v != null && v < val
    })
    return this
  }

  ilike(col: string, pattern: string) {
    const term = pattern.replace(/%/g, "").toLowerCase()
    this.rows = this.rows.filter((r) => {
      const v = this._get(r, col)
      return typeof v === "string" && v.toLowerCase().includes(term)
    })
    return this
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending ?? true
    this.rows.sort((a, b) => {
      const av = this._get(a, col) ?? ""
      const bv = this._get(b, col) ?? ""
      if (av < bv) return asc ? -1 : 1
      if (av > bv) return asc ? 1 : -1
      return 0
    })
    return this
  }

  limit(n: number) {
    this.rows = this.rows.slice(0, n)
    return this
  }

  range(from: number, to: number) {
    this.rows = this.rows.slice(from, to + 1)
    return this
  }

  single() {
    const row = this.rows[0] ?? null
    return Promise.resolve(
      row
        ? { data: row, error: null }
        : { data: null, error: { message: "Not found", code: "PGRST116" } }
    )
  }

  // Makes instances awaitable: `const { data } = await qb`
  then(
    resolve: (v: any) => any,
    reject?: (e: any) => any
  ): Promise<any> {
    const result =
      this._isCount && this._isHead
        ? { data: null, count: this.rows.length, error: null }
        : { data: this.rows, error: null }
    return Promise.resolve(result).then(resolve, reject)
  }

  // Dot-notation getter for nested fields (e.g. "profiles.full_name")
  private _get(row: any, col: string): any {
    return col.split(".").reduce((obj, key) => obj?.[key], row)
  }
}

// ─── From Builder ────────────────────────────────────────────────

class FromBuilder {
  constructor(private table: string) {}

  select(cols?: string, opts?: { count?: string; head?: boolean }) {
    return new QueryBuilder(this.table, opts)
  }

  insert(vals: any) {
    return Promise.resolve({
      data: Array.isArray(vals) ? vals : [vals],
      error: null,
    })
  }

  upsert(vals: any, _opts?: any) {
    return Promise.resolve({
      data: Array.isArray(vals) ? vals : [vals],
      error: null,
    })
  }

  update(vals: any) {
    return {
      eq:    (_c: string, _v: any) => Promise.resolve({ data: vals,  error: null }),
      match: (_f: any)             => Promise.resolve({ data: vals,  error: null }),
    }
  }

  delete() {
    return {
      eq:    (_c: string, _v: any) => Promise.resolve({ data: null, error: null }),
      match: (_f: any)             => Promise.resolve({ data: null, error: null }),
    }
  }
}

// ─── Mock Auth User ──────────────────────────────────────────────
// We impersonate the first approved psychologist so the /dashboard/psicologo
// pages show rich realistic data right away.

const MOCK_AUTH_USER = {
  id:            MOCK_PSYCHOLOGISTS[0].id,  // "mock-psy-001"
  email:         MOCK_PSYCHOLOGISTS[0].profile.email,
  user_metadata: {},
  app_metadata:  {},
}

// ─── Mock Supabase Client ────────────────────────────────────────

export class MockSupabaseClient {
  auth = {
    getUser: () =>
      Promise.resolve({ data: { user: MOCK_AUTH_USER }, error: null }),

    getSession: () =>
      Promise.resolve({
        data: {
          session: { user: MOCK_AUTH_USER, access_token: "mock-token" },
        },
        error: null,
      }),

    signOut: () => Promise.resolve({ error: null }),

    onAuthStateChange: (cb: (event: string, session: any) => void) => {
      setTimeout(
        () => cb("SIGNED_IN", { user: MOCK_AUTH_USER }),
        0
      )
      return { data: { subscription: { unsubscribe: () => {} } } }
    },

    signInWithPassword: (_params: any) =>
      Promise.resolve({
        data: { user: MOCK_AUTH_USER, session: null },
        error: null,
      }),

    signUp: (_params: any) =>
      Promise.resolve({
        data: { user: MOCK_AUTH_USER, session: null },
        error: null,
      }),

    resetPasswordForEmail: (_email: string) =>
      Promise.resolve({ data: {}, error: null }),
  }

  from(table: string): FromBuilder {
    return new FromBuilder(table)
  }

  storage = {
    from: (_bucket: string) => ({
      upload: (_path: string, _file: any, _opts?: any) =>
        Promise.resolve({ data: { path: _path }, error: null }),

      getPublicUrl: (_path: string) => ({
        data: {
          publicUrl: `https://placehold.co/200x200/6B9B7A/ffffff?text=Avatar`,
        },
      }),

      remove: (_paths: string[]) =>
        Promise.resolve({ data: {}, error: null }),
    }),
  }

  channel(_name: string) {
    return {
      on: () => ({ subscribe: () => {} }),
    }
  }
}

export const createMockClient = () => new MockSupabaseClient()
