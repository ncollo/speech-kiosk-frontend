import { useState } from 'react'
import {
  Lock, ArrowLeft, CheckCircle, Warning, Stethoscope, Clock, MapPin,
  Heartbeat, ShieldCheck, SignOut, PhoneCall, PaperPlaneRight,
  ChatText, FirstAidKit, CaretRight, Broadcast
} from '@phosphor-icons/react'

type TriagePatient = {
  id: string
  name: string
  symptom: string
  symptomSw: string
  places: string[]
  duration: string
  urgent: boolean
  time: string
  desk: string
  lang: string
  status: 'Waiting' | 'In Triage' | 'With Doctor' | 'Completed'
}

const DEFAULT_PATIENTS: TriagePatient[] = [
  {
    id: 'PT-1042',
    name: 'Wanjiru Karanja',
    symptom: 'Chest Pain',
    symptomSw: 'Maumivu ya Kifua',
    places: ['Chest, left', 'Throat'],
    duration: 'Since this morning',
    urgent: true,
    time: '2 mins ago',
    desk: 'Desk 3',
    lang: 'Kiswahili & KSL',
    status: 'Waiting',
  },
  {
    id: 'PT-1041',
    name: 'Brian Omondi',
    symptom: 'Fever or Chills',
    symptomSw: 'Homa',
    places: ['Head'],
    duration: 'A few days',
    urgent: false,
    time: '14 mins ago',
    desk: 'Desk 2',
    lang: 'English',
    status: 'In Triage',
  },
  {
    id: 'PT-1040',
    name: 'Faith Chebet',
    symptom: 'Abdominal Pain',
    symptomSw: 'Maumivu ya Tumbo',
    places: ['Stomach'],
    duration: 'More than a week',
    urgent: false,
    time: '28 mins ago',
    desk: 'Desk 3',
    lang: 'Kiswahili',
    status: 'With Doctor',
  },
]

