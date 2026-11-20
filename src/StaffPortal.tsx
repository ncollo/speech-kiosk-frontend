import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Lock, ArrowLeft, CheckCircle, Warning, Stethoscope, Clock, MapPin,
  Heartbeat, ShieldCheck, SignOut, PhoneCall, PaperPlaneRight,
  ChatText, FirstAidKit, CaretRight, Broadcast, Users, Desktop,
  MagnifyingGlass, UserPlus, Check, X, Key, ArrowsClockwise, HandWaving, UserCheck,
  Microphone, MicrophoneSlash, PencilSimple, ArrowCounterClockwise, VideoCamera,
  UploadSimple, Plus, Trash, Play,
} from '@phosphor-icons/react'
import {
  api,
  auth,
  catalogApi,
  clockTime,
  terminalWsUrl,
  timeAgo,
  ROLES,
  STAFF_STATUSES,
  PATIENT_STATUSES,
  type AuditEntry,
  type InterpreterRequest,
  type KslPromptItem,
  type Patient,
  type PatientStatus,
  type StaffRole,
  type StaffStatus,
  type StaffUser,
  type Stats,
  type SymptomCardItem,
  type Terminal,
} from './api'
import {
  ICON_OPTIONS,
  applyClinicalVocabulary,
  iconForKey,
  isSpeechRecognitionSupported,
  startSpeechCapture,
  type SpeechCaptureController,
} from './clinicalSpeech'
import KslVideoPlayer from './KslVideoPlayer'

export type Role = 'nurse' | 'admin'

