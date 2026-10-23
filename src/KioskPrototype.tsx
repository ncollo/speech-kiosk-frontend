import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowCounterClockwise, Backspace, Keyboard, SquaresFour, PaperPlaneRight, Warning, HandWaving,
  CheckCircle, Clock, UserCircle, Heartbeat, MapPin, ShieldCheck, X, Person, Lock,
  type Icon,
} from '@phosphor-icons/react'
import { Header, TurnNurse, TurnPatient, SymptomCard, StatusStrip, CARDS, type Lang, type StatusState } from './Kiosk'

/* ---------- Script ---------- */
type Reply = 'type' | 'cards' | 'body' | 'chips' | 'end'
type Step = { en: (n: string) => string; sw: (n: string) => string; reply: Reply }
const SCRIPT: Step[] = [
  { en: () => 'Good morning. Please tell me your name.', sw: () => 'Habari za asubuhi. Tafadhali niambie jina lako.', reply: 'type' },
  { en: () => 'What brings you in today?', sw: () => 'Nini kimekuleta leo?', reply: 'cards' },
  { en: () => 'Can you show me where it hurts?', sw: () => 'Unaweza kunionyesha mahali panapouma?', reply: 'body' },
  { en: () => 'How long have you felt this?', sw: () => 'Umehisi hivi kwa muda gani?', reply: 'chips' },
  {
    en: (n) => `Thank you${n ? `, ${n}` : ''}. A doctor will see you shortly. Please take a seat near Desk 3.`,
    sw: (n) => `Asante${n ? ` ${n}` : ''}. Daktari atakuona hivi punde. Tafadhali keti karibu na Dawati 3.`,
    reply: 'end',
  },
]
const DURATIONS: [string, string][] = [
  ['Less than an hour', 'Chini ya saa moja'],
  ['Since this morning', 'Tangu asubuhi'],
  ['A few days', 'Siku chache'],
  ['More than a week', 'Zaidi ya wiki moja'],
]
const URGENT = new Set(['Chest Pain', 'Shortness of Breath'])
const CAPTION_PX = [32, 40, 48]

type Turn = { who: 'nurse' | 'patient'; text: string; icon?: Icon }
type Visit = { name: string; symptom?: [string, string]; places: string[]; duration?: string; urgent: boolean }

/* ---------- Body map ---------- */
const R = (x: number, y: number, w: number, h: number, rx = 10) => ({ x, y, width: w, height: h, rx })
const REGIONS: { id: string; en: string; sw: string; rect?: ReturnType<typeof R>; circle?: { cx: number; cy: number; r: number } }[] = [
  { id: 'head', en: 'Head', sw: 'Kichwa', circle: { cx: 100, cy: 38, r: 28 } },
  { id: 'throat', en: 'Throat', sw: 'Koo', rect: R(88, 70, 24, 16, 6) },
  { id: 'chest-r', en: 'Chest, right', sw: 'Kifua, kulia', rect: R(60, 90, 39, 66, 12) },
  { id: 'chest-l', en: 'Chest, left', sw: 'Kifua, kushoto', rect: R(101, 90, 39, 66, 12) },
  { id: 'stomach', en: 'Stomach', sw: 'Tumbo', rect: R(62, 158, 76, 44, 10) },
  { id: 'lower', en: 'Lower belly', sw: 'Tumbo la chini', rect: R(62, 204, 76, 42, 12) },
  { id: 'arm-r', en: 'Right arm', sw: 'Mkono wa kulia', rect: R(30, 94, 26, 148, 13) },
  { id: 'arm-l', en: 'Left arm', sw: 'Mkono wa kushoto', rect: R(144, 94, 26, 148, 13) },
  { id: 'leg-r', en: 'Right leg', sw: 'Mguu wa kulia', rect: R(64, 250, 34, 142, 14) },
  { id: 'leg-l', en: 'Left leg', sw: 'Mguu wa kushoto', rect: R(102, 250, 34, 142, 14) },
]

