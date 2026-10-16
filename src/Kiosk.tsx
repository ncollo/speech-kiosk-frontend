import { useState } from 'react'
import {
  Heartbeat, Wind, SmileyNervous, Spiral, Brain, Thermometer, FirstAid, HandPalm, BatteryLow, ChatCircleDots, Play, Keyboard, Heart,
  type Icon,
} from '@phosphor-icons/react'

const C = { ink: '#123336', paper: '#FAF8F3', teal: '#1B4B4F' }

/* ---------- Header ---------- */
export type Lang = 'EN' | 'SW'
export function Header(props: { lang?: Lang; setLang?: (l: Lang) => void; size?: number; setSize?: (n: number) => void; desk?: string }) {
  const [langLocal, setLangLocal] = useState<Lang>('EN')
  const [sizeLocal, setSizeLocal] = useState(1)
  const lang = props.lang ?? langLocal
  const setLang = props.setLang ?? setLangLocal
  const size = props.size ?? sizeLocal
  const setSize = props.setSize ?? setSizeLocal
  return (
    <header data-layer="kiosk/header" className="h-16 shrink-0 flex items-center justify-between px-12 bg-canvas/80 backdrop-blur-md border-b border-line">
      <div className="flex-1 flex items-center gap-2.5 font-display font-extrabold text-[24px] leading-8 tracking-[-0.02em]"><span className="w-9 h-9 rounded-[10px] bg-brand text-canvas grid place-items-center"><svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" /></svg></span>ClearCaption</div>
      <div className="flex-1 flex justify-center"><span className="h-10 px-4 rounded-full bg-sky text-[18px] text-navy inline-flex items-center">{props.desk ?? 'Desk 3 · Outpatient reception'}</span></div>
      <div className="flex-1 flex justify-end items-center gap-2">
        <div data-layer="kiosk/header/lang" className="flex items-center p-1 rounded-full bg-sky">
          {(['EN', 'SW'] as const).map((l) => (
            <div key={l} className="flex items-center">
                            <button onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`min-w-14 h-12 px-3 rounded-full text-[18px] font-bold transition-colors ${lang === l ? 'bg-navy text-canvas' : 'text-slate'}`}>{l}</button>
            </div>
          ))}
        </div>
        
        <div data-layer="kiosk/header/text-size" className="flex items-center p-1 rounded-full bg-sky">
          {[16, 20, 26].map((px, i) => (
            <button key={px} onClick={() => setSize(i)} aria-label={`Text size ${i + 1}`} aria-pressed={size === i}
              className={`w-14 h-12 flex items-end justify-center pb-3 font-bold leading-none rounded-full transition-colors ${size === i ? 'bg-navy text-canvas' : 'text-slate'}`}
              style={{ fontSize: px }}>A</button>
          ))}
        </div>
      </div>
    </header>
  )
}

/* ---------- Turns ---------- */
export function TurnNurse({ text, variant = 'default' }: { text: string; variant?: 'default' | 'live' }) {
  const live = variant === 'live'
  return (
    <div data-layer={`kiosk/nurse/turn-nurse${live ? '-live' : ''}`} className={`flex flex-col gap-1 items-start ${live ? '' : 'opacity-70'}`}>
      <span className="text-label text-slate flex items-center gap-2">{live && <span className="w-2 h-2 rounded-full bg-brand" />}Nurse{live && <span className="text-brand">· speaking</span>}</span>
      <div className={`bg-mint text-navy rounded-[16px] rounded-tl-[4px] max-w-[781px] ${live ? 'px-7 py-5 text-caption border border-brand/25' : 'px-5 py-2.5 text-older'}`}>
        {text}
        {live && <span aria-hidden className="caret inline-block w-1 h-10 bg-brand rounded-full ml-2 align-[-8px]" />}
      </div>
    </div>
  )
}

export function TurnPatient({ text, icon: I, older = true }: { text: string; icon?: Icon; older?: boolean }) {
  return (
    <div data-layer={`kiosk/patient/turn-patient-${I ? 'card' : 'typed'}`} className={`flex flex-col gap-1 items-end ${older ? 'opacity-70' : ''}`}>
      <span className="text-label text-slate">You</span>
      <div className={`bg-navy text-canvas rounded-[16px] rounded-tr-[4px] max-w-[568px] flex items-center gap-3 ${older ? 'px-4 py-2 text-older font-bold' : 'px-6 py-4 text-patient'}`}>
        {I && <I size={older ? 32 : 40} weight="regular" />}
        <span>{text}</span>
      </div>
    </div>
  )
}

/* ---------- Tray ---------- */
export function TrayLabel() {
  return <span data-layer="kiosk/tray/label" className="text-label text-slate">Tap to answer · Gonga kujibu</span>
}