export default function StaffPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('clearcaption_staff_auth') === 'true'
  })

  // Login form state
  const [staffId, setStaffId] = useState('NURSE-4029')
  const [pin, setPin] = useState('')
  const [department, setDepartment] = useState('Desk 3 · Outpatient Triage & Reception')
  const [loginError, setLoginError] = useState('')

  // Staff console state
  const [patients, setPatients] = useState<TriagePatient[]>(() => {
    const saved = localStorage.getItem('clearcaption_active_visit')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.name || parsed.symptom) {
          const livePatient: TriagePatient = {
            id: 'PT-' + Math.floor(1000 + Math.random() * 9000),
            name: parsed.name || 'Anonymous Patient',
            symptom: parsed.symptom?.[0] || 'Unspecified Concern',
            symptomSw: parsed.symptom?.[1] || '',
            places: parsed.places || [],
            duration: parsed.duration || 'Not stated',
            urgent: !!parsed.urgent,
            time: 'Just now',
            desk: 'Desk 3',
            lang: 'KSL Assisted',
            status: 'Waiting',
          }
          return [livePatient, ...DEFAULT_PATIENTS]
        }
      } catch (e) {
        console.error(e)
      }
    }
    return DEFAULT_PATIENTS
  })

  const [activePatientIndex, setActivePatientIndex] = useState(0)
  const [customPrompt, setCustomPrompt] = useState('')
  const [promptSentToast, setPromptSentToast] = useState('')
  const [interpreterCalled, setInterpreterCalled] = useState(false)

  const activePatient = patients[activePatientIndex] || patients[0]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Accept demo PIN 4821 or any 4-digit PIN for demo testing
    if (pin.trim() === '4821' || pin.trim().length === 4) {
      setIsAuthenticated(true)
      sessionStorage.setItem('clearcaption_staff_auth', 'true')
      setLoginError('')
    } else {
      setLoginError('Invalid PIN. Use demo PIN 4821')
    }
  }

  const handleQuickDemoFill = () => {
    setStaffId('NURSE-4029')
    setPin('4821')
    setDepartment('Desk 3 · Outpatient Triage & Reception')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('clearcaption_staff_auth')
  }

  const handleSendPrompt = (text: string) => {
    setPromptSentToast(`Sent to Desk 3 Screen: "${text}"`)
    setTimeout(() => setPromptSentToast(''), 4000)
    setCustomPrompt('')
  }

  const handleUpdateStatus = (newStatus: TriagePatient['status']) => {
    setPatients((prev) =>
      prev.map((p, idx) => (idx === activePatientIndex ? { ...p, status: newStatus } : p))
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col justify-between p-4 md:p-8">
        {/* Top bar */}
        <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
          <a
            href="#/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-ash hover:bg-line text-navy text-[14px] font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Hospital Home
          </a>
          <span className="text-[13px] text-slate font-medium">Authorized Staff Only · Kenyatta National Hospital</span>
        </div>

        {/* Login Box */}
        <div className="max-w-[480px] w-full mx-auto my-12 bg-ash/70 rounded-[28px] p-8 md:p-10 border border-line shadow-sm">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <span className="w-14 h-14 rounded-[18px] bg-brand text-canvas grid place-items-center shadow-md">
              <Lock size={26} weight="bold" />
            </span>
            <div>
              <h1 className="text-[26px] font-display font-bold tracking-tight">Clinician & Staff Console</h1>
              <p className="text-[14px] text-slate mt-1">Sign in to monitor Desk 3 triage captions and patient intakes</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate mb-1.5 uppercase tracking-wider">
                Assigned Desk / Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-12 px-4 rounded-[12px] bg-canvas border border-line text-[15px] font-medium text-navy focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
              >
                <option>Desk 3 · Outpatient Triage & Reception</option>
                <option>Desk 1 · Emergency Admitting</option>
                <option>Desk 2 · Pediatric Outpatient</option>
                <option>Desk 4 · Specialized Clinics</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate mb-1.5 uppercase tracking-wider">
                Staff Badge / ID
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. NURSE-4029"
                className="w-full h-12 px-4 rounded-[12px] bg-canvas border border-line text-[15px] text-navy focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[13px] font-semibold text-slate uppercase tracking-wider">
                  Security PIN
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[12px] text-accent font-semibold hover:underline"
                >
                  Quick Fill Demo PIN (4821)
                </button>
              </div>
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full h-12 px-4 rounded-[12px] bg-canvas border border-line text-[16px] text-navy focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none tracking-widest font-mono"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-[10px] bg-alert/10 text-alert text-[13px] flex items-center gap-2">
                <Warning size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full h-13 rounded-full bg-accent hover:bg-brand text-canvas font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Sign In to Clinician Console
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-center">
            <p className="text-[12px] text-slate flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} className="text-brand" />
              Confidential Patient Health System · Authorized Personnel Only
            </p>
          </div>
        </div>

        <div className="text-center text-[12px] text-slate pb-4">
          © 2026 ClearCaption Hospital Systems · Kenyatta National Hospital Integration
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col">
      {/* Top Clinician Header */}
      <header className="h-18 px-6 md:px-10 bg-ash/80 backdrop-blur-md border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="w-9 h-9 rounded-[10px] bg-canvas border border-line grid place-items-center text-navy hover:bg-ash transition-colors"
            title="Hospital Home"
          >
            <ArrowLeft size={16} />
          </a>
          <div className="flex items-center gap-2 font-display font-bold text-[20px] text-navy">
            <span className="w-8 h-8 rounded-[8px] bg-brand text-canvas grid place-items-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" />
              </svg>
            </span>
            ClearCaption <span className="text-[14px] font-normal text-slate">| Clinician Console</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint text-brand text-[13px] font-semibold border border-brand/20">
            <Broadcast size={16} className="animate-pulse" />
            <span>Connected: Desk 3 Live Kiosk</span>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="w-8 h-8 rounded-full bg-navy text-canvas grid place-items-center font-bold text-[12px]">
              JM
            </span>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-semibold leading-tight">Nurse Joyce Mwangi</span>
              <span className="text-[11px] text-slate">ID #{staffId}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-full bg-canvas hover:bg-alert/10 text-slate hover:text-alert border border-line text-[13px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <SignOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Console Grid */}
      <main className="flex-1 max-w-[1340px] w-full mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-6">
        {/* Left Column: Active Patient Overview & Live Transcript */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Intake Card */}
          <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-line">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] uppercase font-bold tracking-wider text-slate">Active Desk Intake</span>
                  <span className="h-5 px-2 rounded-full bg-sky text-[11px] text-navy font-semibold inline-flex items-center">
                    {activePatient.desk}
                  </span>
                </div>
                <h2 className="text-[28px] font-display font-bold text-navy flex items-center gap-3">
                  {activePatient.name}
                  {activePatient.urgent ? (
                    <span className="h-7 px-3 rounded-full bg-alert text-canvas text-[12px] font-bold inline-flex items-center gap-1">
                      <Warning size={14} weight="fill" /> URGENT TRIAGE
                    </span>
                  ) : (
                    <span className="h-7 px-3 rounded-full bg-brand/15 text-brand text-[12px] font-bold inline-flex items-center">
                      STANDARD TRIAGE
                    </span>
                  )}
                </h2>
                <p className="text-[13px] text-slate mt-0.5">Checked in {activePatient.time} · Communication: {activePatient.lang}</p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate font-medium">Status:</span>
                <select
                  value={activePatient.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as TriagePatient['status'])}
                  className="h-10 px-3 rounded-[10px] bg-canvas border border-line text-[13px] font-semibold text-navy focus:border-accent outline-none"
                >
                  <option value="Waiting">Waiting</option>
                  <option value="In Triage">In Triage</option>
                  <option value="With Doctor">With Doctor</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Medical Data Grid */}
            <div className="grid sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-[16px] bg-canvas border border-line">
                <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                  <Heartbeat size={16} className="text-accent" /> Chief Complaint
                </span>
                <p className="text-[17px] font-bold text-navy leading-tight">{activePatient.symptom}</p>
                {activePatient.symptomSw && (
                  <p className="text-[13px] text-slate mt-0.5">{activePatient.symptomSw}</p>
                )}
              </div>

              <div className="p-4 rounded-[16px] bg-canvas border border-line">
                <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                  <MapPin size={16} className="text-accent" /> Reported Pain Areas
                </span>
                <p className="text-[17px] font-bold text-navy leading-tight">
                  {activePatient.places.length ? activePatient.places.join(', ') : 'None specified'}
                </p>
                <p className="text-[13px] text-slate mt-0.5">Indicated via Body Map</p>
              </div>

              <div className="p-4 rounded-[16px] bg-canvas border border-line">
                <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                  <Clock size={16} className="text-accent" /> Duration
                </span>
                <p className="text-[17px] font-bold text-navy leading-tight">{activePatient.duration}</p>
                <p className="text-[13px] text-slate mt-0.5">Reported by patient</p>
              </div>
            </div>
          </div>

          {/* Live Transcript Log */}
          <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-display font-bold text-navy flex items-center gap-2">
                  <ChatText size={20} className="text-accent" /> Live Desk Conversation Stream
                </h3>
                <p className="text-[13px] text-slate">Synchronized real-time speech captions and patient inputs</p>
              </div>
              <span className="text-[12px] px-2.5 py-1 rounded-full bg-mint text-brand font-semibold border border-brand/20">
                Live Sync
              </span>
            </div>

            <div className="space-y-3 p-4 rounded-[18px] bg-canvas border border-line max-h-[300px] overflow-y-auto">
              <div className="flex flex-col gap-1 items-start text-left">
                <span className="text-[11px] font-bold text-slate uppercase">08:14 AM · Nurse (Spoken)</span>
                <div className="px-4 py-2.5 rounded-[12px] rounded-tl-sm bg-mint text-navy text-[15px] font-medium">
                  Good morning. Please tell me your name.
                </div>
              </div>

              <div className="flex flex-col gap-1 items-end text-right">
                <span className="text-[11px] font-bold text-slate uppercase">08:14 AM · Patient (On-Screen Keypad)</span>
                <div className="px-4 py-2 rounded-[12px] rounded-tr-sm bg-navy text-canvas text-[15px] font-bold">
                  {activePatient.name}
                </div>
              </div>

              <div className="flex flex-col gap-1 items-start text-left">
                <span className="text-[11px] font-bold text-slate uppercase">08:15 AM · Nurse (Spoken)</span>
                <div className="px-4 py-2.5 rounded-[12px] rounded-tl-sm bg-mint text-navy text-[15px] font-medium">
                  What brings you in today?
                </div>
              </div>

              <div className="flex flex-col gap-1 items-end text-right">
                <span className="text-[11px] font-bold text-slate uppercase">08:15 AM · Patient (Symptom Card)</span>
                <div className="px-4 py-2 rounded-[12px] rounded-tr-sm bg-navy text-canvas text-[15px] font-bold flex items-center gap-2">
                  <Heartbeat size={18} /> {activePatient.symptom} · {activePatient.symptomSw}
                </div>
              </div>

              <div className="flex flex-col gap-1 items-start text-left">
                <span className="text-[11px] font-bold text-slate uppercase">08:16 AM · Nurse (Spoken)</span>
                <div className="px-4 py-2.5 rounded-[12px] rounded-tl-sm bg-mint text-navy text-[15px] font-medium">
                  Can you show me where it hurts?
                </div>
              </div>

              <div className="flex flex-col gap-1 items-end text-right">
                <span className="text-[11px] font-bold text-slate uppercase">08:16 AM · Patient (Body Map)</span>
                <div className="px-4 py-2 rounded-[12px] rounded-tr-sm bg-navy text-canvas text-[15px] font-bold">
                  {activePatient.places.length ? activePatient.places.join(', ') : 'Selected regions on body silhouette'}
                </div>
              </div>
            </div>

            {/* Quick Prompt to Patient Screen */}
            <div className="pt-2">
              <label className="block text-[13px] font-semibold text-slate mb-2">
                Send Direct Message / Guidance to Patient Screen:
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  'Please have a seat in Bay 3',
                  'Doctor is reviewing your chart',
                  'Please prepare your ID / SHIF card',
                  'An interpreter has been requested',
                ].map((msg) => (
                  <button
                    key={msg}
                    onClick={() => handleSendPrompt(msg)}
                    className="h-8 px-3 rounded-full bg-canvas hover:bg-sky text-navy text-[12px] font-medium border border-line transition-colors"
                  >
                    + {msg}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Type custom note to show on patient's screen..."
                  className="flex-1 h-11 px-4 rounded-[12px] bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                />
                <button
                  disabled={!customPrompt.trim()}
                  onClick={() => handleSendPrompt(customPrompt)}
                  className="h-11 px-5 rounded-[12px] bg-accent hover:bg-brand disabled:opacity-40 text-canvas font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
                >
                  <PaperPlaneRight size={16} /> Send to Tablet
                </button>
              </div>

              {promptSentToast && (
                <div className="mt-2 text-[13px] text-brand font-semibold flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle size={16} /> {promptSentToast}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Actions & Reception Queue */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
            <h3 className="text-[17px] font-display font-bold text-navy flex items-center gap-2">
              <Stethoscope size={20} className="text-accent" /> Clinical Triage Actions
            </h3>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setInterpreterCalled(true)}
                className={`w-full h-12 px-4 rounded-[12px] font-semibold text-[14px] flex items-center justify-between border transition-colors ${
                  interpreterCalled
                    ? 'bg-amber text-navy border-amber font-bold'
                    : 'bg-canvas text-navy border-line hover:border-accent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PhoneCall size={18} />
                  {interpreterCalled ? 'KSL Interpreter Dispatched' : 'Request On-Site KSL Interpreter'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-navy/10">Priority</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('In Triage')}
                className="w-full h-12 px-4 rounded-[12px] bg-canvas hover:bg-sky text-navy font-semibold text-[14px] flex items-center justify-between border border-line transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FirstAidKit size={18} /> Handoff to Triage Bay #2
                </span>
                <CaretRight size={16} className="text-slate" />
              </button>

              <a
                href="#/kiosk"
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 px-4 rounded-[12px] bg-accent hover:bg-brand text-canvas font-semibold text-[14px] flex items-center justify-between transition-colors shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Broadcast size={18} /> Open Desk 3 Patient Tablet
                </span>
                <CaretRight size={16} />
              </a>
            </div>
          </div>

          {/* Today's Triage Queue */}
          <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-display font-bold text-navy">Desk Queue ({patients.length})</h3>
              <span className="text-[12px] text-slate">Today</span>
            </div>

            <div className="space-y-2.5">
              {patients.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActivePatientIndex(idx)}
                  className={`w-full p-3.5 rounded-[16px] text-left border transition-all ${
                    idx === activePatientIndex
                      ? 'bg-canvas border-accent ring-2 ring-accent/15 shadow-sm'
                      : 'bg-canvas/60 border-line hover:bg-canvas'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[15px] text-navy">{p.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        p.status === 'Waiting'
                          ? 'bg-amber/15 text-amber'
                          : p.status === 'In Triage'
                          ? 'bg-sky text-navy'
                          : 'bg-mint text-brand'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-slate mt-1.5">
                    <span className="flex items-center gap-1">
                      <Heartbeat size={14} /> {p.symptom}
                    </span>
                    <span>{p.time}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-line text-[12px] text-slate flex items-center justify-between">
              <span>Automatic privacy cleanup enabled</span>
              <span className="text-brand font-medium">HIPAA/DPA Compliant</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