function BodyMap({ picked, toggle }: { picked: string[]; toggle: (id: string) => void }) {
  return (
    <div className="relative h-full flex items-center justify-center gap-4">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate w-16 text-right">
        Your right<br /><span className="font-normal normal-case tracking-normal text-[11px]">Kulia</span>
      </span>
      <svg viewBox="0 0 200 400" className="h-full max-h-[300px]" role="group" aria-label="Body map">
        {REGIONS.map((r) => {
          const on = picked.includes(r.id)
          const cls = `cursor-pointer transition-colors ${on ? 'fill-accent stroke-brand-dark' : 'fill-sky stroke-line hover:fill-accent/30'}`
          const common = { className: cls, strokeWidth: 2, onClick: () => toggle(r.id), role: 'button', 'aria-pressed': on, 'aria-label': r.en, tabIndex: 0 } as const
          return r.circle ? <circle key={r.id} {...common} {...r.circle} /> : <rect key={r.id} {...common} {...r.rect!} />
        })}
      </svg>
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate w-16">
        Your left<br /><span className="font-normal normal-case tracking-normal text-[11px]">Kushoto</span>
      </span>
    </div>
  )
}

/* ---------- Keyboard ---------- */
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
function OnScreenKeyboard({ value, onChange, onSend, onBack }: { value: string; onChange: (v: string) => void; onSend: () => void; onBack: () => void }) {
  const key = 'h-13 rounded-[12px] bg-canvas border border-line text-[20px] font-bold text-navy active:bg-mint hover:border-accent transition-colors shadow-sm'
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-14 px-5 rounded-[14px] bg-canvas border-2 border-accent flex items-center text-[22px] font-bold text-navy shadow-inner">
          {value || <span className="text-slate/50 font-normal text-[18px]">Type here · Andika hapa...</span>}
          <span className="caret inline-block w-[3px] h-7 bg-accent rounded-full ml-1" />
        </div>
        <button onClick={onBack} className="h-14 px-5 rounded-full bg-canvas border border-line flex items-center gap-2 text-[15px] font-semibold text-navy hover:bg-ash transition-colors">
          <SquaresFour size={22} className="text-accent" /> Quick Cards
        </button>
        <button onClick={onSend} disabled={!value.trim()} className="h-14 px-6 rounded-full bg-accent hover:bg-brand text-canvas flex items-center gap-2 text-[15px] font-bold disabled:opacity-40 transition-colors shadow-sm">
          Send · Tuma <PaperPlaneRight size={18} weight="bold" />
        </button>
      </div>
      <div className="flex flex-col gap-2 items-center">
        {ROWS.map((row, i) => (
          <div key={row} className="flex gap-2" style={{ paddingLeft: i * 28 }}>
            {row.split('').map((c) => (
              <button key={c} onClick={() => onChange(value + (value ? c.toLowerCase() : c))} className={`${key} w-[68px]`}>{c}</button>
            ))}
            {i === 2 && (
              <button onClick={() => onChange(value.slice(0, -1))} aria-label="Delete" className={`${key} w-[100px] grid place-items-center text-slate`}>
                <Backspace size={24} />
              </button>
            )}
          </div>
        ))}
        <button onClick={() => onChange(value + ' ')} className={`${key} w-[480px] text-[15px] text-slate font-medium`}>
          space
        </button>
      </div>
    </div>
  )
}