export default function StaffPortal({ defaultRole = 'nurse' }: { defaultRole?: Role }) {
  const [currentRole, setCurrentRole] = useState<Role>(defaultRole)
  const [me, setMe] = useState<StaffUser | null>(null)
  const [authChecking, setAuthChecking] = useState<boolean>(() => Boolean(auth.token))

  // Login form state
  const [staffId, setStaffId] = useState(defaultRole === 'admin' ? 'ADMIN-001' : 'NURSE-4029')
  const [pin, setPin] = useState('')
  const [department, setDepartment] = useState(
    defaultRole === 'admin' ? 'Executive Medical Operations' : 'Desk 3 · Outpatient Triage & Reception',
  )
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  // Live data from backend
  const [usersList, setUsersList] = useState<StaffUser[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [activePatientDetail, setActivePatientDetail] = useState<Patient | null>(null)
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [interpRequests, setInterpRequests] = useState<InterpreterRequest[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [syncError, setSyncError] = useState('')

  // Admin Dashboard Tabs & Filters
  const [adminTab, setAdminTab] = useState<'users' | 'patients' | 'kiosks' | 'cards' | 'ksl' | 'compliance'>('users')
  const [symptomCards, setSymptomCards] = useState<SymptomCardItem[]>([])
  const [kslPrompts, setKslPrompts] = useState<KslPromptItem[]>([])
  const [newCardModal, setNewCardModal] = useState(false)
  const [cardForm, setCardForm] = useState({ en: '', sw: '', icon_key: 'heartbeat', keywords: '', urgent: false })
  const [newKslModal, setNewKslModal] = useState(false)
  const [kslForm, setKslForm] = useState({ title: '', question_en: '', question_sw: '', ksl_gloss: '', trigger_keywords: '', duration_sec: 5 })
  const [previewKsl, setPreviewKsl] = useState<KslPromptItem | null>(null)
  const [catalogToast, setCatalogToast] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('All')
  const [userStatusFilter, setUserStatusFilter] = useState('All')
  const [auditEventFilter, setAuditEventFilter] = useState('all')

  // Add Staff Modal
  const [newUserModal, setNewUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<StaffRole>('Triage Nurse')
  const [newUserDept, setNewUserDept] = useState('Desk 3 · Outpatient Reception')
  const [newUserPhone, setNewUserPhone] = useState('+254 722 100 200')
  const [newUserPin, setNewUserPin] = useState('')
  const [credentialBanner, setCredentialBanner] = useState<{ name: string; badgeId: string; pin: string } | null>(null)

  // Patient Registry Filters
  const [patientSearch, setPatientSearch] = useState('')
  const [patientFilter, setPatientFilter] = useState<'all' | 'urgent' | 'waiting' | 'active'>('all')

  // Nurse Console State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [promptSentToast, setPromptSentToast] = useState('')
  const [actionToast, setActionToast] = useState('')
  const [micActive, setMicActive] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [interimCaption, setInterimCaption] = useState('')
  const [asrError, setAsrError] = useState('')
  const [dictateText, setDictateText] = useState('')
  const [simulateUncertain, setSimulateUncertain] = useState(false)
  const [editingTurnId, setEditingTurnId] = useState<number | null>(null)
  const [editingTurnText, setEditingTurnText] = useState('')
  const [diagInput, setDiagInput] = useState('')
  const [rxInput, setRxInput] = useState('')
  const [wardInput, setWardInput] = useState('Cardiac Observation Ward B · Bed 4')

  const speechCtrlRef = useRef<SpeechCaptureController | null>(null)
  const nurseWsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    setCurrentRole(defaultRole)
    if (!auth.token) {
      setStaffId(defaultRole === 'admin' ? 'ADMIN-001' : 'NURSE-4029')
      setDepartment(defaultRole === 'admin' ? 'Executive Medical Operations' : 'Desk 3 · Outpatient Triage & Reception')
    }
  }, [defaultRole])

  // Restore session if token exists
  useEffect(() => {
    if (!auth.token) {
      setAuthChecking(false)
      return
    }
    api
      .me()
      .then((res) => {
        setMe(res.user)
        if (defaultRole === 'admin' && res.user.role === 'Hospital Administrator') {
          setCurrentRole('admin')
        } else if (res.user.role === 'Hospital Administrator' && window.location.hash.startsWith('#/admin')) {
          setCurrentRole('admin')
        } else {
          setCurrentRole(defaultRole)
        }
      })
      .catch(() => {
        auth.clear()
        setMe(null)
      })
      .finally(() => setAuthChecking(false))
  }, [defaultRole])

  useEffect(() => {
    const onUnauth = () => setMe(null)
    window.addEventListener('clearcaption:unauthorized', onUnauth)
    return () => window.removeEventListener('clearcaption:unauthorized', onUnauth)
  }, [])

  const loadAll = useCallback(async () => {
    if (!auth.token) return
    try {
      const [uList, pList, tList, iList, aList, sData, cardsRes, kslRes] = await Promise.all([
        api.users(),
        api.patients(),
        api.terminals(),
        api.interpreterRequests(true),
        api.auditLogs(auditEventFilter === 'all' ? undefined : auditEventFilter),
        api.stats(),
        catalogApi.listSymptomCards(true),
        catalogApi.listKslPrompts(true),
      ])
      setUsersList(uList)
      setPatients(pList)
      setTerminals(tList)
      setInterpRequests(iList)
      setAuditLogs(aList)
      setStats(sData)
      setSymptomCards(cardsRes.items)
      setKslPrompts(kslRes.items)
      setSyncError('')
      setSelectedPatientId((prev) => {
        if (prev && pList.some((p) => p.id === prev)) return prev
        return pList[0]?.id ?? null
      })
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to synchronize with hospital server')
    }
  }, [auditEventFilter])

  // Poll live hospital state while signed in
  useEffect(() => {
    if (!me) return
    loadAll()
    const id = setInterval(loadAll, 3500)
    return () => clearInterval(id)
  }, [me, loadAll])

  // Load full transcript for currently selected patient
  const activePatient = patients.find((p) => p.id === selectedPatientId) ?? patients[0] ?? null
  useEffect(() => {
    if (!me || !activePatient?.id) {
      setActivePatientDetail(null)
      return
    }
    let alive = true
    const fetchDetail = () => {
      api
        .patient(activePatient.id)
        .then((d) => {
          if (alive) setActivePatientDetail(d)
        })
        .catch(() => {})
    }
    fetchDetail()
    const id = setInterval(fetchDetail, 3000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [me, activePatient?.id])

  // Real-time WebSocket connection for the active patient's desk terminal
  const activeTerminalId = activePatient?.terminalId || 'KIOSK-03'
  useEffect(() => {
    if (!me) return
    let ws: WebSocket | null = null
    let closed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      if (closed) return
      try {
        ws = new WebSocket(terminalWsUrl(activeTerminalId))
        nurseWsRef.current = ws
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data)
            if (msg?.type === 'turn_added' || msg?.type === 'turn_edited' || msg?.type === 'session_ended') {
              if (activePatient?.id) {
                api.patient(activePatient.id).then(setActivePatientDetail).catch(() => undefined)
              }
              loadAll()
            }
          } catch {
            /* ignore */
          }
        }
        ws.onclose = () => {
          if (nurseWsRef.current === ws) nurseWsRef.current = null
          if (!closed) retryTimer = setTimeout(connect, 2500)
        }
      } catch {
        if (!closed) retryTimer = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      closed = true
      if (retryTimer) clearTimeout(retryTimer)
      ws?.close()
      if (nurseWsRef.current === ws) nurseWsRef.current = null
    }
  }, [me, activeTerminalId, activePatient?.id, loadAll])

  // Cleanup microphone on unmount
  useEffect(() => () => speechCtrlRef.current?.stop(), [])

  const sendWsEvent = (payload: Record<string, unknown>) => {
    if (nurseWsRef.current?.readyState === WebSocket.OPEN) {
      nurseWsRef.current.send(JSON.stringify(payload))
    }
  }

  const submitSpokenCaption = async (rawText: string, confidence: number) => {
    if (!activePatient) return
    const cleaned = applyClinicalVocabulary(rawText)
    if (!cleaned) return
    const isUncertain = confidence < 0.78
    sendWsEvent({ type: 'live_caption', text: cleaned, interim: false, confidence, isUncertain })
    try {
      await api.addClinicianTurn(activePatient.id, { text: cleaned, confidence, is_uncertain: isUncertain, channel: 'spoken' })
      const d = await api.patient(activePatient.id)
      setActivePatientDetail(d)
    } catch {
      /* fallback handled on next poll */
    }
  }

  const handleToggleMic = async () => {
    if (micActive) {
      speechCtrlRef.current?.stop()
      speechCtrlRef.current = null
      setMicActive(false)
      setInterimCaption('')
      sendWsEvent({ type: 'mic_status', status: 'paused' })
      return
    }
    setAsrError('')
    setMicActive(true)
    sendWsEvent({ type: 'mic_status', status: 'listening' })
    const ctrl = await startSpeechCapture({
      lang: activePatient?.lang?.toLowerCase().includes('kiswahili') ? 'sw-KE' : 'en-KE',
      onInterim: (text) => {
        setInterimCaption(text)
        sendWsEvent({ type: 'live_caption', text, interim: true })
      },
      onFinal: (text, confidence) => {
        setInterimCaption('')
        submitSpokenCaption(text, confidence)
      },
      onLevel: (lvl) => setMicLevel(lvl),
      onError: (msg) => setAsrError(msg),
      onEnd: () => {
        setMicActive(false)
        setMicLevel(0)
        sendWsEvent({ type: 'mic_status', status: 'paused' })
      },
    })
    speechCtrlRef.current = ctrl
    if (!ctrl.supported) {
      setAsrError('Web Speech API is unavailable in this browser; use the Spoken Caption box below to stream live captions.')
    }
  }

  const handleSaveTurnEdit = async (turnId: number) => {
    if (!activePatient || !editingTurnText.trim()) return
    try {
      await api.editTurn(activePatient.id, turnId, editingTurnText.trim())
      setEditingTurnId(null)
      setEditingTurnText('')
      const d = await api.patient(activePatient.id)
      setActivePatientDetail(d)
      setActionToast('Caption updated & synced to patient display')
      setTimeout(() => setActionToast(''), 3000)
    } catch (err) {
      setActionToast(err instanceof Error ? err.message : 'Failed to update caption')
    }
  }

  const handleRepeatLastCaption = async () => {
    if (!activePatient) return
    try {
      const res = await api.repeatCaption(activePatient.id)
      sendWsEvent({ type: 'repeat_caption', text: res.text, turn: res.turn })
      setActionToast(`Repeated caption on ${activePatient.desk}`)
      setTimeout(() => setActionToast(''), 3000)
    } catch (err) {
      setActionToast(err instanceof Error ? err.message : 'No nurse caption to repeat')
    }
  }

  const handleEndSession = async () => {
    if (!activePatient) return
    try {
      const res = await api.endSession(activePatient.id)
      if (micActive) {
        speechCtrlRef.current?.stop()
        speechCtrlRef.current = null
        setMicActive(false)
      }
      setActionToast(
        res.purged
          ? 'Session ended — unconsented transcripts purged per DPA 2019'
          : `Session ended & triage summary finalized for ${activePatient.name}`,
      )
      setTimeout(() => setActionToast(''), 4000)
      await loadAll()
    } catch (err) {
      setActionToast(err instanceof Error ? err.message : 'Unable to end session')
    }
  }

  const handleDisposition = async (action: 'pharmacy' | 'discharged' | 'admitted') => {
    if (!activePatient) return
    try {
      const updated = await api.setDisposition(activePatient.id, {
        action,
        diagnosis: diagInput.trim() || undefined,
        prescription: rxInput.trim() || undefined,
        ward: action === 'admitted' ? wardInput.trim() || 'General Medical Ward 2' : undefined,
      })
      setActivePatientDetail(updated)
      setActionToast(
        action === 'pharmacy'
          ? `Prescription sent to Pharmacy & patient kiosk for ${activePatient.name}`
          : action === 'discharged'
          ? `${activePatient.name} dispensed medicine & discharged`
          : `${activePatient.name} admitted to ${updated.ward || wardInput}`,
      )
      setTimeout(() => setActionToast(''), 4000)
      await loadAll()
    } catch (err) {
      setActionToast(err instanceof Error ? err.message : 'Failed to record clinical outcome')
    }
  }

  const handleCreateSymptomCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const kws = cardForm.keywords.split(',').map((s) => s.trim()).filter(Boolean)
      await catalogApi.createSymptomCard({
        en: cardForm.en,
        sw: cardForm.sw,
        icon_key: cardForm.icon_key,
        keywords: kws,
        urgent: cardForm.urgent,
      })
      setNewCardModal(false)
      setCardForm({ en: '', sw: '', icon_key: 'heartbeat', keywords: '', urgent: false })
      setCatalogToast('Symptom card added to kiosk catalog')
      setTimeout(() => setCatalogToast(''), 3000)
      await loadAll()
    } catch (err) {
      setCatalogToast(err instanceof Error ? err.message : 'Failed to create symptom card')
    }
  }

  const handleCreateKslPrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const kws = kslForm.trigger_keywords.split(',').map((s) => s.trim()).filter(Boolean)
      await catalogApi.createKslPrompt({
        title: kslForm.title,
        question_en: kslForm.question_en,
        question_sw: kslForm.question_sw,
        ksl_gloss: kslForm.ksl_gloss,
        trigger_keywords: kws,
        duration_sec: kslForm.duration_sec,
      })
      setNewKslModal(false)
      setKslForm({ title: '', question_en: '', question_sw: '', ksl_gloss: '', trigger_keywords: '', duration_sec: 5 })
      setCatalogToast('KSL video prompt added to catalog')
      setTimeout(() => setCatalogToast(''), 3000)
      await loadAll()
    } catch (err) {
      setCatalogToast(err instanceof Error ? err.message : 'Failed to create KSL prompt')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginBusy(true)
    try {
      const res = await api.login(staffId.trim(), pin.trim())
      auth.set(res.token)
      setMe(res.user)
      setPin('')
      if (res.portal === 'admin') {
        setCurrentRole('admin')
      } else {
        setCurrentRole('nurse')
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Unable to sign in')
    } finally {
      setLoginBusy(false)
    }
  }

  const handleQuickNurseFill = () => {
    setCurrentRole('nurse')
    setStaffId('NURSE-4029')
    setPin('4821')
    setDepartment('Desk 3 · Outpatient Triage & Reception')
    setLoginError('')
  }

  const handleQuickAdminFill = () => {
    setCurrentRole('admin')
    setStaffId('ADMIN-001')
    setPin('9900')
    setDepartment('Executive Medical Operations')
    setLoginError('')
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch {
      /* ignore */
    }
    auth.clear()
    setMe(null)
  }

  const handleMyStatusChange = async (status: StaffStatus) => {
    try {
      const updated = await api.setMyStatus(status)
      setMe(updated)
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Could not update status')
    }
  }

  const handleSendPrompt = async (text: string) => {
    if (!activePatient) return
    const termId =
      activePatient.terminalId ||
      terminals.find((t) => t.desk === activePatient.desk)?.id ||
      'TERM-03'
    try {
      await api.sendDeskMessage(termId, text, activePatient.id)
      setPromptSentToast(`Delivered to ${activePatient.desk} Tablet (${termId}): "${text}"`)
      setCustomPrompt('')
      const d = await api.patient(activePatient.id)
      setActivePatientDetail(d)
      loadAll()
      setTimeout(() => setPromptSentToast(''), 4000)
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to send message to tablet')
    }
  }

  const handlePatientStatusChange = async (patientId: string, status: PatientStatus) => {
    try {
      const updated = await api.setPatientStatus(patientId, status)
      setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)))
      setActionToast(`Updated ${updated.name} to "${status}"`)
      setTimeout(() => setActionToast(''), 3000)
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to update patient status')
    }
  }

  const handleAssignToMe = async (patientId: string) => {
    try {
      const updated = await api.assignToMe(patientId)
      setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)))
      setActionToast(`Assigned ${updated.name} to ${me?.name}`)
      setTimeout(() => setActionToast(''), 3000)
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to assign patient')
    }
  }

  const handleRequestInterpreterForActive = async () => {
    if (!activePatient) return
    try {
      await api.requestInterpreter(activePatient.desk, activePatient.id)
      setActionToast(`Requested KSL interpreter for ${activePatient.desk}`)
      setTimeout(() => setActionToast(''), 3500)
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to request interpreter')
    }
  }

  const handleInterpreterStatus = async (reqId: number, status: InterpreterRequest['status']) => {
    try {
      await api.updateInterpreter(reqId, status)
      setActionToast(`Interpreter request #${reqId} marked ${status}`)
      setTimeout(() => setActionToast(''), 3500)
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to update interpreter request')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim()) return
    try {
      const res = await api.createUser({
        name: newUserName.trim(),
        role: newUserRole,
        department: newUserDept.trim(),
        phone: newUserPhone.trim(),
        pin: newUserPin.trim() || undefined,
      })
      setCredentialBanner({ name: res.user.name, badgeId: res.user.badgeId, pin: res.pin })
      setNewUserName('')
      setNewUserPin('')
      setNewUserModal(false)
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to register staff member')
    }
  }

  const handleUserUpdate = async (userId: string, patch: Parameters<typeof api.updateUser>[1]) => {
    try {
      const updated = await api.updateUser(userId, patch)
      setUsersList((prev) => prev.map((u) => (u.id === userId ? updated : u)))
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to update staff record')
    }
  }

  const handleResetPin = async (userId: string) => {
    try {
      const res = await api.resetPin(userId)
      setCredentialBanner({ name: res.user.name, badgeId: res.user.badgeId, pin: res.pin })
      loadAll()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to reset PIN')
    }
  }

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase()
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.badgeId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter
    const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.symptom ?? '').toLowerCase().includes(q) ||
      p.desk.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    if (patientFilter === 'urgent') return matchesSearch && p.urgent
    if (patientFilter === 'waiting') return matchesSearch && p.status === 'Waiting'
    if (patientFilter === 'active') return matchesSearch && p.status !== 'Completed'
    return matchesSearch
  })

  if (authChecking) {
    return (
      <div className="min-h-screen bg-canvas text-navy font-ui grid place-items-center">
        <div className="flex items-center gap-3 text-[16px] font-semibold text-slate">
          <ArrowsClockwise size={22} className="animate-spin text-accent" /> Restoring Hospital Session...
        </div>
      </div>
    )
  }

  /* ---------- Login View ---------- */
  if (!me) {
    return (
      <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col justify-between p-4 md:p-8">
        <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
          <a
            href="#/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-ash hover:bg-line text-navy text-[14px] font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Hospital Home
          </a>
          <span className="text-[13px] text-slate font-medium">Kenyatta National Hospital · Clinical & Admin Systems</span>
        </div>

        <div className="max-w-[500px] w-full mx-auto my-10 bg-ash/70 rounded-[28px] p-8 md:p-10 border border-line shadow-sm">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <span className="w-14 h-14 rounded-[18px] bg-brand text-canvas grid place-items-center shadow-md">
              <Lock size={26} weight="bold" />
            </span>
            <div>
              <h1 className="text-[26px] font-display font-bold tracking-tight">Hospital Access Portal</h1>
              <p className="text-[14px] text-slate mt-1">Sign in with your Hospital Badge ID and PIN</p>
            </div>
          </div>

          <div className="grid grid-cols-2 p-1.5 rounded-full bg-canvas border border-line mb-6">
            <button
              type="button"
              onClick={handleQuickNurseFill}
              className={`h-10 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                currentRole === 'nurse' ? 'bg-navy text-canvas shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              <Stethoscope size={16} /> Triage Nurse
            </button>
            <button
              type="button"
              onClick={handleQuickAdminFill}
              className={`h-10 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                currentRole === 'admin' ? 'bg-navy text-canvas shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              <ShieldCheck size={16} /> Hospital Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate mb-1.5 uppercase tracking-wider">
                Department / Authority
              </label>
              <input
                type="text"
                readOnly
                value={department}
                className="w-full h-12 px-4 rounded-[12px] bg-canvas/80 border border-line text-[14px] font-medium text-navy outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate mb-1.5 uppercase tracking-wider">
                Staff Badge / ID
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder={currentRole === 'admin' ? 'ADMIN-001' : 'NURSE-4029'}
                className="w-full h-12 px-4 rounded-[12px] bg-canvas border border-line text-[15px] text-navy focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">
                  Access PIN
                </label>
                <button
                  type="button"
                  onClick={currentRole === 'admin' ? handleQuickAdminFill : handleQuickNurseFill}
                  className="text-[12px] text-accent font-semibold hover:underline"
                >
                  Fill Demo {currentRole === 'admin' ? 'Admin (ADMIN-001 / 9900)' : 'Nurse (NURSE-4029 / 4821)'}
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
              disabled={loginBusy}
              className="mt-2 w-full h-13 rounded-full bg-accent hover:bg-brand disabled:opacity-50 text-canvas font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loginBusy ? 'Verifying Credentials...' : `Sign In as ${currentRole === 'admin' ? 'Administrator' : 'Clinician'}`}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-[12px] text-slate space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-navy">
              <ShieldCheck size={16} className="text-brand" />
              50 Registered Hospital Staff Accounts
            </div>
            <p className="text-center text-[11px]">
              Admins (`ADMIN-001..004`): PIN <code className="font-mono font-bold">9900</code> · Nurses (`NURSE-4029..4042`): PIN <code className="font-mono font-bold">4821</code> · Doctors / KSL / Reception: PIN <code className="font-mono font-bold">1234</code>
            </p>
          </div>
        </div>

        <div className="text-center text-[12px] text-slate pb-4">
          © 2026 ClearCaption Hospital Systems · 50 Active Hospital Staff & Clinicians
        </div>
      </div>
    )
  }

  const isAdminUser = me.role === 'Hospital Administrator'
  const initials = me.name
    .replace(/^(Dr\.|Nurse)\s+/i, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  /* ---------- Logged-in Header & Navigation ---------- */
  return (
    <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col">
      <header className="h-18 px-6 md:px-10 bg-ash/80 backdrop-blur-md border-b border-line flex items-center justify-between gap-4">
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
            ClearCaption{' '}
            <span className="hidden lg:inline text-[14px] font-normal text-slate">
              | {currentRole === 'admin' ? 'Hospital Administration Suite' : 'Clinician Triage Console'}
            </span>
          </div>
        </div>

        {/* Center Role Toggle */}
        <div className="hidden md:flex items-center p-1 rounded-full bg-canvas border border-line text-[13px]">
          <button
            onClick={() => setCurrentRole('nurse')}
            className={`h-8 px-4 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
              currentRole === 'nurse' ? 'bg-navy text-canvas' : 'text-slate hover:text-navy'
            }`}
          >
            <Stethoscope size={15} /> Nurse Console ({patients.filter((p) => p.status !== 'Completed').length} Active)
          </button>
          <button
            onClick={() => {
              if (!isAdminUser) {
                setSyncError('Only Hospital Administrators (e.g. ADMIN-001, PIN 9900) can modify staff accounts.')
              }
              setCurrentRole('admin')
            }}
            className={`h-8 px-4 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
              currentRole === 'admin' ? 'bg-navy text-canvas' : 'text-slate hover:text-navy'
            }`}
          >
            <ShieldCheck size={15} /> Admin Suite ({stats?.staffTotal ?? usersList.length} Staff)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Your Duty Status"
            value={me.status}
            onChange={(e) => handleMyStatusChange(e.target.value as StaffStatus)}
            className="hidden sm:block h-9 px-3 rounded-full bg-canvas border border-line text-[12px] font-bold text-brand outline-none"
          >
            {STAFF_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-right">
            <span className="w-8 h-8 rounded-full bg-accent text-canvas grid place-items-center font-bold text-[12px]">
              {initials}
            </span>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-semibold leading-tight">{me.name}</span>
              <span className="text-[11px] text-slate">
                {me.badgeId} · {me.role}
              </span>
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

      {syncError && (
        <div className="max-w-[1340px] w-full mx-auto mt-4 px-6">
          <div className="p-3 rounded-[12px] bg-alert/10 border border-alert/30 text-alert text-[13px] flex items-center justify-between">
            <span className="flex items-center gap-2"><Warning size={18} /> {syncError}</span>
            <button onClick={() => setSyncError('')} className="text-xs font-bold underline">Dismiss</button>
          </div>
        </div>
      )}

      {credentialBanner && (
        <div className="max-w-[1340px] w-full mx-auto mt-4 px-6">
          <div className="p-4 rounded-[16px] bg-mint border border-brand/30 text-navy flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[14px]">
              <Key size={22} className="text-brand shrink-0" />
              <div>
                <strong>Credentials issued for {credentialBanner.name}:</strong> Badge ID{' '}
                <code className="px-2 py-0.5 rounded bg-canvas font-mono font-bold text-brand">{credentialBanner.badgeId}</code>{' '}
                · Access PIN{' '}
                <code className="px-2 py-0.5 rounded bg-canvas font-mono font-bold text-navy">{credentialBanner.pin}</code>
              </div>
            </div>
            <button onClick={() => setCredentialBanner(null)} className="text-slate hover:text-navy">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ---------- ADMIN VIEW ---------- */}
      {currentRole === 'admin' ? (
        <main className="flex-1 max-w-[1340px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
          {/* Admin KPI Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <Users size={16} className="text-accent" /> Hospital Users & Staff
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                {stats?.staffTotal ?? usersList.length}
              </span>
              <span className="text-[12px] text-slate">
                {stats?.staffOnDuty ?? usersList.filter((u) => u.status === 'On-Duty' || u.status === 'Active').length} currently on duty
              </span>
            </div>

            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <Desktop size={16} className="text-brand" /> Kiosk Fleet Desks
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                {terminals.length || 6} Desks
              </span>
              <span className="text-[12px] font-semibold text-brand">
                {stats?.kiosksOnline ?? terminals.filter((t) => t.online).length} live heartbeats · All 6 configured
              </span>
            </div>

            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <Heartbeat size={16} className="text-alert" /> Patient Intakes
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                {patients.length}
              </span>
              <span className="text-[12px] text-slate">
                {stats?.urgentOpen ?? patients.filter((p) => p.urgent && p.status !== 'Completed').length} urgent open · {stats?.interpreterOpen ?? interpRequests.length} KSL requests
              </span>
            </div>

            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-accent" /> DPA Audit & Wipes
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                {auditLogs.length}
              </span>
              <span className="text-[12px] text-brand font-semibold">
                {stats?.screenWipes24h ?? 0} tablet wipes in last 24h
              </span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'users', label: `Hospital Staff (${usersList.length})`, icon: Users },
                { id: 'patients', label: `Patient Intake Registry (${patients.length})`, icon: Heartbeat },
                { id: 'kiosks', label: `Reception Desks Fleet (${terminals.length})`, icon: Desktop },
                { id: 'cards', label: `Symptom Cards (${symptomCards.length})`, icon: FirstAidKit },
                { id: 'ksl', label: `KSL Videos (${kslPrompts.length})`, icon: VideoCamera },
                { id: 'compliance', label: `Privacy & DPA Logs (${auditLogs.length})`, icon: ShieldCheck },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAdminTab(t.id as typeof adminTab)}
                  className={`h-10 px-4 rounded-full font-bold text-[14px] flex items-center gap-2 transition-colors ${
                    adminTab === t.id
                      ? 'bg-navy text-canvas shadow-sm'
                      : 'bg-ash hover:bg-line text-slate hover:text-navy'
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {adminTab === 'users' && isAdminUser && (
              <button
                onClick={() => setNewUserModal(true)}
                className="h-10 px-4 rounded-full bg-accent hover:bg-brand text-canvas font-semibold text-[13px] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <UserPlus size={16} /> Add Hospital Staff
              </button>
            )}
            {adminTab === 'cards' && isAdminUser && (
              <button
                onClick={() => setNewCardModal(true)}
                className="h-10 px-4 rounded-full bg-accent hover:bg-brand text-canvas font-semibold text-[13px] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus size={16} /> Add Symptom Card
              </button>
            )}
            {adminTab === 'ksl' && isAdminUser && (
              <button
                onClick={() => setNewKslModal(true)}
                className="h-10 px-4 rounded-full bg-accent hover:bg-brand text-canvas font-semibold text-[13px] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus size={16} /> Add KSL Video Prompt
              </button>
            )}
          </div>

          {/* Tab 1: 50 Hospital Users & Staff Directory */}
          {adminTab === 'users' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-[360px]">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search 50 staff by name, badge, department, email..."
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <span className="text-[13px] text-slate font-medium">Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-canvas border border-line text-[13px] font-semibold text-navy outline-none"
                  >
                    <option value="All">All Roles ({usersList.length})</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r} ({usersList.filter((u) => u.role === r).length})
                      </option>
                    ))}
                  </select>

                  <span className="text-[13px] text-slate font-medium ml-2">Status:</span>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-canvas border border-line text-[13px] font-semibold text-navy outline-none"
                  >
                    <option value="All">All Statuses</option>
                    {STAFF_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-[18px] bg-canvas border border-line overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-ash/80 border-b border-line text-[12px] uppercase font-bold text-slate tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Badge / ID</th>
                      <th className="py-3.5 px-4">Staff Name</th>
                      <th className="py-3.5 px-4">Assigned Role</th>
                      <th className="py-3.5 px-4">Department / Clinic</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Duty Status</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      {isAdminUser && <th className="py-3.5 px-4 text-right">Admin Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className={`hover:bg-ash/40 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                        <td className="py-3 px-4 font-mono font-bold text-[12px] text-brand">{u.badgeId}</td>
                        <td className="py-3 px-4 font-bold text-navy">
                          {u.name}
                          {!u.isActive && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-alert/15 text-alert text-[10px] font-bold">
                              DISABLED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.role === 'Hospital Administrator'
                                ? 'bg-navy text-canvas'
                                : u.role === 'Triage Nurse'
                                ? 'bg-mint text-brand'
                                : u.role === 'KSL Interpreter'
                                ? 'bg-amber/15 text-amber'
                                : u.role === 'Medical Doctor'
                                ? 'bg-sky text-navy'
                                : 'bg-ash text-slate'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate text-[13px]">{u.department}</td>
                        <td className="py-3 px-4 text-[12px] text-slate">
                          <div>{u.email}</div>
                          <div className="text-[11px] opacity-75">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          {isAdminUser ? (
                            <select
                              aria-label={`Duty status for ${u.name}`}
                              value={u.status}
                              onChange={(e) => handleUserUpdate(u.id, { status: e.target.value as StaffStatus })}
                              className="h-8 px-2.5 rounded-full bg-ash border border-line text-[11px] font-bold text-navy outline-none"
                            >
                              {STAFF_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-mint text-brand">
                              {u.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate text-[12px]">{timeAgo(u.lastLoginAt)}</td>
                        {isAdminUser && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleResetPin(u.id)}
                                className="h-7 px-2.5 rounded-full bg-ash hover:bg-line text-navy text-[11px] font-semibold inline-flex items-center gap-1"
                                title="Generate a new 4-digit PIN"
                              >
                                <Key size={12} /> Reset PIN
                              </button>
                              {u.id !== me.id && (
                                <button
                                  onClick={() => handleUserUpdate(u.id, { is_active: !u.isActive })}
                                  className={`h-7 px-2.5 rounded-full text-[11px] font-semibold ${
                                    u.isActive
                                      ? 'bg-alert/10 hover:bg-alert/20 text-alert'
                                      : 'bg-mint hover:bg-brand/20 text-brand'
                                  }`}
                                >
                                  {u.isActive ? 'Disable' : 'Enable'}
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Patient Intake Registry */}
          {adminTab === 'patients' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-[360px]">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by patient name, ID, complaint, desk..."
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPatientFilter('all')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${
                      patientFilter === 'all' ? 'bg-navy text-canvas' : 'bg-canvas text-slate border border-line'
                    }`}
                  >
                    All ({patients.length})
                  </button>
                  <button
                    onClick={() => setPatientFilter('active')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${
                      patientFilter === 'active' ? 'bg-accent text-canvas' : 'bg-canvas text-slate border border-line'
                    }`}
                  >
                    Active ({patients.filter((p) => p.status !== 'Completed').length})
                  </button>
                  <button
                    onClick={() => setPatientFilter('urgent')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${
                      patientFilter === 'urgent' ? 'bg-alert text-canvas' : 'bg-canvas text-slate border border-line'
                    }`}
                  >
                    Urgent Only ({patients.filter((p) => p.urgent).length})
                  </button>
                  <button
                    onClick={() => setPatientFilter('waiting')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${
                      patientFilter === 'waiting' ? 'bg-amber text-navy' : 'bg-canvas text-slate border border-line'
                    }`}
                  >
                    Waiting ({patients.filter((p) => p.status === 'Waiting').length})
                  </button>
                </div>
              </div>

              <div className="rounded-[18px] bg-canvas border border-line overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-ash/80 border-b border-line text-[12px] uppercase font-bold text-slate tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Triage ID</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Chief Complaint</th>
                      <th className="py-3.5 px-4">Body Area</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Desk</th>
                      <th className="py-3.5 px-4">Assigned Clinician</th>
                      <th className="py-3.5 px-4">Urgency</th>
                      <th className="py-3.5 px-4">Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-ash/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[12px] text-brand">
                          <button
                            onClick={() => {
                              setSelectedPatientId(p.id)
                              setCurrentRole('nurse')
                            }}
                            className="hover:underline"
                            title="Open in Nurse Console"
                          >
                            {p.id}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-bold text-navy">
                          <div>{p.name}</div>
                          <div className="text-[11px] font-normal text-slate">{timeAgo(p.createdAt)} · {p.lang}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {p.symptom || 'Checking in...'}{' '}
                          {p.symptomSw && <span className="text-[12px] text-slate font-normal">({p.symptomSw})</span>}
                        </td>
                        <td className="py-3 px-4 text-slate text-[13px]">{p.places.join(', ') || '—'}</td>
                        <td className="py-3 px-4 text-slate text-[13px]">{p.duration || '—'}</td>
                        <td className="py-3 px-4 font-semibold text-navy text-[13px]">{p.desk}</td>
                        <td className="py-3 px-4 text-slate text-[13px]">{p.assignedTo || 'Unassigned'}</td>
                        <td className="py-3 px-4">
                          {p.urgent ? (
                            <span className="px-2 py-0.5 rounded-full bg-alert text-canvas text-[11px] font-bold inline-flex items-center gap-1">
                              <Warning size={12} weight="fill" /> URGENT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-mint text-brand text-[11px] font-bold">
                              STANDARD
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            aria-label={`Status for ${p.name}`}
                            value={p.status}
                            onChange={(e) => handlePatientStatusChange(p.id, e.target.value as PatientStatus)}
                            className="h-8 px-2.5 rounded-full bg-ash border border-line text-[11px] font-bold text-navy outline-none"
                          >
                            {PATIENT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Reception Kiosks Fleet */}
          {adminTab === 'kiosks' && (
            <div className="grid md:grid-cols-3 gap-6">
              {terminals.map((k) => (
                <div key={k.id} className="p-6 rounded-[22px] bg-ash/60 border border-line flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-6 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                        k.online ? 'bg-mint text-brand' : 'bg-canvas text-slate border border-line'
                      }`}
                    >
                      <Broadcast size={13} className={k.online ? 'animate-pulse' : ''} />
                      {k.inSession ? 'Active Intake Session' : k.online ? 'Online · Live Heartbeat' : 'Standby · Ready'}
                    </span>
                    <span className="text-[12px] text-slate font-mono">
                      {k.latencyMs !== null ? `${k.latencyMs}ms` : k.id}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[18px] text-navy">
                      {k.desk} · {k.location}
                    </h3>
                    <p className="text-[13px] text-slate mt-0.5">{k.deviceType}</p>
                  </div>
                  <div className="pt-3 border-t border-line text-[13px] space-y-1 text-slate">
                    <div>
                      Audio: <span className="font-semibold text-navy">{k.microphone}</span>
                    </div>
                    <div>
                      Assigned Staff: <span className="font-semibold text-navy">{k.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div>
                      Last Heartbeat: <span className="font-semibold text-navy">{timeAgo(k.lastHeartbeatAt)}</span>
                    </div>
                    <div>
                      24h Intakes: <span className="font-bold text-accent">{k.intakes24h} patients</span>
                    </div>
                  </div>
                  <a
                    href={`#/kiosk?terminal=${k.id}`}
                    className="mt-2 w-full h-10 rounded-full bg-canvas hover:bg-line border border-line font-bold text-[13px] text-navy flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Open {k.desk} Tablet <CaretRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SYMPTOM CARDS */}
          {adminTab === 'cards' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-display font-bold text-navy">Pictorial Symptom Cards Catalog</h2>
                  <p className="text-[13px] text-slate">Manage bilingual triage symptom cards and keyword triggers displayed on patient kiosks.</p>
                </div>
                {catalogToast && (
                  <span className="px-3 py-1.5 rounded-full bg-mint text-brand text-[12px] font-bold">{catalogToast}</span>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {symptomCards.map((card) => {
                  const IconComp = iconForKey(card.iconKey)
                  return (
                    <div
                      key={card.id}
                      className={`p-4 rounded-[18px] bg-canvas border flex flex-col gap-3 ${
                        card.isActive ? 'border-line' : 'border-dashed border-slate/40 opacity-65'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-11 h-11 rounded-[12px] bg-sky text-brand grid place-items-center shrink-0">
                            <IconComp size={24} />
                          </span>
                          <div>
                            <p className="font-bold text-[15px] text-navy">{card.en}</p>
                            <p className="text-[13px] text-slate">{card.sw}</p>
                          </div>
                        </div>
                        {card.urgent && (
                          <span className="px-2 py-0.5 rounded-full bg-alert text-canvas text-[10px] font-bold uppercase">Urgent</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {card.keywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded bg-ash text-[11px] font-mono text-slate">{kw}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-line mt-auto">
                        <button
                          onClick={async () => {
                            await catalogApi.updateSymptomCard(card.id, { is_active: !card.isActive })
                            loadAll()
                          }}
                          className={`h-8 px-3 rounded-full text-[12px] font-bold ${
                            card.isActive ? 'bg-mint text-brand' : 'bg-ash text-slate'
                          }`}
                        >
                          {card.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={async () => {
                            await catalogApi.deleteSymptomCard(card.id)
                            loadAll()
                          }}
                          aria-label={`Delete ${card.en}`}
                          className="h-8 px-2.5 rounded-full hover:bg-alert/10 text-alert text-[12px] font-semibold inline-flex items-center gap-1"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB: KSL VIDEO PROMPTS */}
          {adminTab === 'ksl' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-display font-bold text-navy">Kenyan Sign Language (KSL) Video Prompts</h2>
                  <p className="text-[13px] text-slate">Upload pre-recorded KSL videos (.mp4/.webm) and configure speech trigger keywords for automatic playback.</p>
                </div>
                {catalogToast && (
                  <span className="px-3 py-1.5 rounded-full bg-mint text-brand text-[12px] font-bold">{catalogToast}</span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {kslPrompts.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-[18px] bg-canvas border flex flex-col gap-3 ${
                      p.isActive ? 'border-line' : 'border-dashed border-slate/40 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-accent">{p.id}</span>
                        <h3 className="font-bold text-[15px] text-navy">{p.title}</h3>
                        <p className="text-[13px] text-navy mt-0.5">{p.questionEn}</p>
                        <p className="text-[12px] text-slate italic">{p.questionSw}</p>
                      </div>
                      <button
                        onClick={() => setPreviewKsl(p)}
                        className="h-8 px-3 rounded-full bg-sky hover:bg-navy hover:text-canvas text-navy text-[12px] font-bold inline-flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Play size={12} weight="fill" /> Preview
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.triggerKeywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 rounded bg-ash text-[11px] font-mono text-slate">{kw}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line mt-auto">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            await catalogApi.updateKslPrompt(p.id, { is_active: !p.isActive })
                            loadAll()
                          }}
                          className={`h-8 px-3 rounded-full text-[12px] font-bold ${
                            p.isActive ? 'bg-mint text-brand' : 'bg-ash text-slate'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <label className="h-8 px-3 rounded-full bg-ash hover:bg-sky text-navy text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer">
                          <UploadSimple size={14} /> Upload Video
                          <input
                            type="file"
                            accept=".mp4,.webm,.ogg,.mov"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                await catalogApi.uploadKslVideo(p.id, file)
                                setCatalogToast(`Uploaded video for ${p.title}`)
                                setTimeout(() => setCatalogToast(''), 3000)
                                loadAll()
                              } catch (err) {
                                setCatalogToast(err instanceof Error ? err.message : 'Upload failed')
                              }
                            }}
                          />
                        </label>
                      </div>
                      <button
                        onClick={async () => {
                          await catalogApi.deleteKslPrompt(p.id)
                          loadAll()
                        }}
                        className="h-8 px-2.5 rounded-full hover:bg-alert/10 text-alert text-[12px] font-semibold inline-flex items-center gap-1"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Compliance & Privacy Audit Trail */}
          {adminTab === 'compliance' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-[18px] font-display font-bold text-navy flex items-center gap-2">
                    <ShieldCheck size={20} className="text-brand" /> Kenya Data Protection Act (DPA) & Live Audit Trail
                  </h3>
                  <p className="text-[13px] text-slate">
                    Every staff login, patient check-in, tablet message, interpreter dispatch, and 30-second privacy wipe is recorded.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={auditEventFilter}
                    onChange={(e) => setAuditEventFilter(e.target.value)}
                    className="h-9 px-3 rounded-full bg-canvas border border-line text-[12px] font-bold text-navy outline-none"
                  >
                    <option value="all">All Event Types ({auditLogs.length})</option>
                    <option value="SCREEN_WIPED">SCREEN_WIPED</option>
                    <option value="INTAKE_STARTED">INTAKE_STARTED</option>
                    <option value="INTAKE_COMPLETED">INTAKE_COMPLETED</option>
                    <option value="DESK_MESSAGE">DESK_MESSAGE</option>
                    <option value="INTERPRETER_REQUESTED">INTERPRETER_REQUESTED</option>
                    <option value="INTERPRETER_DISPATCHED">INTERPRETER_DISPATCHED</option>
                    <option value="PATIENT_STATUS">PATIENT_STATUS</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="USER_CREATED">USER_CREATED</option>
                  </select>
                  <span className="h-8 px-3 rounded-full bg-mint text-brand text-[12px] font-bold flex items-center gap-1">
                    <Check size={14} /> DPA Audited
                  </span>
                </div>
              </div>

              <div className="rounded-[18px] bg-canvas border border-line overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-ash/80 border-b border-line text-[11px] uppercase font-bold text-slate tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Terminal / Patient</th>
                      <th className="py-3 px-4">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-ash/40">
                        <td className="py-2.5 px-4 text-slate whitespace-nowrap">
                          {clockTime(log.createdAt)} · {timeAgo(log.createdAt)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-ash font-mono font-bold text-[11px] text-brand">
                            {log.eventType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-navy">{log.actorName || 'Kiosk Tablet'}</td>
                        <td className="py-2.5 px-4 font-mono text-[12px] text-slate">
                          {[log.terminalId, log.patientId].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-navy">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal: Add Symptom Card */}
          {newCardModal && (
            <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm grid place-items-center p-4">
              <div className="w-full max-w-[480px] rounded-[28px] bg-canvas border border-line p-8 flex flex-col gap-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-[20px] text-navy">Add Symptom Card</h3>
                  <button onClick={() => setNewCardModal(false)} className="w-8 h-8 rounded-full bg-ash grid place-items-center text-slate"><X size={16} /></button>
                </div>
                <form onSubmit={handleCreateSymptomCard} className="flex flex-col gap-3">
                  <input required placeholder="English label (e.g. Chest Pain)" value={cardForm.en} onChange={(e) => setCardForm({ ...cardForm, en: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <input required placeholder="Kiswahili label (e.g. Maumivu ya Kifua)" value={cardForm.sw} onChange={(e) => setCardForm({ ...cardForm, sw: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <select value={cardForm.icon_key} onChange={(e) => setCardForm({ ...cardForm, icon_key: e.target.value })} className="h-11 px-3 rounded-[12px] bg-ash/50 border border-line text-[14px]">
                    {ICON_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                  <input placeholder="Trigger keywords (comma-separated, e.g. chest, heart, kifua)" value={cardForm.keywords} onChange={(e) => setCardForm({ ...cardForm, keywords: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <label className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                    <input type="checkbox" checked={cardForm.urgent} onChange={(e) => setCardForm({ ...cardForm, urgent: e.target.checked })} />
                    Flag as Urgent Triage Symptom
                  </label>
                  <button type="submit" className="h-11 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[14px]">Save Symptom Card</button>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add KSL Video Prompt */}
          {newKslModal && (
            <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm grid place-items-center p-4">
              <div className="w-full max-w-[500px] rounded-[28px] bg-canvas border border-line p-8 flex flex-col gap-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-[20px] text-navy">Add KSL Video Prompt</h3>
                  <button onClick={() => setNewKslModal(false)} className="w-8 h-8 rounded-full bg-ash grid place-items-center text-slate"><X size={16} /></button>
                </div>
                <form onSubmit={handleCreateKslPrompt} className="flex flex-col gap-3">
                  <input required placeholder="Prompt title (e.g. Asthma Check)" value={kslForm.title} onChange={(e) => setKslForm({ ...kslForm, title: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <input required placeholder="English question" value={kslForm.question_en} onChange={(e) => setKslForm({ ...kslForm, question_en: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <input required placeholder="Kiswahili question" value={kslForm.question_sw} onChange={(e) => setKslForm({ ...kslForm, question_sw: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <input placeholder="KSL Gloss (e.g. BREATHE + HARD + YOU?)" value={kslForm.ksl_gloss} onChange={(e) => setKslForm({ ...kslForm, ksl_gloss: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <input placeholder="Trigger keywords (comma-separated)" value={kslForm.trigger_keywords} onChange={(e) => setKslForm({ ...kslForm, trigger_keywords: e.target.value })} className="h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px]" />
                  <button type="submit" className="h-11 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[14px]">Save KSL Prompt</button>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Preview KSL Video */}
          {previewKsl && (
            <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm grid place-items-center p-4">
              <KslVideoPlayer prompt={previewKsl} onClose={() => setPreviewKsl(null)} />
            </div>
          )}

          {/* Modal: Add New Staff Member */}
          {newUserModal && (
            <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm grid place-items-center p-4">
              <div className="w-full max-w-[500px] rounded-[28px] bg-canvas border border-line p-8 flex flex-col gap-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display font-bold text-[20px] text-navy">
                    <UserPlus size={22} className="text-accent" /> Register Hospital Staff
                  </div>
                  <button
                    onClick={() => setNewUserModal(false)}
                    className="w-8 h-8 rounded-full bg-ash grid place-items-center text-slate"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Nurse Martha Wambugu"
                      className="w-full h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as StaffRole)}
                        className="w-full h-11 px-3 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none font-medium"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate uppercase mb-1">
                        Initial PIN (optional)
                      </label>
                      <input
                        type="text"
                        pattern="\d{4,6}"
                        maxLength={6}
                        value={newUserPin}
                        onChange={(e) => setNewUserPin(e.target.value)}
                        placeholder="Auto 4-digit"
                        className="w-full h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy font-mono outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Department / Desk</label>
                    <input
                      type="text"
                      required
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      placeholder="e.g. Desk 3 · Outpatient Reception"
                      className="w-full h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+254 722 000 000"
                      className="w-full h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewUserModal(false)}
                      className="flex-1 h-12 rounded-full bg-ash hover:bg-line text-navy font-bold text-[14px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[14px] shadow-sm"
                    >
                      Save Staff User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ---------- NURSE VIEW ---------- */
        <main className="flex-1 max-w-[1340px] w-full mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 flex flex-col gap-6">
            {activePatient ? (
              <>
                <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-line">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] uppercase font-bold tracking-wider text-slate">
                          Active Desk Intake · {activePatient.id}
                        </span>
                        <span className="h-5 px-2 rounded-full bg-sky text-[11px] text-navy font-semibold inline-flex items-center">
                          {activePatient.desk}
                        </span>
                        {activePatient.assignedTo && (
                          <span className="h-5 px-2 rounded-full bg-mint text-[11px] text-brand font-semibold inline-flex items-center">
                            Assigned: {activePatient.assignedTo}
                          </span>
                        )}
                      </div>
                      <h2 className="text-[28px] font-display font-bold text-navy flex flex-wrap items-center gap-3">
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
                      <p className="text-[13px] text-slate mt-0.5">
                        Checked in {timeAgo(activePatient.createdAt)} · Communication: {activePatient.lang}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-slate font-medium">Status:</span>
                      <select
                        value={activePatient.status}
                        onChange={(e) => handlePatientStatusChange(activePatient.id, e.target.value as PatientStatus)}
                        className="h-10 px-3 rounded-[10px] bg-canvas border border-line text-[13px] font-semibold text-navy focus:border-accent outline-none"
                      >
                        {PATIENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 pt-6">
                    <div className="p-4 rounded-[16px] bg-canvas border border-line">
                      <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                        <Heartbeat size={16} className="text-accent" /> Chief Complaint
                      </span>
                      <p className="text-[17px] font-bold text-navy leading-tight">
                        {activePatient.symptom || 'Patient typing...'}
                      </p>
                      {activePatient.symptomSw && (
                        <p className="text-[13px] text-slate mt-0.5">{activePatient.symptomSw}</p>
                      )}
                    </div>

                    <div className="p-4 rounded-[16px] bg-canvas border border-line">
                      <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                        <MapPin size={16} className="text-accent" /> Reported Pain Areas
                      </span>
                      <p className="text-[17px] font-bold text-navy leading-tight">
                        {activePatient.places.length ? activePatient.places.join(', ') : 'Pending selection'}
                      </p>
                      <p className="text-[13px] text-slate mt-0.5">Indicated via Body Map</p>
                    </div>

                    <div className="p-4 rounded-[16px] bg-canvas border border-line">
                      <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                        <Clock size={16} className="text-accent" /> Duration
                      </span>
                      <p className="text-[17px] font-bold text-navy leading-tight">
                        {activePatient.duration || 'Pending selection'}
                      </p>
                      <p className="text-[13px] text-slate mt-0.5">Reported by patient</p>
                    </div>
                  </div>
                </div>

                {/* Live Speech-to-Text & Transcript Log */}
                <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[18px] font-display font-bold text-navy flex items-center gap-2">
                        <ChatText size={20} className="text-accent" /> Live Desk Conversation & Speech-to-Text ({activePatient.desk})
                      </h3>
                      <p className="text-[12px] text-slate">
                        Consent:{' '}
                        <strong className={activePatient.consentGiven ? 'text-brand' : 'text-amber'}>
                          {activePatient.consentGiven ? 'Storage Accepted' : 'Declined (Purges on End Session)'}
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMic}
                        className={`h-10 px-4 rounded-full font-bold text-[13px] inline-flex items-center gap-2 transition-colors ${
                          micActive
                            ? 'bg-alert text-canvas shadow-sm'
                            : 'bg-brand hover:bg-accent text-canvas shadow-sm'
                        }`}
                      >
                        {micActive ? <MicrophoneSlash size={16} /> : <Microphone size={16} />}
                        {micActive ? 'Pause Live Mic' : 'Start Live Mic'}
                        {micActive && (
                          <span className="flex items-end gap-0.5 h-3">
                            {[0.35, 0.7, 1].map((mult, idx) => (
                              <span
                                key={idx}
                                className="w-1 rounded-full bg-canvas transition-all"
                                style={{ height: `${Math.max(3, Math.round(micLevel * 12 * mult))}px` }}
                              />
                            ))}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleRepeatLastCaption}
                        className="h-10 px-3.5 rounded-full bg-canvas hover:bg-sky border border-line text-navy font-semibold text-[13px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowCounterClockwise size={15} /> Repeat Last Caption
                      </button>

                      <button
                        type="button"
                        onClick={handleEndSession}
                        className="h-10 px-4 rounded-full bg-navy hover:bg-accent text-canvas font-bold text-[13px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle size={15} /> End Session & Summary
                      </button>
                    </div>
                  </div>

                  {asrError && (
                    <div className="px-4 py-2.5 rounded-[12px] bg-amber/20 border border-amber/40 text-navy text-[13px] font-medium">
                      {asrError}
                    </div>
                  )}

                  {interimCaption && (
                    <div className="px-4 py-2.5 rounded-[12px] bg-mint/70 border border-brand/30 text-navy text-[14px] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
                      <span className="font-semibold">Live ASR:</span> {interimCaption}
                    </div>
                  )}

                  {/* Spoken / Dictated Caption Stream Input (works on any browser or headless test) */}
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-[14px] bg-canvas border border-line">
                    <input
                      type="text"
                      value={dictateText}
                      onChange={(e) => {
                        setDictateText(e.target.value)
                        if (e.target.value.trim()) {
                          sendWsEvent({ type: 'live_caption', text: applyClinicalVocabulary(e.target.value), interim: true })
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && dictateText.trim()) {
                          e.preventDefault()
                          submitSpokenCaption(dictateText, simulateUncertain ? 0.62 : 0.94)
                          setDictateText('')
                        }
                      }}
                      placeholder={
                        isSpeechRecognitionSupported()
                          ? 'Speak into mic or type live spoken caption to stream to kiosk...'
                          : 'Type spoken clinician caption to stream in real time to patient kiosk...'
                      }
                      className="flex-1 min-w-[220px] h-10 px-3 rounded-[10px] bg-ash/50 border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate px-2">
                      <input
                        type="checkbox"
                        checked={simulateUncertain}
                        onChange={(e) => setSimulateUncertain(e.target.checked)}
                      />
                      Low confidence
                    </label>
                    <button
                      type="button"
                      disabled={!dictateText.trim()}
                      onClick={() => {
                        submitSpokenCaption(dictateText, simulateUncertain ? 0.62 : 0.94)
                        setDictateText('')
                      }}
                      className="h-10 px-4 rounded-[10px] bg-brand hover:bg-accent disabled:opacity-40 text-canvas font-bold text-[13px] inline-flex items-center gap-1.5"
                    >
                      <Microphone size={15} /> Stream Caption
                    </button>
                  </div>

                  <div className="space-y-3 p-4 rounded-[18px] bg-canvas border border-line max-h-[320px] overflow-y-auto">
                    {(activePatientDetail?.transcript?.length ?? 0) > 0 ? (
                      activePatientDetail!.transcript!.map((turn) => (
                        <div
                          key={turn.id}
                          className={`flex flex-col gap-1 ${
                            turn.speaker === 'patient' ? 'items-end text-right' : 'items-start text-left'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate uppercase">
                            <span>
                              {clockTime(turn.createdAt)} ·{' '}
                              {turn.speaker === 'patient'
                                ? `Patient (${turn.channel})`
                                : turn.speaker === 'system'
                                ? 'System Alert'
                                : `Nurse (${turn.channel})`}
                            </span>
                            {typeof turn.confidence === 'number' && (
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                                  turn.isUncertain ? 'bg-amber text-navy' : 'bg-ash text-slate'
                                }`}
                              >
                                {Math.round(turn.confidence * 100)}%{turn.isUncertain ? ' · Uncertain' : ''}
                              </span>
                            )}
                            {turn.editedBy && (
                              <span className="px-1.5 py-0.5 rounded bg-sky text-navy text-[10px]">
                                Edited by {turn.editedBy}
                              </span>
                            )}
                            {turn.speaker === 'nurse' && editingTurnId !== turn.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTurnId(turn.id)
                                  setEditingTurnText(turn.text)
                                }}
                                className="inline-flex items-center gap-1 text-accent hover:underline"
                              >
                                <PencilSimple size={12} /> Edit inline
                              </button>
                            )}
                          </div>

                          {editingTurnId === turn.id ? (
                            <div className="flex items-center gap-2 w-full max-w-[540px]">
                              <input
                                type="text"
                                value={editingTurnText}
                                onChange={(e) => setEditingTurnText(e.target.value)}
                                className="flex-1 h-9 px-3 rounded-[10px] bg-ash border border-accent text-[14px] text-navy outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveTurnEdit(turn.id)}
                                className="h-9 px-3 rounded-[10px] bg-brand text-canvas text-[12px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTurnId(null)}
                                className="h-9 px-2.5 rounded-[10px] bg-ash text-slate text-[12px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`px-4 py-2.5 rounded-[12px] text-[15px] ${
                                turn.speaker === 'patient'
                                  ? 'rounded-tr-sm bg-navy text-canvas font-bold'
                                  : turn.speaker === 'system'
                                  ? 'bg-amber/20 text-navy font-semibold border border-amber/40'
                                  : turn.isUncertain
                                  ? 'rounded-tl-sm bg-amber/20 text-navy font-medium border border-amber'
                                  : 'rounded-tl-sm bg-mint text-navy font-medium'
                              }`}
                            >
                              {turn.text}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[14px] text-slate py-6 text-center">
                        Waiting for patient responses on the {activePatient.desk} tablet...
                      </p>
                    )}
                  </div>

                  {/* Quick Prompt to Patient Screen */}
                  <div className="pt-2">
                    <label className="block text-[13px] font-semibold text-slate mb-2">
                      Send Direct Message / Guidance to {activePatient.desk} Patient Screen:
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customPrompt.trim()) {
                            e.preventDefault()
                            handleSendPrompt(customPrompt)
                          }
                        }}
                        placeholder={`Type custom note to display on ${activePatient.desk} tablet...`}
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
                      <div className="mt-2 text-[13px] text-brand font-semibold flex items-center gap-1.5">
                        <CheckCircle size={16} /> {promptSentToast}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Outcome: Prescription / Pharmacy Discharge or Ward Admission */}
                <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[18px] font-display font-bold text-navy flex items-center gap-2">
                        <FirstAidKit size={20} className="text-accent" /> Clinical Outcome: Medication, Discharge or Admission
                      </h3>
                      <p className="text-[12px] text-slate">
                        Prescribe medication for Pharmacy pickup, discharge the patient to leave, or admit to a hospital ward.
                      </p>
                    </div>
                    {activePatient.disposition && (
                      <span
                        className={`h-8 px-3 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 ${
                          activePatient.status === 'Admitted'
                            ? 'bg-alert text-canvas'
                            : 'bg-mint text-brand border border-brand/25'
                        }`}
                      >
                        {activePatient.disposition}
                        {activePatient.ward ? ` · ${activePatient.ward}` : ''}
                      </span>
                    )}
                  </div>

                  {(activePatient.diagnosis || activePatient.prescription) && (
                    <div className="grid sm:grid-cols-2 gap-3 p-3.5 rounded-[14px] bg-canvas border border-line text-[13px]">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate">Recorded Diagnosis</span>
                        <p className="font-semibold text-navy">{activePatient.diagnosis || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate">Prescription / Medicine</span>
                        <p className="font-semibold text-navy">{activePatient.prescription || '—'}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Diagnosis / Clinical Impression</label>
                      <input
                        type="text"
                        value={diagInput}
                        onChange={(e) => setDiagInput(e.target.value)}
                        placeholder="e.g. Acute Viral Fever / Suspected Angina"
                        className="w-full h-10 px-3 rounded-[10px] bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Admission Ward & Bed (if admitting)</label>
                      <input
                        type="text"
                        value={wardInput}
                        onChange={(e) => setWardInput(e.target.value)}
                        placeholder="e.g. Cardiac Observation Ward B · Bed 4"
                        className="w-full h-10 px-3 rounded-[10px] bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Prescription & Dosage Instructions</label>
                    <input
                      type="text"
                      value={rxInput}
                      onChange={(e) => setRxInput(e.target.value)}
                      placeholder="e.g. Paracetamol 500mg — 2 tablets every 8 hours for 5 days"
                      className="w-full h-10 px-3 rounded-[10px] bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDisposition('pharmacy')}
                      className="h-10 px-4 rounded-full bg-sky hover:bg-navy hover:text-canvas text-navy font-bold text-[13px] transition-colors"
                    >
                      1. Send Prescription to Pharmacy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisposition('discharged')}
                      className="h-10 px-4 rounded-full bg-brand hover:bg-accent text-canvas font-bold text-[13px] transition-colors shadow-sm"
                    >
                      2. Give Medicine & Discharge Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisposition('admitted')}
                      className="h-10 px-4 rounded-full bg-alert hover:opacity-90 text-canvas font-bold text-[13px] transition-colors shadow-sm"
                    >
                      Admit Patient to Ward
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-ash/50 rounded-[24px] border border-line p-10 text-center text-slate">
                No patient intakes found. Open the kiosk to start a check-in.
              </div>
            )}
          </section>

          {/* Right Column: Actions, Interpreter Queue & Reception Queue */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <h3 className="text-[17px] font-display font-bold text-navy flex items-center gap-2">
                <Stethoscope size={20} className="text-accent" /> Clinical Triage Actions
              </h3>

              {actionToast && (
                <div className="p-2.5 rounded-[10px] bg-mint text-brand text-[12px] font-bold flex items-center gap-1.5">
                  <CheckCircle size={16} /> {actionToast}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleRequestInterpreterForActive}
                  className="w-full h-12 px-4 rounded-[12px] bg-canvas hover:border-accent text-navy font-semibold text-[14px] flex items-center justify-between border border-line transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall size={18} className="text-accent" />
                    Request KSL Interpreter ({activePatient?.desk || 'Desk 3'})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-navy/10">Priority</span>
                </button>

                {activePatient && (
                  <>
                    <button
                      onClick={() => handleAssignToMe(activePatient.id)}
                      className="w-full h-12 px-4 rounded-[12px] bg-canvas hover:bg-sky text-navy font-semibold text-[14px] flex items-center justify-between border border-line transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck size={18} className="text-brand" /> Assign Patient to Me ({me.name.split(' ')[0]})
                      </span>
                      <CaretRight size={16} className="text-slate" />
                    </button>

                    <button
                      onClick={() => handlePatientStatusChange(activePatient.id, 'In Triage')}
                      className="w-full h-12 px-4 rounded-[12px] bg-canvas hover:bg-sky text-navy font-semibold text-[14px] flex items-center justify-between border border-line transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FirstAidKit size={18} /> Handoff to Triage Bay #2
                      </span>
                      <CaretRight size={16} className="text-slate" />
                    </button>
                  </>
                )}

                <a
                  href={`#/kiosk?terminal=${activePatient?.terminalId || 'TERM-03'}`}
                  className="w-full h-12 px-4 rounded-[12px] bg-accent hover:bg-brand text-canvas font-semibold text-[14px] flex items-center justify-between transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Broadcast size={18} /> Open {activePatient?.desk || 'Desk 3'} Patient Tablet
                  </span>
                  <CaretRight size={16} />
                </a>
              </div>

              {/* Open KSL Interpreter Requests */}
              {interpRequests.length > 0 && (
                <div className="pt-3 border-t border-line flex flex-col gap-2">
                  <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                    <HandWaving size={15} className="text-amber" /> Active KSL Interpreter Queue ({interpRequests.length})
                  </span>
                  {interpRequests.map((req) => (
                    <div key={req.id} className="p-3 rounded-[12px] bg-canvas border border-line flex flex-col gap-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">
                          {req.desk} {req.patientName ? `· ${req.patientName}` : ''}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Dispatched' ? 'bg-mint text-brand' : 'bg-amber/20 text-amber'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleInterpreterStatus(req.id, 'Dispatched')}
                            className="flex-1 h-7 rounded-full bg-accent text-canvas font-bold text-[11px]"
                          >
                            Dispatch Interpreter
                          </button>
                        )}
                        <button
                          onClick={() => handleInterpreterStatus(req.id, 'Resolved')}
                          className="flex-1 h-7 rounded-full bg-ash hover:bg-line text-navy font-semibold text-[11px]"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Triage Queue */}
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-display font-bold text-navy">Desk Queue ({patients.length})</h3>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full p-3 rounded-[16px] text-left border transition-all ${
                      p.id === activePatient?.id
                        ? 'bg-canvas border-accent ring-2 ring-accent/15 shadow-sm'
                        : 'bg-canvas/60 border-line hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[14px] text-navy truncate">
                        {p.name} <span className="text-[11px] font-mono text-slate">({p.id})</span>
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          p.status === 'Waiting' || p.status === 'Checking In'
                            ? 'bg-amber/15 text-amber'
                            : p.status === 'In Triage'
                            ? 'bg-sky text-navy'
                            : 'bg-mint text-brand'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-slate mt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Heartbeat size={13} className={p.urgent ? 'text-alert' : ''} /> {p.symptom || 'Checking in'} · {p.desk}
                      </span>
                      <span className="text-[11px]">{timeAgo(p.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-line text-[12px] text-slate flex items-center justify-between">
                <span>Auto-wipe privacy enabled</span>
                <span className="text-brand font-medium">KNH Reception</span>
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}
