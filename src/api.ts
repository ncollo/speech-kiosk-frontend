/* Typed client for the ClearCaption backend (FastAPI in ./backend). */

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const TOKEN_KEY = 'clearcaption_token'

export type Portal = 'admin' | 'staff'
export type StaffRole =
  | 'Hospital Administrator'
  | 'Triage Nurse'
  | 'Reception Officer'
  | 'Medical Doctor'
  | 'KSL Interpreter'
  | 'Audiology Specialist'
export type StaffStatus = 'Active' | 'On-Duty' | 'Break' | 'Offline'
export type PatientStatus = 'Checking In' | 'Waiting' | 'In Triage' | 'With Doctor' | 'Pharmacy' | 'Admitted' | 'Discharged' | 'Completed'

export const ROLES: StaffRole[] = [
  'Hospital Administrator', 'Triage Nurse', 'Reception Officer', 'Medical Doctor', 'KSL Interpreter', 'Audiology Specialist',
]
export const STAFF_STATUSES: StaffStatus[] = ['Active', 'On-Duty', 'Break', 'Offline']
export const PATIENT_STATUSES: PatientStatus[] = ['Checking In', 'Waiting', 'In Triage', 'With Doctor', 'Pharmacy', 'Admitted', 'Discharged', 'Completed']

export type StaffUser = {
  id: string
  badgeId: string
  name: string
  role: StaffRole
  department: string
  email: string
  phone: string
  status: StaffStatus
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export type TranscriptTurn = {
  id: number
  speaker: 'nurse' | 'patient' | 'system'
  channel: string
  text: string
  confidence?: number | null
  isUncertain?: boolean
  originalText?: string | null
  editedBy?: string | null
  editedAt?: string | null
  createdAt: string
}

export type Patient = {
  id: string
  name: string
  symptom: string | null
  symptomSw: string | null
  places: string[]
  duration: string | null
  urgent: boolean
  desk: string
  terminalId: string | null
  lang: string
  status: PatientStatus
  consentGiven: boolean
  consentRecordedAt: string | null
  summaryNotes: string | null
  diagnosis: string | null
  prescription: string | null
  disposition: string | null
  ward: string | null
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  transcript?: TranscriptTurn[]
}

export type Terminal = {
  id: string
  desk: string
  location: string
  deviceType: string
  microphone: string
  micStatus: 'ready' | 'listening' | 'muted' | 'paused' | string
  assignedTo: string | null
  online: boolean
  inSession: boolean
  lastHeartbeatAt: string | null
  latencyMs: number | null
  intakes24h: number
}

export type SymptomCardItem = {
  id: string
  en: string
  sw: string
  iconKey: string
  keywords: string[]
  urgent: boolean
  isActive: boolean
  sortOrder: number
}

export type KslPromptItem = {
  id: string
  title: string
  questionEn: string
  questionSw: string
  kslGloss: string
  triggerKeywords: string[]
  videoUrl: string
  durationSec: number
  isActive: boolean
  sortOrder: number
}

export type InterpreterRequest = {
  id: number
  desk: string
  patientId: string | null
  patientName: string | null
  source: 'kiosk' | 'staff'
  requestedBy: string
  handledBy: string | null
  status: 'Pending' | 'Dispatched' | 'Resolved'
  createdAt: string
  updatedAt: string
}

export type DeskMessage = { id: number; terminalId: string; patientId: string | null; sender: string; text: string; createdAt: string }
export type AuditEntry = {
  id: number
  createdAt: string
  eventType: string
  actorId: string | null
  actorName: string | null
  terminalId: string | null
  patientId: string | null
  details: string
}
export type Stats = {
  staffTotal: number
  staffOnDuty: number
  staffByStatus: Record<string, number>
  kiosksTotal: number
  kiosksOnline: number
  intakes24h: number
  urgentOpen: number
  patientsByStatus: Record<string, number>
  interpreterOpen: number
  screenWipes24h: number
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const auth = {
  get token() {
    return sessionStorage.getItem(TOKEN_KEY)
  },
  set(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY)
  },
}

type Opts = { method?: string; body?: unknown; signal?: AbortSignal; timeoutMs?: number }

async function request<T>(path: string, { method = 'GET', body, signal, timeoutMs = 10000 }: Opts = {}): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  signal?.addEventListener('abort', () => ctrl.abort())
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the ClearCaption server. Check that the backend is running.')
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') message = data.detail
      else if (Array.isArray(data.detail)) message = data.detail.map((d: { msg: string }) => d.msg).join(', ')
    } catch {
      /* keep default message */
    }
    if (res.status === 401) {
      auth.clear()
      window.dispatchEvent(new Event('clearcaption:unauthorized'))
    }
    throw new ApiError(res.status, message)
  }
  return (await res.json()) as T
}