/* ---------- Main Kiosk Screen ---------- */
function Screen({ onStep }: { onStep: (label: string) => void }) {
  const [phase, setPhase] = useState<'welcome' | 'visit' | 'summary'>('welcome')
  const [lang, setLang] = useState<Lang>('EN')
  const [size, setSize] = useState(1)
  const [step, setStep] = useState(0)
  const [turns, setTurns] = useState<Turn[]>([])
  const [live, setLive] = useState('')
  const [typing, setTyping] = useState(false)
  const [mode, setMode] = useState<Reply>('type')
  const [draft, setDraft] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [selected, setSelected] = useState(-1)
  const [visit, setVisit] = useState<Visit>({ name: '', places: [], urgent: false })
  const [status, setStatus] = useState<StatusState>('listening')
  const [interp, setInterp] = useState<'none' | 'open' | 'requested'>('none')
  const threadRef = useRef<HTMLDivElement>(null)

  const say = (i: number, name = visit.name) => {
    const s = SCRIPT[i]
    const full = (lang === 'SW' ? s.sw : s.en)(name)
    setStep(i); setMode(s.reply); setLive(''); setTyping(true); setSelected(-1)
    let n = 0
    const t = setInterval(() => {
      n += 1
      setLive(full.slice(0, n))
      if (n >= full.length) { clearInterval(t); setTyping(false) }
    }, 36)
  }

  useEffect(() => {
    onStep(phase === 'welcome' ? 'Welcome' : phase === 'summary' ? 'Visit summary' : ['Name', 'Reason for visit', 'Body map', 'How long', 'Finished'][step])
  }, [phase, step, onStep])

  useLayoutEffect(() => { threadRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [turns, live, mode])

  const start = () => {
    setPhase('visit')
    setTurns([])
    setVisit({ name: '', places: [], urgent: false })
    setPicked([])
    setDraft('')
    setInterp('none')
    setTimeout(() => say(0, ''), 400)
  }

  const reset = () => {
    setPhase('welcome')
    setTurns([])
    setLive('')
    setStep(0)
  }

  const answer = (turn: Omit<Turn, 'who'>, patch: Partial<Visit> = {}) => {
    const next = { ...visit, ...patch }
    setVisit(next)
    // Synchronize to localStorage for clinician portal live monitoring
    try {
      localStorage.setItem('clearcaption_active_visit', JSON.stringify(next))
    } catch (e) {
      console.error(e)
    }
    setTurns((t) => [...t, { who: 'nurse', text: live }, { who: 'patient', ...turn }])
    setLive('')
    setTimeout(() => say(step + 1, next.name), 850)
  }

  const fs = CAPTION_PX[size]

  /* Welcome Screen - Beautifully Styled with Landing Page Tokens */
  if (phase === 'welcome') {
    return (
      <div className="w-full max-w-[1240px] h-[820px] bg-canvas rounded-[28px] border border-line text-navy flex flex-col overflow-hidden shadow-sm">
        {/* Header */}
        <header className="h-18 px-8 md:px-12 bg-ash/70 backdrop-blur-md border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-[10px] bg-brand text-canvas grid place-items-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" /></svg>
            </span>
            <span className="font-display font-bold text-[22px] tracking-tight">ClearCaption</span>
          </div>
          <span className="h-9 px-4 rounded-full bg-sky text-[14px] text-navy font-semibold inline-flex items-center">
            Desk 3 · Outpatient Reception
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate font-medium">Kenyatta National Hospital</span>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="flex-1 grid lg:grid-cols-12 gap-8 px-8 md:px-12 py-10 items-center overflow-y-auto">
          {/* Left Column: Friendly Reception Message */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="self-start h-9 px-4 rounded-full bg-mint text-brand font-semibold text-[14px] inline-flex items-center gap-2 border border-brand/20">
              <HandWaving size={18} /> {lang === 'SW' ? 'Karibu · Welcome to Reception' : 'Welcome · Karibu Reception'}
            </span>

            <h1 className="text-[40px] md:text-[54px] font-display font-bold leading-[1.05] tracking-tight text-navy">
              {lang === 'SW' ? (
                <>Muuguzi ataongea.<br /><span className="text-accent">Utasoma maneno hapa.</span></>
              ) : (
                <>The nurse will speak.<br /><span className="text-accent">You read their words here.</span></>
              )}
            </h1>

            <p className="text-[18px] md:text-[20px] leading-relaxed text-slate max-w-[580px]">
              {lang === 'SW'
                ? 'Jibu kwa kugusa kadi za haraka, kuandika, au kuonyesha mahali panapouma kwenye mwili. Mkalimani wa Lugha ya Alama (KSL) yupo tayari wakati wowote.'
                : 'Answer by tapping quick cards, typing your name, or pointing on the body map. A Kenyan Sign Language interpreter is available on call at any moment.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={start}
                className="group h-16 px-8 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[20px] flex items-center gap-3 transition-colors shadow-md"
              >
                <span>{lang === 'SW' ? 'Gusa kuanza' : 'Tap to start'}</span>
                <span className="w-10 h-10 rounded-full bg-canvas text-accent grid place-items-center transition-transform group-hover:translate-x-1">
                  <ArrowRight size={20} weight="bold" />
                </span>
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-[13px] text-slate border-t border-line">
              <span className="flex items-center gap-1.5"><ShieldCheck size={18} className="text-brand" /> 100% Private · Clears after visit</span>
              <span className="flex items-center gap-1.5"><Heartbeat size={18} className="text-accent" /> Triage Assisted</span>
            </div>
          </div>

          {/* Right Column: Preferences (Language & Text Size) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Language Box */}
            <div className="rounded-[24px] bg-ash p-6 border border-line flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-wider font-bold text-slate">
                  {lang === 'SW' ? 'Chagua lugha ya kusoma' : 'Choose reading language'}
                </span>
                <span className="text-[12px] text-slate">English / Kiswahili</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([['EN', 'English'], ['SW', 'Kiswahili']] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setLang(k)}
                    className={`h-16 rounded-[16px] border font-bold text-[18px] transition-all flex items-center justify-center gap-2 ${
                      lang === k
                        ? 'bg-navy text-canvas border-navy shadow-sm'
                        : 'bg-canvas text-navy border-line hover:border-accent'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size Box */}
            <div className="rounded-[24px] bg-ash p-6 border border-line flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-wider font-bold text-slate">
                  {lang === 'SW' ? 'Ukubwa wa maandishi' : 'Adjust caption size'}
                </span>
                <span className="text-[12px] text-slate">Accessibility</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Standard', 'Large', 'Extra'].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setSize(i)}
                    className={`h-16 rounded-[16px] border font-bold transition-all flex flex-col items-center justify-center ${
                      size === i
                        ? 'bg-navy text-canvas border-navy shadow-sm'
                        : 'bg-canvas text-navy border-line hover:border-accent'
                    }`}
                  >
                    <span className="text-[18px]">Aa</span>
                    <span className="text-[11px] opacity-75 font-normal">{label}</span>
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-[12px] bg-canvas border border-line text-slate text-[14px]">
                Preview: <span className="font-bold text-navy" style={{ fontSize: fs * 0.55 }}>Sample nurse caption text</span>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom bar */}
        <footer className="h-12 bg-ash px-8 md:px-12 border-t border-line flex items-center justify-between text-[13px] text-slate">
          <span>Outpatient Reception Tablet · Kenyatta National Hospital</span>
          <button onClick={() => setInterp('open')} className="hover:text-accent font-semibold flex items-center gap-1.5">
            <HandWaving size={16} /> Request KSL Interpreter
          </button>
        </footer>

        {interp === 'open' && <InterpreterSheet onClose={() => setInterp('none')} onConfirm={() => setInterp('requested')} />}
      </div>
    )
  }

  /* Summary Screen - Clean Hospital Triage Card */
  if (phase === 'summary') return <Summary visit={visit} onReset={reset} />

  /* Active Live Intake Screen */
  const sheetH = mode === 'type' || mode === 'body' ? 390 : 280
  return (
    <div className="w-full max-w-[1240px] h-[820px] bg-canvas rounded-[28px] border border-line text-navy flex flex-col overflow-hidden shadow-sm relative">
      <Header lang={lang} setLang={setLang} size={size} setSize={setSize} />

      {visit.urgent && (
        <div role="alert" className="absolute top-[76px] right-12 z-10 h-11 pl-3 pr-5 rounded-full bg-alert text-canvas font-bold text-[15px] flex items-center gap-2 shadow-md animate-pulse">
          <Warning size={20} weight="fill" /> Urgent Concern · Triage Notified
        </div>
      )}

      {/* Live Conversation Stream */}
      <main ref={threadRef} className="flex-1 min-h-0 overflow-y-auto px-8 md:px-12 py-5 flex flex-col gap-4">
        <div className="mt-auto" />
        {turns.map((t, i) => (t.who === 'nurse' ? <TurnNurse key={i} text={t.text} /> : <TurnPatient key={i} text={t.text} icon={t.icon} />))}
        {live && (
          <div style={{ ['--cap' as string]: `${fs}px` }} className="[&_.text-caption]:text-[length:var(--cap)] [&_.text-caption]:leading-[1.25]">
            <TurnNurse variant="live" text={live} />
          </div>
        )}
      </main>

      {/* Response Tray Area */}
      <section className="shrink-0 bg-ash/80 backdrop-blur-md border-t border-line px-8 md:px-12 py-3 flex flex-col gap-2 transition-[height]" style={{ height: sheetH }}>
        {typing ? (
          <div className="h-full grid place-items-center text-[19px] text-slate font-medium">
            <span className="flex items-center gap-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </span>
              The nurse is speaking · Muuguzi anaongea...
            </span>
          </div>
        ) : mode === 'type' ? (
          <OnScreenKeyboard
            value={draft}
            onChange={setDraft}
            onBack={() => setMode(SCRIPT[step].reply === 'type' ? 'type' : SCRIPT[step].reply)}
            onSend={() => {
              const v = draft.trim()
              setDraft('')
              answer({ text: v }, step === 0 ? { name: v } : {})
            }}
          />
        ) : mode === 'cards' ? (
          <>
            <div className="h-12 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate">
                Tap your symptom or concern · Gusa kadi ya jibu
              </span>
              <button onClick={() => setMode('type')} className="h-10 px-4 flex items-center gap-2 bg-canvas border border-line rounded-full text-[13px] font-bold text-navy hover:bg-sky transition-colors">
                <Keyboard size={18} /> Type a reply instead
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {CARDS.map(([en, sw, I], i) => (
                <SymptomCard
                  key={en}
                  en={en}
                  sw={sw}
                  icon={I}
                  state={i === selected ? 'selected' : 'default'}
                  onSelect={() => {
                    setSelected(i)
                    setTimeout(() => answer({ text: `${en} · ${sw}`, icon: I }, { symptom: [en, sw], urgent: visit.urgent || URGENT.has(en) }), 320)
                  }}
                />
              ))}
            </div>
          </>
        ) : mode === 'body' ? (
          <div className="h-full grid grid-cols-12 gap-6">
            <div className="col-span-5 h-full py-1 flex justify-center">
              <BodyMap picked={picked} toggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))} />
            </div>
            <div className="col-span-7 flex flex-col gap-3 py-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate">
                Tap where it hurts on the body · Gusa mahali panapouma
              </span>
              <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                {picked.length === 0 && <p className="text-[17px] text-slate">Tap one or more areas on the body silhouette.</p>}
                {picked.map((id) => {
                  const r = REGIONS.find((x) => x.id === id)!
                  return (
                    <button key={id} onClick={() => setPicked((p) => p.filter((x) => x !== id))} className="h-12 pl-4 pr-2.5 rounded-full bg-accent text-canvas flex items-center gap-2.5 shadow-sm">
                      <span className="flex flex-col items-start leading-tight">
                        <span className="font-bold text-[15px]">{r.en}</span>
                        <span className="text-[11px] text-canvas/80">{r.sw}</span>
                      </span>
                      <X size={16} />
                    </button>
                  )
                })}
              </div>
              <div className="mt-auto flex gap-3">
                <button onClick={() => setMode('type')} className="h-14 px-5 rounded-full bg-canvas border border-line flex items-center gap-2 text-[14px] font-semibold text-navy hover:bg-ash">
                  <Keyboard size={20} /> Type instead
                </button>
                <button
                  disabled={!picked.length}
                  onClick={() => {
                    const names = picked.map((id) => REGIONS.find((x) => x.id === id)!)
                    answer({ text: names.map((n) => n.en).join(', '), icon: Person }, { places: names.map((n) => `${n.en} · ${n.sw}`) })
                    setPicked([])
                  }}
                  className="flex-1 h-14 rounded-full bg-accent hover:bg-brand text-canvas text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors shadow-sm"
                >
                  Send · Tuma <PaperPlaneRight size={20} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        ) : mode === 'chips' ? (
          <>
            <div className="h-12 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate">
                How long have you felt this? · Kwa muda gani?
              </span>
              <button onClick={() => setMode('type')} className="h-10 px-4 flex items-center gap-2 bg-canvas border border-line rounded-full text-[13px] font-bold text-navy hover:bg-sky transition-colors">
                <Keyboard size={18} /> Type a reply
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 flex-1 pb-2">
              {DURATIONS.map(([en, sw]) => (
                <button
                  key={en}
                  onClick={() => answer({ text: `${en} · ${sw}`, icon: Clock }, { duration: `${en} · ${sw}` })}
                  className="rounded-[16px] bg-canvas border border-line hover:border-accent p-4 text-left transition-colors flex flex-col justify-center gap-1 shadow-sm"
                >
                  <Clock size={28} className="text-accent mb-1" />
                  <span className="text-[16px] font-bold text-navy leading-snug">{en}</span>
                  <span className="text-[13px] text-slate">{sw}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-mint text-brand grid place-items-center">
                <CheckCircle size={36} weight="fill" />
              </span>
              <div>
                <p className="font-display font-bold text-[26px] tracking-tight">You're checked in</p>
                <p className="text-[16px] text-slate">Umesajiliwa. Tafadhali keti karibu na Dawati 3.</p>
              </div>
            </div>
            <button
              onClick={() => setPhase('summary')}
              className="h-16 px-8 rounded-full bg-navy hover:bg-navy/90 text-canvas font-bold text-[18px] flex items-center gap-3 transition-colors shadow-md"
            >
              View Triage Summary · Maliza <ArrowRight size={22} weight="bold" />
            </button>
          </div>
        )}
      </section>

      {/* Bottom Status Strip */}
      <StatusStrip
        state={status}
        onToggle={() => setStatus((s) => (s === 'paused' ? 'listening' : 'paused'))}
        onInterpreter={() => setInterp(interp === 'requested' ? 'requested' : 'open')}
        interpreter={interp === 'requested'}
      />

      {interp === 'open' && <InterpreterSheet onClose={() => setInterp('none')} onConfirm={() => setInterp('requested')} />}

      {status === 'paused' && (
        <button onClick={() => setStatus('listening')} className="absolute inset-x-0 top-18 bottom-10 bg-navy/40 backdrop-blur-sm grid place-items-center z-20">
          <span className="rounded-[24px] bg-canvas/95 backdrop-blur-xl border border-line px-10 py-8 flex flex-col items-center gap-2 shadow-xl">
            <span className="font-display font-bold text-[28px] text-navy">Paused · Imesimamishwa</span>
            <span className="text-[17px] text-slate">Tap anywhere to resume speech captioning</span>
          </span>
        </button>
      )}
    </div>
  )
}

/* ---------- Interpreter Request Modal ---------- */
function InterpreterSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <div className="absolute inset-0 z-30 bg-navy/50 backdrop-blur-md grid place-items-center p-4">
      <div role="dialog" aria-modal className="w-full max-w-[560px] rounded-[28px] bg-canvas border border-line p-8 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className={`w-14 h-14 rounded-[16px] grid place-items-center ${sent ? 'bg-mint text-brand' : 'bg-sky text-navy'}`}>
            {sent ? <CheckCircle size={32} weight="fill" /> : <HandWaving size={32} />}
          </span>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-ash grid place-items-center text-slate hover:text-navy">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-[24px] text-navy">Interpreter Dispatched</h3>
            <p className="text-[16px] text-slate leading-relaxed">
              Mkalimani ameombwa. Reception and triage nurses have been notified. An on-call Kenyan Sign Language interpreter is coming to Desk 3.
            </p>
            <button onClick={onClose} className="mt-4 h-13 rounded-full bg-accent text-canvas font-bold text-[16px]">
              Return to Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h3 className="font-display font-bold text-[24px] text-navy">Request a Sign Language Interpreter?</h3>
            <p className="text-[16px] text-slate leading-relaxed">
              Ungependa kuomba mkalimani wa Lugha ya Alama ya Kenya (KSL)? Staff at reception will call our on-duty certified hospital interpreter.
            </p>
            <div className="flex gap-3 pt-3">
              <button onClick={onClose} className="flex-1 h-13 rounded-full bg-ash hover:bg-line text-navy font-bold text-[15px]">
                Cancel · Ghairi
              </button>
              <button
                onClick={() => {
                  setSent(true)
                  onConfirm()
                }}
                className="flex-1 h-13 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[15px] shadow-sm"
              >
                Yes, Call Interpreter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Summary Screen ---------- */
function Summary({ visit, onReset }: { visit: Visit; onReset: () => void }) {
  const [left, setLeft] = useState(30)
  const [hold, setHold] = useState(false)
  const [handoffSuccess, setHandoffSuccess] = useState(false)

  useEffect(() => {
    if (hold) return
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          onReset()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [hold, onReset])

  const rows: [Icon, string, string][] = [
    [UserCircle, 'Patient Name', visit.name || 'Anonymous'],
    [Heartbeat, 'Chief Complaint', visit.symptom ? visit.symptom.join(' · ') : 'Not stated'],
    [MapPin, 'Pain Location', visit.places.length ? visit.places.join(', ') : 'Not stated'],
    [Clock, 'Duration', visit.duration ?? 'Not stated'],
  ]

  const handleSendToClinician = () => {
    try {
      localStorage.setItem('clearcaption_active_visit', JSON.stringify(visit))
    } catch (e) {
      console.error(e)
    }
    setHandoffSuccess(true)
    setTimeout(() => setHandoffSuccess(false), 3000)
  }

  return (
    <div className="w-full max-w-[1240px] h-[820px] bg-canvas rounded-[28px] border border-line text-navy flex flex-col overflow-hidden shadow-sm">
      {/* Top Header */}
      <header className="h-18 px-8 md:px-12 bg-ash/70 backdrop-blur-md border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-[10px] bg-brand text-canvas grid place-items-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" /></svg>
          </span>
          <span className="font-display font-bold text-[22px] tracking-tight">ClearCaption</span>
        </div>
        <span className="h-9 px-4 rounded-full bg-sky text-[14px] text-navy font-semibold inline-flex items-center">
          Desk 3 Triage Handoff
        </span>
      </header>

      <main className="flex-1 grid lg:grid-cols-12 gap-8 px-8 md:px-12 py-8 overflow-y-auto">
        <section className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase font-bold tracking-wider text-slate">For the triage nurse · Kwa muuguzi</p>
              <h1 className="font-display font-bold text-[34px] tracking-tight text-navy">Visit Intake Summary</h1>
            </div>
            {visit.urgent && (
              <span className="h-10 px-4 rounded-full bg-alert text-canvas font-bold text-[14px] flex items-center gap-1.5 shadow-sm">
                <Warning size={18} weight="fill" /> Urgent: Immediate Clinical Review
              </span>
            )}
          </div>

          <ul className="rounded-[20px] bg-ash/50 border border-line divide-y divide-line">
            {rows.map(([I, k, v]) => (
              <li key={k} className="px-6 py-4 flex items-center gap-5">
                <span className="w-11 h-11 rounded-[12px] bg-canvas border border-line text-accent grid place-items-center shrink-0">
                  <I size={24} />
                </span>
                <span className="w-[180px] text-[15px] font-semibold text-slate">{k}</span>
                <span className="text-[19px] font-bold text-navy flex-1">{v}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSendToClinician}
              className="h-13 px-6 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[15px] flex items-center gap-2 transition-colors shadow-sm"
            >
              <PaperPlaneRight size={18} /> Send to Nurse Station Console
            </button>
            <a
              href="#/staff"
              className="h-13 px-6 rounded-full bg-canvas hover:bg-ash text-navy border border-line font-bold text-[15px] flex items-center gap-2 transition-colors"
            >
              <Lock size={16} /> Open Staff Portal
            </a>
            {handoffSuccess && (
              <span className="text-[13px] text-brand font-bold flex items-center gap-1 animate-fadeIn">
                <CheckCircle size={18} weight="fill" /> Sent to Desk 3 Clinician Console!
              </span>
            )}
          </div>
        </section>

        {/* Privacy Wipe Aside */}
        <aside className="lg:col-span-4 rounded-[24px] bg-ash p-6 border border-line flex flex-col gap-4">
          <span className="w-12 h-12 rounded-[14px] bg-canvas border border-line text-brand grid place-items-center">
            <ShieldCheck size={28} />
          </span>
          <h2 className="font-display font-bold text-[22px] leading-snug tracking-tight text-navy">
            This screen clears itself for patient privacy.
          </h2>
          <p className="text-[14px] leading-relaxed text-slate">
            Skrini hii itafutika yenyewe. Data is not permanently stored on the tablet.
          </p>

          <div className="flex items-baseline gap-2 pt-2">
            <span className="font-display font-extrabold text-[54px] leading-none tabular-nums text-navy">{left}</span>
            <span className="text-[15px] text-slate font-medium">{hold ? 'paused' : 'seconds remaining'}</span>
          </div>

          <div className="h-2 rounded-full bg-canvas overflow-hidden border border-line">
            <div className="h-full bg-accent transition-[width] duration-1000 ease-linear" style={{ width: `${(left / 30) * 100}%` }} />
          </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-4">
            <button
              onClick={onReset}
              className="h-13 rounded-full bg-navy hover:bg-navy/90 text-canvas font-bold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <ArrowCounterClockwise size={18} /> Clear Now & Start New Patient
            </button>
            <button
              onClick={() => setHold((h) => !h)}
              className="h-11 rounded-full bg-canvas hover:bg-ash border border-line font-semibold text-[14px] text-navy transition-colors"
            >
              {hold ? 'Resume Countdown' : 'Pause Wipe (Keep on Screen)'}
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}

/* ---------- Prototype Shell Wrapper ---------- */
export default function KioskPrototype() {
  const [label, setLabel] = useState('Welcome')
  const [key, setKey] = useState(0)

  return (
    <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col">
      {/* Top Prototype Navigation Bar */}
      <nav className="h-16 px-4 md:px-8 bg-ash/70 backdrop-blur-md border-b border-line flex items-center justify-between">
        <a
          href="#/"
          className="h-10 px-4 rounded-full bg-canvas hover:bg-line border border-line flex items-center gap-2 font-medium text-[14px] text-navy transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hospital Home
        </a>

        <div className="hidden sm:flex items-center gap-3 text-[14px]">
          <span className="text-slate">Outpatient Terminal</span>
          <span className="h-8 px-3 rounded-full bg-mint text-brand font-bold text-[13px] flex items-center border border-brand/20">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#/staff"
            className="h-10 px-4 rounded-full bg-canvas hover:bg-line border border-line flex items-center gap-1.5 font-medium text-[13px] text-slate hover:text-navy transition-colors"
          >
            <Lock size={14} /> Staff Portal
          </a>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="h-10 px-4 rounded-full bg-accent hover:bg-brand text-canvas flex items-center gap-1.5 font-bold text-[13px] transition-colors shadow-sm"
          >
            <ArrowCounterClockwise size={16} /> Restart
          </button>
        </div>
      </nav>

      {/* Main Kiosk Viewport */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-6 bg-ash/40">
        <Screen key={key} onStep={setLabel} />
      </div>
    </div>
  )
}
