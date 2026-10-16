import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowCounterClockwise, Backspace, Keyboard, SquaresFour, PaperPlaneRight, Warning, HandWaving,
  CheckCircle, Clock, UserCircle, Heartbeat, MapPin, ShieldCheck, X, Person, type Icon,
} from '@phosphor-icons/react'
import { Header, TurnNurse, TurnPatient, TrayLabel, SymptomCard, StatusStrip, CARDS, type Lang, type StatusState } from './Kiosk'

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
const CAPTION_PX = [34, 40, 48]

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
    <div className="relative h-full flex items-center gap-4">
      <span className="text-label text-slate w-16 text-right">Your right<br /><span className="font-normal normal-case tracking-normal">Kulia</span></span>
      <svg viewBox="0 0 200 400" className="h-full" role="group" aria-label="Body map">
        {REGIONS.map((r) => {
          const on = picked.includes(r.id)
          const cls = `cursor-pointer transition-colors ${on ? 'fill-brand stroke-brand-dark' : 'fill-mint stroke-brand/40 hover:fill-brand/25'}`
          const common = { className: cls, strokeWidth: 2, onClick: () => toggle(r.id), role: 'button', 'aria-pressed': on, 'aria-label': r.en, tabIndex: 0 } as const
          return r.circle ? <circle key={r.id} {...common} {...r.circle} /> : <rect key={r.id} {...common} {...r.rect!} />
        })}
      </svg>
      <span className="text-label text-slate w-16">Your left<br /><span className="font-normal normal-case tracking-normal">Kushoto</span></span>
    </div>
  )
}

/* ---------- Keyboard ---------- */
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
function OnScreenKeyboard({ value, onChange, onSend, onBack }: { value: string; onChange: (v: string) => void; onSend: () => void; onBack: () => void }) {
  const key = 'h-14 rounded-[12px] bg-canvas border border-line text-[22px] font-bold text-navy active:bg-mint transition-colors'
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-16 px-5 rounded-[14px] bg-canvas border-2 border-brand flex items-center text-patient text-navy">
          {value || <span className="text-slate/60 font-normal">Type here · Andika hapa</span>}
          <span className="caret inline-block w-[3px] h-8 bg-brand rounded-full ml-1" />
        </div>
        <button onClick={onBack} className="h-16 px-5 rounded-full bg-canvas border border-line flex items-center gap-2 text-card-label"><SquaresFour size={26} />Cards</button>
        <button onClick={onSend} disabled={!value.trim()} className="h-16 px-6 rounded-full bg-brand text-canvas flex items-center gap-2 text-card-label disabled:opacity-40">
          Send · Tuma <PaperPlaneRight size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-2 items-center">
        {ROWS.map((row, i) => (
          <div key={row} className="flex gap-2" style={{ paddingLeft: i * 36 }}>
            {row.split('').map((c) => (
              <button key={c} onClick={() => onChange(value + (value ? c.toLowerCase() : c))} className={`${key} w-[76px]`}>{c}</button>
            ))}
            {i === 2 && <button onClick={() => onChange(value.slice(0, -1))} aria-label="Delete" className={`${key} w-[120px] grid place-items-center`}><Backspace size={28} /></button>}
          </div>
        ))}
        <button onClick={() => onChange(value + ' ')} className={`${key} w-[520px] text-[16px] text-slate`}>space</button>
      </div>
    </div>
  )
}