type CardState = 'default' | 'pressed' | 'selected'
export function SymptomCard({ en, sw, icon: I, state, onSelect }: { en: string; sw: string; icon: Icon; state: CardState; onSelect: () => void }) {
  const [down, setDown] = useState(false)
  const s: CardState = state === 'selected' ? 'selected' : down ? 'pressed' : state
  const sel = s === 'selected'
  return (
    <button data-layer={`kiosk/tray/symptom-card-${s}`} aria-pressed={sel} onClick={onSelect}
      onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      className={`relative w-[224px] h-[88px] flex items-center gap-3 pl-4 pr-3 text-left border rounded-[14px] overflow-hidden transition-colors ${sel ? 'bg-brand border-brand text-canvas' : 'bg-canvas/85 backdrop-blur-sm border-line text-navy hover:border-brand/50'}`}
      style={s === 'pressed' ? { outline: `2px solid ${C.ink}`, outlineOffset: -6, borderRadius: 14 } : undefined}>
      <I size={40} weight="regular" className={`shrink-0 ${sel ? '' : 'text-brand'}`} />
      <span className="flex flex-col min-w-0 pr-8">
        <span className="text-card-label">{en}</span>
        <span className="text-card-sw">{sw}</span>
      </span>
      <span className={`absolute top-1.5 right-1.5 h-6 px-1.5 flex items-center gap-1 rounded-full text-[11px] font-bold ${sel ? 'bg-canvas/20' : 'bg-sky text-navy'}`}>
        <Play size={8} weight="fill" />KSL
      </span>
      {sel && <span aria-hidden className="absolute left-3 right-3 bottom-0 h-1.5 rounded-t-full bg-amber" />}
    </button>
  )
}

export const CARDS: [string, string, Icon][] = [
  ['Chest Pain', 'Maumivu ya Kifua', Heartbeat],
  ['Shortness of Breath', 'Pumzi Fupi', Wind],
  ['Nausea or Vomiting', 'Kichefuchefu', SmileyNervous],
  ['Dizziness', 'Kizunguzungu', Spiral],
  ['Headache', 'Kuumwa na Kichwa', Brain],
  ['Fever or Chills', 'Homa', Thermometer],
  ['Abdominal Pain', 'Maumivu ya Tumbo', FirstAid],
  ['Swelling', 'Kuvimba Mwili', HandPalm],
  ['Fatigue', 'Uchovu Mkubwa', BatteryLow],
  ['Other Concern', 'Shida Nyingine', ChatCircleDots],
]

/* ---------- Status ---------- */
export type StatusState = 'listening' | 'paused' | 'lost'
export function StatusStrip({ state, onToggle, onInterpreter, interpreter }: { state: StatusState; onToggle?: () => void; onInterpreter?: () => void; interpreter?: boolean }) {
  const label = { listening: 'Listening · Session active', paused: 'Paused · Tap to resume', lost: 'Connection lost · Reconnecting' }[state]
  return (
    <footer data-layer={`kiosk/status/status-strip-${state}`} className="h-10 shrink-0 bg-navy text-canvas flex items-center justify-between px-12 text-[16px]">
      <button type="button" onClick={onToggle} className="h-10 flex items-center gap-3">
        {state === 'listening' && <span className="w-3 h-3 rounded-full bg-mint" />}
        {state === 'paused' && <span className="w-3 h-3 bg-canvas" />}
        {state === 'lost' && <span className="w-0 h-0 border-x-[7px] border-x-transparent border-b-[12px] border-b-canvas" />}
        <span>{label}</span>
        {state === 'listening' && (
          <span aria-hidden className="flex items-end gap-1 h-4 ml-1">
            {[8, 16, 11].map((h, i) => <span key={i} className="w-1 rounded-full bg-mint" style={{ height: h }} />)}
          </span>
        )}
      </button>
      <button type="button" onClick={onInterpreter} className={`h-8 px-4 rounded-full font-bold ${interpreter ? 'bg-amber text-navy' : 'bg-canvas/10 hover:bg-canvas/20'}`}>
        {interpreter ? 'Interpreter requested' : 'Ask for an interpreter'}
      </button>
    </footer>
  )
}


export default function Kiosk() {
  const [selected, setSelected] = useState(0)
  return (
    <>
      <div data-layer="kiosk" className="w-[1280px] h-[800px] bg-canvas text-navy flex flex-col overflow-hidden">
        <Header />
        <main data-layer="kiosk/thread" className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end gap-3 px-12 py-4">
          <TurnNurse text="Good morning. Please tell me your name." />
          <TurnPatient text="Wanjiru" />
          <TurnNurse text="What brings you in today?" />
          <TurnPatient icon={Heart} text="Chest Pain · Maumivu ya Kifua" />
          <TurnNurse variant="live" text="Can you show me where it hurts?" />
        </main>
        <section data-layer="kiosk/tray" className="h-[272px] shrink-0 bg-sky border-t border-line px-12 py-2 flex flex-col gap-2">
          <div className="h-14 flex items-center justify-between">
            <TrayLabel />
            <button className="h-14 px-5 flex items-center gap-2 bg-canvas border border-line rounded-full text-card-label text-navy">
              <Keyboard size={28} weight="regular" />Type a reply
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {CARDS.map(([en, sw, I], i) => (
              <SymptomCard key={en} en={en} sw={sw} icon={I} state={i === selected ? 'selected' : 'default'} onSelect={() => setSelected(i)} />
            ))}
          </div>
        </section>
        <StatusStrip state="listening" />
      </div>
    </>
  )
}