const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') s.set(k, String(v))
  })
  const str = s.toString()
  return str ? `?${str}` : ''
}

export const api = {
  health: () => request<{ status: string; database: { connected: boolean; engine: string } }>('/api/health', { timeoutMs: 4000 }),

  // Staff auth
  login: (badgeId: string, pin: string) =>
    request<{ token: string; portal: Portal; user: StaffUser }>('/api/auth/login', { method: 'POST', body: { badge_id: badgeId, pin } }),
  me: () => request<{ portal: Portal; user: StaffUser }>('/api/auth/me'),
  setMyStatus: (status: StaffStatus) => request<StaffUser>('/api/auth/me/status', { method: 'PATCH', body: { status } }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Staff directory
  users: (params: { role?: string; status?: string; search?: string } = {}) => request<StaffUser[]>(`/api/users${qs(params)}`),
  createUser: (body: { name: string; role: StaffRole; department: string; phone?: string; pin?: string }) =>
    request<{ user: StaffUser; pin: string }>('/api/users', { method: 'POST', body }),
  updateUser: (id: string, body: Partial<{ name: string; role: StaffRole; department: string; phone: string; status: StaffStatus; is_active: boolean }>) =>
    request<StaffUser>(`/api/users/${id}`, { method: 'PATCH', body }),
  resetPin: (id: string) => request<{ user: StaffUser; pin: string }>(`/api/users/${id}/reset-pin`, { method: 'POST' }),

  // Patients
  patients: (params: { status?: string; desk?: string; urgent?: boolean; active?: boolean; search?: string } = {}) =>
    request<Patient[]>(`/api/patients${qs(params)}`),
  patient: (id: string) => request<Patient>(`/api/patients/${id}`),
  setPatientStatus: (id: string, status: PatientStatus) => request<Patient>(`/api/patients/${id}/status`, { method: 'PATCH', body: { status } }),
  assignToMe: (id: string) => request<Patient>(`/api/patients/${id}/assign`, { method: 'PATCH', body: { assign_to_me: true } }),
  addClinicianTurn: (id: string, body: { text: string; confidence?: number; is_uncertain?: boolean; channel?: string }) =>
    request<TranscriptTurn>(`/api/patients/${id}/turns`, { method: 'POST', body }),
  editTurn: (patientId: string, turnId: number, text: string) =>
    request<TranscriptTurn>(`/api/patients/${patientId}/turns/${turnId}`, { method: 'PATCH', body: { text } }),
  repeatCaption: (patientId: string) =>
    request<{ ok: boolean; text: string; turn: TranscriptTurn }>(`/api/patients/${patientId}/repeat-caption`, { method: 'POST' }),
  endSession: (patientId: string, summaryNotes?: string) =>
    request<{ ok: boolean; purged: boolean; patientId?: string; patient?: Patient }>(`/api/patients/${patientId}/end-session`, {
      method: 'POST',
      body: summaryNotes ? { summary_notes: summaryNotes } : {},
    }),
  setDisposition: (
    patientId: string,
    body: { action: 'pharmacy' | 'discharged' | 'admitted'; diagnosis?: string; prescription?: string; ward?: string; notes?: string },
  ) => request<Patient>(`/api/patients/${patientId}/disposition`, { method: 'POST', body }),

  // Operations
  terminals: () => request<Terminal[]>('/api/terminals'),
  sendDeskMessage: (terminalId: string, text: string, patientId?: string) =>
    request<DeskMessage & { online: boolean }>(`/api/terminals/${terminalId}/messages`, { method: 'POST', body: { text, patient_id: patientId } }),
  interpreterRequests: (openOnly = true) => request<InterpreterRequest[]>(`/api/interpreter-requests${qs({ open_only: openOnly })}`),
  requestInterpreter: (desk: string, patientId?: string) =>
    request<InterpreterRequest>('/api/interpreter-requests', { method: 'POST', body: { desk, patient_id: patientId } }),
  updateInterpreter: (id: number, status: InterpreterRequest['status']) =>
    request<InterpreterRequest>(`/api/interpreter-requests/${id}`, { method: 'PATCH', body: { status } }),
  auditLogs: (eventType?: string) => request<AuditEntry[]>(`/api/audit/logs${qs({ event_type: eventType, limit: 200 })}`),
  stats: () => request<Stats>('/api/stats'),
}

export const kioskApi = {
  terminals: () => request<{ id: string; desk: string; location: string }[]>('/api/kiosk/terminals'),
  poll: (terminalId: string, after: number, patientId?: string | null, latencyMs?: number) =>
    request<{
      terminal: { id: string; desk: string; location: string; micStatus?: string }
      latestId: number
      messages: DeskMessage[]
      interpreter: InterpreterRequest | null
    }>(`/api/kiosk/${terminalId}/poll${qs({ after, patient_id: patientId, latency_ms: latencyMs })}`, { timeoutMs: 6000 }),
  startIntake: (terminalId: string, lang: string, consentGiven = true) =>
    request<Patient>(`/api/kiosk/${terminalId}/intakes`, { method: 'POST', body: { lang, consent_given: consentGiven } }),
  updateIntake: (
    patientId: string,
    body: Partial<{ name: string; symptom: string; symptom_sw: string; places: string[]; duration: string; urgent: boolean; lang: string; complete: boolean }>,
  ) => request<Patient>(`/api/kiosk/intakes/${patientId}`, { method: 'PATCH', body }),
  addTurn: (
    patientId: string,
    speaker: 'nurse' | 'patient' | 'system',
    channel: string,
    text: string,
    confidence?: number,
    isUncertain?: boolean,
  ) => request<TranscriptTurn>(`/api/kiosk/intakes/${patientId}/turns`, { method: 'POST', body: { speaker, channel, text, confidence, is_uncertain: isUncertain ?? false } }),
  requestInterpreter: (terminalId: string, patientId?: string | null) =>
    request<InterpreterRequest>(`/api/kiosk/${terminalId}/interpreter`, { method: 'POST', body: { patient_id: patientId ?? null } }),
  wipe: (terminalId: string, patientId?: string | null) =>
    request<{ ok: boolean; purged?: boolean }>(`/api/kiosk/${terminalId}/wipe`, { method: 'POST', body: { patient_id: patientId ?? null } }),
}

export const catalogApi = {
  listSymptomCards: (includeInactive = false) =>
    request<{ items: SymptomCardItem[] }>(`/api/catalog/symptom-cards${qs({ include_inactive: includeInactive || undefined })}`),
  createSymptomCard: (body: { en: string; sw: string; icon_key: string; keywords: string[]; urgent: boolean; is_active?: boolean }) =>
    request<SymptomCardItem>('/api/catalog/symptom-cards', { method: 'POST', body }),
  updateSymptomCard: (
    id: string,
    body: Partial<{ en: string; sw: string; icon_key: string; keywords: string[]; urgent: boolean; is_active: boolean }>,
  ) => request<SymptomCardItem>(`/api/catalog/symptom-cards/${id}`, { method: 'PATCH', body }),
  deleteSymptomCard: (id: string) => request<{ ok: boolean }>(`/api/catalog/symptom-cards/${id}`, { method: 'DELETE' }),

  listKslPrompts: (includeInactive = false) =>
    request<{ items: KslPromptItem[] }>(`/api/catalog/ksl-prompts${qs({ include_inactive: includeInactive || undefined })}`),
  createKslPrompt: (body: {
    title: string
    question_en: string
    question_sw: string
    ksl_gloss?: string
    trigger_keywords: string[]
    video_url?: string
    duration_sec?: number
    is_active?: boolean
  }) => request<KslPromptItem>('/api/catalog/ksl-prompts', { method: 'POST', body }),
  updateKslPrompt: (
    id: string,
    body: Partial<{
      title: string
      question_en: string
      question_sw: string
      ksl_gloss: string
      trigger_keywords: string[]
      video_url: string
      duration_sec: number
      is_active: boolean
    }>,
  ) => request<KslPromptItem>(`/api/catalog/ksl-prompts/${id}`, { method: 'PATCH', body }),
  deleteKslPrompt: (id: string) => request<{ ok: boolean }>(`/api/catalog/ksl-prompts/${id}`, { method: 'DELETE' }),
  uploadKslVideo: async (id: string, file: File): Promise<KslPromptItem> => {
    const form = new FormData()
    form.append('file', file)
    const headers: Record<string, string> = {}
    if (auth.token) headers.Authorization = `Bearer ${auth.token}`
    const res = await fetch(`${BASE}/api/catalog/ksl-prompts/${id}/upload`, { method: 'POST', headers, body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Upload failed')
    return data
  },
  matchText: (text: string) =>
    request<{ matchedCards: SymptomCardItem[]; matchedKslPrompt: KslPromptItem | null }>('/api/catalog/match', { method: 'POST', body: { text } }),
}

export function terminalWsUrl(terminalId: string): string {
  if (BASE) {
    return `${BASE.replace(/^http/, 'ws')}/api/ws/terminal/${terminalId}`
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/ws/terminal/${terminalId}`
}

/* ---------- helpers ---------- */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'Never'
  const diff = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (diff < 45) return 'Just now'
  const m = Math.round(diff / 60)
  if (m < 60) return `${m} min${m === 1 ? '' : 's'} ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.round(h / 24)
  return d === 1 ? 'Yesterday' : `${d} days ago`
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