/* ---------- Kiosk screen ---------- */
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
    }, 38)
  }

  useEffect(() => {
    onStep(phase === 'welcome' ? 'Welcome' : phase === 'summary' ? 'Visit summary' : ['Name', 'Reason for visit', 'Body map', 'How long', 'Finished'][step])
  }, [phase, step, onStep])

  useLayoutEffect(() => { threadRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [turns, live, mode])

  const start = () => { setPhase('visit'); setTurns([]); setVisit({ name: '', places: [], urgent: false }); setPicked([]); setDraft(''); setInterp('none'); setTimeout(() => say(0, ''), 400) }
  const reset = () => { setPhase('welcome'); setTurns([]); setLive(''); setStep(0) }

  const answer = (turn: Omit<Turn, 'who'>, patch: Partial<Visit> = {}) => {
    const next = { ...visit, ...patch }
    setVisit(next)
    setTurns((t) => [...t, { who: 'nurse', text: live }, { who: 'patient', ...turn }])
    setLive('')
    setTimeout(() => say(step + 1, next.name), 900)
  }

  const fs = CAPTION_PX[size]

  /* Welcome */
  if (phase === 'welcome') {
    return (
      <div className="w-[1280px] h-[800px] bg-canvas text-navy flex flex-col overflow-hidden">
        <Header lang={lang} setLang={setLang} size={size} setSize={setSize} />
        <main className="flex-1 grid grid-cols-12 gap-6 px-12 items-center">
          <div className="col-span-7 flex flex-col gap-8">
            <span className="self-start h-10 px-4 rounded-full bg-mint text-brand-dark font-bold text-[18px] inline-flex items-center gap-2"><HandWaving size={22} />{lang === 'SW' ? 'Karibu · Welcome' : 'Welcome · Karibu'}</span>
            <h1 className="font-display font-extrabold tracking-[-0.03em]" style={{ fontSize: fs * 1.6, lineHeight: 1.05 }}>
              {lang === 'SW' ? 'Muuguzi ataongea. Utasoma maneno yake hapa.' : 'The nurse will speak. You read their words here.'}
            </h1>
            <p className="text-[24px] leading-9 text-slate max-w-[620px]">
              {lang === 'SW' ? 'Jibu kwa kugusa kadi, au kwa kuandika. Unaweza kuomba mkalimani wakati wowote.' : 'Answer by tapping a card, or by typing. You can ask for an interpreter at any time.'}
            </p>
            <button onClick={start} className="self-start h-20 px-10 rounded-full bg-brand text-canvas font-bold text-[28px] flex items-center gap-3 hover:bg-brand-dark transition-colors">
              {lang === 'SW' ? 'Gusa kuanza' : 'Tap to start'} <ArrowRight size={30} />
            </button>
          </div>
          <div className="col-span-5 flex flex-col gap-4">
            <div className="rounded-[24px] bg-sky p-6 flex flex-col gap-4">
              <span className="text-label text-slate">{lang === 'SW' ? 'Chagua lugha' : 'Choose your language'}</span>
              <div className="grid grid-cols-2 gap-3">
                {([['EN', 'English'], ['SW', 'Kiswahili']] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k}
                    className={`h-20 rounded-[16px] border text-[24px] font-bold transition-colors ${lang === k ? 'bg-navy text-canvas border-navy' : 'bg-canvas border-line'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] bg-sky p-6 flex flex-col gap-4">
              <span className="text-label text-slate">{lang === 'SW' ? 'Ukubwa wa maandishi' : 'Text size'}</span>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <button key={i} onClick={() => setSize(i)} aria-pressed={size === i}
                    className={`h-20 rounded-[16px] border font-bold transition-colors ${size === i ? 'bg-navy text-canvas border-navy' : 'bg-canvas border-line'}`}
                    style={{ fontSize: [22, 30, 40][i] }}>Aa</button>
                ))}
              </div>
              <p className="text-slate" style={{ fontSize: fs * 0.6 }}>{lang === 'SW' ? 'Mfano wa maandishi' : 'Sample caption text'}</p>
            </div>
          </div>
        </main>
        <StatusStrip state="paused" onInterpreter={() => setInterp('open')} interpreter={interp === 'requested'} />
        {interp === 'open' && <InterpreterSheet onClose={() => setInterp('none')} onConfirm={() => setInterp('requested')} />}
      </div>
    )
  }

  /* Summary */
  if (phase === 'summary') return <Summary visit={visit} onReset={reset} />

  /* Visit */
  const sheetH = mode === 'type' || mode === 'body' ? 400 : 272
  return (
    <div className="relative w-[1280px] h-[800px] bg-canvas text-navy flex flex-col overflow-hidden">
      <Header lang={lang} setLang={setLang} size={size} setSize={setSize} />

      {visit.urgent && (
        <div role="alert" className="absolute top-[76px] right-12 z-10 h-12 pl-3 pr-5 rounded-full bg-amber text-navy font-bold text-[17px] flex items-center gap-2">
          <Warning size={24} weight="fill" />Urgent · The nurse has been alerted
        </div>
      )}

      <main ref={threadRef} className="flex-1 min-h-0 overflow-y-auto px-12 py-4 flex flex-col gap-3">
        <div className="mt-auto" />
        {turns.map((t, i) => t.who === 'nurse' ? <TurnNurse key={i} text={t.text} /> : <TurnPatient key={i} text={t.text} icon={t.icon} />)}
        {live && (
          <div style={{ ['--cap' as string]: `${fs}px` }} className="[&_.text-caption]:text-[length:var(--cap)] [&_.text-caption]:leading-[1.3]">
            <TurnNurse variant="live" text={live} />
          </div>
        )}
      </main>

      <section className="shrink-0 bg-sky border-t border-line px-12 py-3 flex flex-col gap-2 transition-[height]" style={{ height: sheetH }}>
        {typing ? (
          <div className="h-full grid place-items-center text-[20px] text-slate">
            <span className="flex items-center gap-3"><span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}</span>
              The nurse is speaking · Muuguzi anaongea</span>
          </div>
        ) : mode === 'type' ? (
          <OnScreenKeyboard value={draft} onChange={setDraft} onBack={() => setMode(SCRIPT[step].reply === 'type' ? 'type' : SCRIPT[step].reply)}
            onSend={() => { const v = draft.trim(); setDraft(''); answer({ text: v }, step === 0 ? { name: v } : {}) }} />
        ) : mode === 'cards' ? (
          <>
            <div className="h-14 flex items-center justify-between">
              <TrayLabel />
              <button onClick={() => setMode('type')} className="h-14 px-5 flex items-center gap-2 bg-canvas border border-line rounded-full text-card-label"><Keyboard size={28} />Type a reply</button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {CARDS.map(([en, sw, I], i) => (
                <SymptomCard key={en} en={en} sw={sw} icon={I} state={i === selected ? 'selected' : 'default'}
                  onSelect={() => { setSelected(i); setTimeout(() => answer({ text: `${en} · ${sw}`, icon: I }, { symptom: [en, sw], urgent: visit.urgent || URGENT.has(en) }), 350) }} />
              ))}
            </div>
          </>
        ) : mode === 'body' ? (
          <div className="h-full grid grid-cols-12 gap-6">
            <div className="col-span-5 h-full py-1 flex justify-center"><BodyMap picked={picked} toggle={(id) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} /></div>
            <div className="col-span-7 flex flex-col gap-4 py-2">
              <span className="text-label text-slate">Tap where it hurts · Gusa mahali panapouma</span>
              <div className="flex flex-wrap gap-2 min-h-[120px] content-start">
                {picked.length === 0 && <p className="text-[20px] text-slate">Tap one or more areas on the body. Gusa sehemu moja au zaidi.</p>}
                {picked.map((id) => {
                  const r = REGIONS.find((x) => x.id === id)!
                  return (
                    <button key={id} onClick={() => setPicked((p) => p.filter((x) => x !== id))} className="h-14 pl-5 pr-3 rounded-full bg-brand text-canvas flex items-center gap-3">
                      <span className="flex flex-col items-start leading-tight"><span className="font-bold text-[18px]">{r.en}</span><span className="text-[14px] text-canvas/80">{r.sw}</span></span>
                      <X size={20} />
                    </button>
                  )
                })}
              </div>
              <div className="mt-auto flex gap-3">
                <button onClick={() => setMode('type')} className="h-16 px-5 rounded-full bg-canvas border border-line flex items-center gap-2 text-card-label"><Keyboard size={26} />Type instead</button>
                <button disabled={!picked.length} onClick={() => {
                  const names = picked.map((id) => REGIONS.find((x) => x.id === id)!)
                  answer({ text: names.map((n) => n.en).join(', '), icon: Person }, { places: names.map((n) => `${n.en} · ${n.sw}`) }); setPicked([])
                }} className="flex-1 h-16 rounded-full bg-brand text-canvas text-card-label flex items-center justify-center gap-2 disabled:opacity-40">
                  Send · Tuma <PaperPlaneRight size={24} />
                </button>
              </div>
            </div>
          </div>
        ) : mode === 'chips' ? (
          <>
            <div className="h-14 flex items-center justify-between">
              <TrayLabel />
              <button onClick={() => setMode('type')} className="h-14 px-5 flex items-center gap-2 bg-canvas border border-line rounded-full text-card-label"><Keyboard size={28} />Type a reply</button>
            </div>
            <div className="grid grid-cols-4 gap-4 flex-1 pb-2">
              {DURATIONS.map(([en, sw]) => (
                <button key={en} onClick={() => answer({ text: `${en} · ${sw}`, icon: Clock }, { duration: `${en} · ${sw}` })}
                  className="rounded-[18px] bg-canvas border border-line hover:border-brand/50 flex flex-col items-start justify-center gap-2 px-6 text-left transition-colors">
                  <Clock size={40} className="text-brand" />
                  <span className="text-card-label">{en}</span>
                  <span className="text-card-sw text-slate">{sw}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-full bg-mint text-brand grid place-items-center"><CheckCircle size={40} /></span>
              <div><p className="font-display font-extrabold text-[30px] tracking-[-0.02em]">You're checked in</p><p className="text-[20px] text-slate">Umesajiliwa. Tafadhali keti.</p></div>
            </div>
            <button onClick={() => setPhase('summary')} className="h-20 px-10 rounded-full bg-navy text-canvas font-bold text-[24px] flex items-center gap-3">
              Finish visit · Maliza <ArrowRight size={28} />
            </button>
          </div>
        )}
      </section>

      <StatusStrip state={status} onToggle={() => setStatus((s) => (s === 'paused' ? 'listening' : 'paused'))}
        onInterpreter={() => setInterp(interp === 'requested' ? 'requested' : 'open')} interpreter={interp === 'requested'} />
      {interp === 'open' && <InterpreterSheet onClose={() => setInterp('none')} onConfirm={() => setInterp('requested')} />}
      {status === 'paused' && (
        <button onClick={() => setStatus('listening')} className="absolute inset-x-0 top-16 bottom-10 bg-navy/30 backdrop-blur-sm grid place-items-center">
          <span className="rounded-[24px] bg-canvas/85 backdrop-blur-xl border border-canvas px-10 py-8 flex flex-col items-center gap-2">
            <span className="w-6 h-6 bg-navy" />
            <span className="font-display font-extrabold text-[32px]">Paused · Imesimamishwa</span>
            <span className="text-[20px] text-slate">Tap anywhere to continue</span>
          </span>
        </button>
      )}
    </div>
  )
}

function InterpreterSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <div className="absolute inset-0 z-20 bg-navy/40 backdrop-blur-md grid place-items-center">
      <div role="dialog" aria-modal className="w-[640px] rounded-[28px] bg-canvas/90 backdrop-blur-xl border border-canvas p-10 flex flex-col gap-6">
        <span className={`w-16 h-16 rounded-full grid place-items-center ${sent ? 'bg-mint text-brand' : 'bg-sky text-navy'}`}>{sent ? <CheckCircle size={40} /> : <HandWaving size={40} />}</span>
        {sent ? (
          <>
            <h2 className="font-display font-extrabold text-[36px] leading-tight tracking-[-0.02em]">An interpreter is on the way.</h2>
            <p className="text-[22px] leading-8 text-slate">Mkalimani anakuja. The nurse has been told. You can keep using this screen while you wait.</p>
            <button onClick={onClose} className="h-16 rounded-full bg-brand text-canvas font-bold text-[22px]">Keep using the screen</button>
          </>
        ) : (
          <>
            <h2 className="font-display font-extrabold text-[36px] leading-tight tracking-[-0.02em]">Ask for a sign language interpreter?</h2>
            <p className="text-[22px] leading-8 text-slate">Omba mkalimani wa lugha ya ishara? We will tell the nurse straight away.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onClose} className="h-16 rounded-full bg-canvas border border-line font-bold text-[22px]">Not now · Sasa hapana</button>
              <button onClick={() => { setSent(true); onConfirm() }} className="h-16 rounded-full bg-brand text-canvas font-bold text-[22px]">Yes, ask · Ndiyo</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Summary({ visit, onReset }: { visit: Visit; onReset: () => void }) {
  const [left, setLeft] = useState(30)
  const [hold, setHold] = useState(false)
  useEffect(() => {
    if (hold) return
    if (left <= 0) { onReset(); return }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [left, hold, onReset])
  const rows: [Icon, string, string][] = [
    [UserCircle, 'Name', visit.name || 'Not given'],
    [Heartbeat, 'Reason', visit.symptom ? visit.symptom.join(' · ') : 'Not given'],
    [MapPin, 'Where it hurts', visit.places.length ? visit.places.join(', ') : 'Not given'],
    [Clock, 'How long', visit.duration ?? 'Not given'],
  ]
  return (
    <div className="w-[1280px] h-[800px] bg-canvas text-navy flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 grid grid-cols-12 gap-6 px-12 py-10">
        <section className="col-span-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label text-slate">For the nurse · Kwa muuguzi</p>
              <h1 className="font-display font-extrabold text-[40px] tracking-[-0.02em]">Visit summary</h1>
            </div>
            {visit.urgent && <span className="h-12 px-5 rounded-full bg-amber font-bold text-[18px] flex items-center gap-2"><Warning size={24} weight="fill" />Urgent: see a doctor now</span>}
          </div>
          <ul className="rounded-[24px] border border-line divide-y divide-line">
            {rows.map(([I, k, v]) => (
              <li key={k} className="px-6 py-5 flex items-center gap-5">
                <span className="w-12 h-12 rounded-[14px] bg-mint text-brand grid place-items-center shrink-0"><I size={28} /></span>
                <span className="w-[200px] text-[18px] text-slate">{k}</span>
                <span className="text-[24px] font-bold">{v}</span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="col-span-4 rounded-[24px] bg-sky p-8 flex flex-col gap-5">
          <span className="w-14 h-14 rounded-full bg-canvas text-brand grid place-items-center"><ShieldCheck size={32} /></span>
          <h2 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.02em]">This screen clears itself for privacy.</h2>
          <p className="text-[18px] leading-7 text-slate">Skrini hii itafutika yenyewe. Nothing is kept on the tablet after the visit.</p>
          <div className="flex items-baseline gap-2"><span className="font-display font-extrabold text-[64px] leading-none tabular-nums">{left}</span><span className="text-[18px] text-slate">{hold ? 'paused' : 'seconds'}</span></div>
          <div className="h-2 rounded-full bg-canvas overflow-hidden"><div className="h-full bg-brand transition-[width] duration-1000 ease-linear" style={{ width: `${(left / 30) * 100}%` }} /></div>
          <div className="mt-auto flex flex-col gap-3">
            <button onClick={onReset} className="h-16 rounded-full bg-navy text-canvas font-bold text-[20px] flex items-center justify-center gap-2"><ArrowCounterClockwise size={22} />Clear now and start new visit</button>
            <button onClick={() => setHold((h) => !h)} className="h-14 rounded-full bg-canvas border border-line font-bold text-[18px]">{hold ? 'Resume countdown' : 'Keep on screen'}</button>
          </div>
        </aside>
      </main>
    </div>
  )
}

/* ---------- Prototype shell ---------- */
export default function KioskPrototype() {
  const [scale, setScale] = useState(1)
  const [label, setLabel] = useState('Welcome')
  const [key, setKey] = useState(0)
  useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - 48) / 1280, (window.innerHeight - 112) / 800, 1))
    fit(); window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className="min-h-screen bg-navy text-canvas flex flex-col">
      <div className="h-16 px-6 flex items-center justify-between border-b border-canvas/10">
        <a href="#/" className="h-11 px-4 rounded-full bg-canvas/10 hover:bg-canvas/15 flex items-center gap-2 font-bold"><ArrowLeft size={18} />Back to website</a>
        <div className="flex items-center gap-3 text-[15px]">
          <span className="text-canvas/60">Prototype · Sample conversation</span>
          <span className="h-9 px-4 rounded-full bg-canvas/10 font-bold flex items-center">{label}</span>
        </div>
        <button onClick={() => setKey((k) => k + 1)} className="h-11 px-4 rounded-full bg-canvas/10 hover:bg-canvas/15 flex items-center gap-2 font-bold"><ArrowCounterClockwise size={18} />Restart</button>
      </div>
      <div className="flex-1 grid place-items-center p-6">
        <div className="rounded-[32px] bg-[#06182b] p-4" style={{ width: 1280 * scale + 32, height: 800 * scale + 32 }}>
          <div className="relative overflow-hidden rounded-[18px]" style={{ width: 1280 * scale, height: 800 * scale }}>
            <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
              <Screen key={key} onStep={setLabel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
