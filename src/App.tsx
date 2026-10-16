import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight, Phone, EnvelopeSimple, Check, Plus, Minus, Quotes, Heartbeat, FirstAid,
  ChatText, HandTap, ClipboardText, UserCircle, FirstAidKit, Buildings, Eye, Lock, Translate,
  Ambulance, Baby, Pill, Stethoscope, HandWaving, ShieldCheck,
} from '@phosphor-icons/react'
import Kiosk from './Kiosk'

const u = (id: string, w = 1400) => `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${w}`
const IMG = {
  hero: u('1631558554184-319c88f4f8a4', 1600),
  doctor: u('1678695972687-033fa0bdbac9', 900),
  nurse: u('1643297654416-05795d62e39c', 900),
  child: u('1536064479547-7ee40b74b807'),
  desk: u('1739285388427-d6f85d12a8fc'),
  waiting: u('1758654860024-9e352f70d1f9'),
  tablet: u('1758691462353-36b215702253'),
  writing: u('1758691461990-03b49d969495'),
  frustrated: u('1667581278300-a4035a2a5cd8', 900),
  reception: u('1764727291644-5dcb0b1a0375', 1600),
  elder: u('1692160756327-f0481e950b28', 900),
  bedside: u('1765222385397-6c2ea556086f'),
  gesture: u('1758599543122-fc551c9b4b1c'),
  signing: u('1737567425973-bf7b6369d08a', 1600),
}

function ScaledKiosk() {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1280))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="rounded-[28px] bg-navy p-3 md:p-4">
      <div ref={ref} className="relative w-full overflow-hidden rounded-[16px] bg-paper" style={{ height: 800 * scale }}>
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: 1280, height: 800, transform: `scale(${scale})` }}>
          <Kiosk />
        </div>
      </div>
    </div>
  )
}

const Wrap = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`max-w-[1200px] mx-auto px-6 ${className}`}>{children}</div>
)
const Eyebrow = ({ children, light }: { children: string; light?: boolean }) => (
  <p className={`inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] ${light ? 'text-mint' : 'text-brand'}`}>
    {children}
  </p>
)
const H2 = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={`font-display font-extrabold text-[34px] md:text-[46px] leading-[1.08] tracking-[-0.025em] ${className}`}>{children}</h2>
)
const Photo = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} loading="lazy" className={`w-full object-cover rounded-[20px] bg-sky ${className}`} />
)
const Btn = ({ href, children, variant = 'solid' }: { href: string; children: ReactNode; variant?: 'solid' | 'ghost' | 'light' }) => {
  const v = {
    solid: 'bg-brand text-canvas hover:bg-brand-dark',
    ghost: 'border border-navy/20 text-navy hover:border-navy hover:bg-canvas',
    light: 'bg-canvas text-navy hover:bg-mint',
  }[variant]
  return <a href={href} className={`h-14 px-6 inline-flex items-center gap-2 rounded-full font-bold text-[17px] transition-colors ${v}`}>{children}</a>
}
/* Medical cross mark */
const Cross = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" /></svg>
)

const FAQS = [
  ['Does the patient need to download anything?', 'No. The tablet sits at the reception desk. The patient simply reads the screen and taps their answer.'],
  ['Which languages does it support?', 'English and Kiswahili on screen, with short Kenyan Sign Language clips on each answer card.'],
  ['What happens to the conversation afterwards?', 'The conversation is cleared from the tablet when the visit ends. Nothing is kept unless the patient agrees.'],
  ['Does it replace a sign language interpreter?', 'No. It helps with everyday front-desk questions. A button on screen lets the patient ask for an interpreter at any time.'],
  ['How long does it take staff to learn?', 'Most reception teams are comfortable within one short session. The nurse simply speaks as they normally would.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <ul className="flex flex-col gap-3">
      {FAQS.map(([q, a], i) => {
        const isOpen = open === i
        return (
          <li key={q} className={`rounded-[16px] border transition-colors ${isOpen ? 'bg-canvas border-brand/40' : 'bg-canvas border-line'}`}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
              className="w-full min-h-16 px-6 py-4 flex items-center justify-between gap-6 text-left font-bold text-[18px] text-navy">
              {q}
              <span className={`w-9 h-9 shrink-0 rounded-full grid place-items-center ${isOpen ? 'bg-brand text-canvas' : 'bg-sky text-navy'}`}>
                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
              </span>
            </button>
            {isOpen && <p className="px-6 pb-6 pr-16 text-[17px] leading-7 text-slate">{a}</p>}
          </li>
        )
      })}
    </ul>
  )
}

export default function App() {
  return (
    <div className="bg-canvas text-navy antialiased">
      {/* Utility bar */}
      <div className="bg-navy text-canvas/90 text-[14px]">
        <Wrap className="h-10 flex items-center justify-between">
          <span className="flex items-center gap-2"><Cross className="w-3 h-3 text-alert" />Built for Kenyan hospitals and clinics</span>
          <span className="hidden sm:flex items-center gap-6">
            <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-canvas"><Phone size={16} />+254 700 000 000</a>
            <a href="mailto:hello@clearcaption.co.ke" className="flex items-center gap-2 hover:text-canvas"><EnvelopeSimple size={16} />hello@clearcaption.co.ke</a>
          </span>
        </Wrap>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-line">
        <Wrap className="h-[76px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 font-display font-extrabold text-[22px] tracking-[-0.02em]">
            <span className="w-9 h-9 rounded-[10px] bg-brand text-canvas grid place-items-center"><Cross className="w-4 h-4" /></span>
            ClearCaption
          </a>
          <div className="hidden lg:flex items-center gap-1 text-[16px] font-bold text-slate">
            {[['How it works', '#how'], ['See the screen', '#screen'], ['Who it helps', '#who'], ['Questions', '#faq']].map(([l, h]) => (
              <a key={h} href={h} className="px-4 py-2 rounded-full hover:bg-sky hover:text-navy transition-colors">{l}</a>
            ))}
          </div>
          <a href="#contact" className="h-12 px-5 inline-flex items-center gap-2 rounded-full bg-navy text-canvas font-bold hover:bg-brand transition-colors">
            Request a visit <ArrowRight size={18} />
          </a>
        </Wrap>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <Wrap className="pt-14 md:pt-20 pb-16 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col gap-7">
            <span className="self-start inline-flex items-center gap-2 h-9 pl-2 pr-4 rounded-full bg-mint text-brand-dark text-[14px] font-bold">
              <span className="w-6 h-6 rounded-full bg-brand text-canvas grid place-items-center"><HandWaving size={14} /></span>
              For Deaf and hard-of-hearing patients
            </span>
            <h1 className="font-display font-extrabold text-[46px] md:text-[66px] leading-[1.02] tracking-[-0.035em]">
              Every patient <span className="text-brand">understood</span>, from the first question.
            </h1>
            <p className="text-[20px] leading-8 text-slate max-w-[540px]">
              ClearCaption is a tablet for hospital reception desks. The nurse speaks and their words appear in large text.
              The patient replies by tapping simple cards in English and Kiswahili.
            </p>
            <div className="flex flex-wrap gap-3">
              <Btn href="#contact">Bring it to your hospital <ArrowRight size={18} /></Btn>
              <Btn href="#/kiosk" variant="ghost">Try the kiosk</Btn>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-line">
              {[[Translate, 'English and Kiswahili'], [HandWaving, 'Sign language clips'], [Stethoscope, 'Interpreter on request']].map(([I, t]) => {
                const Icon = I as typeof Translate
                return <span key={t as string} className="flex items-center gap-2 text-[15px] font-bold"><Icon size={20} className="text-brand" />{t as string}</span>
              })}
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 md:-inset-6 rounded-[32px] bg-mint" aria-hidden />
            <div className="relative grid grid-cols-5 gap-3">
              <Photo src={IMG.hero} alt="A clinician listening closely to a patient" className="col-span-3 h-[500px]" />
              <div className="col-span-2 flex flex-col gap-3">
                <Photo src={IMG.nurse} alt="A nurse holding a stethoscope" className="h-[244px]" />
                <Photo src={IMG.doctor} alt="A smiling doctor" className="h-[244px]" />
              </div>
            </div>
            {/* Floating conversation */}
            <div className="absolute -left-2 md:-left-10 bottom-24 w-[300px] rounded-[18px] bg-canvas/70 backdrop-blur-xl border border-canvas/60 p-4 flex flex-col gap-2">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-slate">
                <span className="w-2 h-2 rounded-full bg-brand" />Nurse is speaking
              </span>
              <p className="font-bold text-[18px] leading-6">Can you show me where it hurts?<span className="caret inline-block w-[3px] h-5 bg-brand ml-1 align-[-3px]" /></p>
            </div>
            <div className="absolute right-3 -bottom-4 rounded-[18px] bg-navy/80 backdrop-blur-xl border border-canvas/15 text-canvas px-4 py-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-canvas/10 grid place-items-center"><Heartbeat size={24} /></span>
              <span className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-canvas/70">Patient replied</span>
                <span className="font-bold text-[16px]">Chest Pain · Maumivu ya Kifua</span>
              </span>
            </div>
          </div>
        </Wrap>
      </header>

      {/* Departments */}
      <section className="border-y border-line bg-sky/60">
        <Wrap className="py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
          <span className="text-[14px] font-bold text-slate shrink-0">Made for every front desk</span>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[[FirstAid, 'Outpatient'], [Ambulance, 'Emergency'], [Baby, 'Maternity'], [Pill, 'Pharmacy'], [Buildings, 'Main reception']].map(([I, t]) => {
              const Icon = I as typeof Pill
              return <span key={t as string} className="flex items-center gap-2 text-[16px] font-bold text-navy"><Icon size={22} className="text-brand" />{t as string}</span>
            })}
          </div>
        </Wrap>
      </section>

      {/* Problem */}
      <section>
        <Wrap className="py-24 flex flex-col gap-12">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <Eyebrow>The problem today</Eyebrow>
              <H2>At a busy desk, a Deaf patient is often left guessing.</H2>
            </div>
            <p className="lg:col-span-5 text-[18px] leading-8 text-slate">
              Name, symptoms and urgency are all decided in the first few minutes. When speech is the only way in, those minutes go wrong.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              [IMG.writing, 'Notes on scraps of paper', 'Staff write questions by hand. Answers are short, slow and easy to misread.'],
              [IMG.frustrated, 'Guessing what was said', 'Lip-reading through a mask or across a counter means key words are missed.'],
              [IMG.reception, 'Waiting for an interpreter', 'Sign language interpreters are rare at the desk, so patients wait, or go without.'],
            ].map(([img, t, d], i) => (
              <figure key={t} className="relative h-[440px] rounded-[24px] overflow-hidden">
                <img src={img} alt={t} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-navy/25" />
                <figcaption className="absolute left-4 right-4 bottom-4 rounded-[18px] bg-navy/55 backdrop-blur-xl border border-canvas/15 text-canvas p-5 flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-mint">0{i + 1}</span>
                  <span className="font-display font-bold text-[21px] tracking-[-0.01em]">{t}</span>
                  <span className="text-[15px] leading-6 text-canvas/80">{d}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Wrap>
      </section>

      {/* How it works */}
      <section id="how" className="bg-sky">
        <Wrap className="py-24 flex flex-col gap-14">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <Eyebrow>How it works</Eyebrow>
              <H2>Three steps. No training manual.</H2>
            </div>
            <p className="lg:col-span-5 text-[18px] leading-8 text-slate">The nurse talks as they always do. The screen takes care of the rest.</p>
          </div>
          <ol className="grid md:grid-cols-3 gap-6">
            {[
              [IMG.desk, ChatText, 'The nurse speaks', 'Their words appear on the tablet in large, easy-to-read text as they talk.'],
              [IMG.gesture, HandTap, 'The patient answers', 'They tap a card such as "Chest Pain", or type a short reply. Each card has a sign language clip.'],
              [IMG.tablet, ClipboardText, 'Both see the same screen', 'Every question and answer stays on screen like a text conversation, so nothing is missed.'],
            ].map(([img, I, t, d], i) => {
              const Icon = I as typeof ChatText
              return (
                <li key={i} className="flex flex-col rounded-[20px] bg-canvas border border-line overflow-hidden">
                  <div className="relative">
                    <img src={img as string} alt="" loading="lazy" className="h-[230px] w-full object-cover" />
                    <span className="absolute top-4 left-4 h-9 px-3 rounded-full bg-canvas/75 backdrop-blur-md text-navy font-display font-extrabold text-[14px] grid place-items-center">Step {i + 1}</span>
                  </div>
                  <div className="p-7 flex flex-col gap-3">
                    <Icon size={32} className="text-brand" />
                    <h3 className="font-display font-bold text-[22px] tracking-[-0.01em]">{t as string}</h3>
                    <p className="text-[16px] leading-7 text-slate">{d as string}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Wrap>
      </section>

      {/* Screen */}
      <section id="screen" className="relative overflow-hidden bg-navy text-canvas">
        <img src={IMG.reception} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-navy/70" />
        <Wrap className="relative py-24 flex flex-col gap-12">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <Eyebrow light>See the screen</Eyebrow>
              <H2>It reads like a text conversation.</H2>
            </div>
            <p className="lg:col-span-5 text-[18px] leading-8 text-canvas/75">
              The nurse's words on the left. The patient's answers on the right. Answer cards at the bottom, where a keyboard would be.
            </p>
          </div>

          <div className="relative">
            <ScaledKiosk />
            {/* Callouts */}
            <div className="hidden xl:flex absolute -left-6 top-[30%] -translate-x-full w-[220px] flex-col gap-2 rounded-[18px] bg-canvas/10 backdrop-blur-xl border border-canvas/20 p-4">
              <span className="text-[13px] font-bold text-mint">Nurse, live</span>
              <span className="text-[15px] leading-6">Words appear as they are spoken, in large type.</span>
            </div>
            <div className="hidden xl:flex absolute -right-6 top-[40%] translate-x-full w-[220px] flex-col gap-2 rounded-[18px] bg-canvas/10 backdrop-blur-xl border border-canvas/20 p-4">
              <span className="text-[13px] font-bold text-mint">Patient reply</span>
              <span className="text-[15px] leading-6">Answers show on the right, so both sides can follow.</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              [Eye, 'Large, clear text', 'A typeface made for low vision, in three sizes.'],
              [Translate, 'Two languages', 'Every card in English and Kiswahili.'],
              [HandTap, 'Big, easy buttons', 'Simple to tap, even for tired hands.'],
              [Lock, 'Private by default', 'Cleared when the visit ends.'],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Eye
              return (
                <div key={t as string} className="rounded-[18px] bg-canvas/[0.07] backdrop-blur-xl border border-canvas/15 p-6 flex flex-col gap-3">
                  <span className="w-11 h-11 rounded-[12px] bg-mint/15 text-mint grid place-items-center"><Icon size={24} /></span>
                  <p className="font-bold text-[17px]">{t as string}</p>
                  <p className="text-[15px] leading-6 text-canvas/70">{d as string}</p>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[14px] text-canvas/60">Tap any answer card above, or walk through a full visit.</p>
            <Btn href="#/kiosk" variant="light">Try the full visit <ArrowRight size={18} /></Btn>
          </div>
        </Wrap>
      </section>

      {/* Who it helps */}
      <section id="who">
        <Wrap className="py-24 flex flex-col gap-14">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <Eyebrow>Who it helps</Eyebrow>
              <H2>Better for patients. Easier for staff.</H2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              [IMG.elder, UserCircle, 'Patients and families', 'Understand every question, answer in their own language, and ask for an interpreter whenever they need one.'],
              [IMG.bedside, FirstAidKit, 'Nurses and reception staff', 'Speak naturally and see the answer straight away. Less guessing, less paper, shorter queues.'],
              [IMG.reception, ShieldCheck, 'Hospital leaders', 'Offer equal access to care at every desk, and show a real commitment to Deaf patients.'],
            ].map(([img, I, t, d]) => {
              const Icon = I as typeof UserCircle
              return (
                <article key={t as string} className="group rounded-[20px] border border-line bg-canvas p-3 flex flex-col">
                  <Photo src={img as string} alt="" className="h-[280px] rounded-[14px]" />
                  <div className="p-4 pt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-mint text-brand grid place-items-center"><Icon size={22} /></span>
                      <h3 className="font-display font-bold text-[21px] tracking-[-0.01em]">{t as string}</h3>
                    </div>
                    <p className="text-[16px] leading-7 text-slate">{d as string}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </Wrap>
      </section>

      {/* Community */}
      <section>
        <Wrap className="pb-8">
          <div className="relative h-[360px] rounded-[28px] overflow-hidden">
            <img src={IMG.signing} alt="A group of people raising their hands, a common sign for applause in Deaf culture" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-navy/45" />
            <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10 max-w-[520px] rounded-[20px] bg-canvas/12 backdrop-blur-xl border border-canvas/25 text-canvas p-6 flex flex-col gap-2">
              <span className="font-display font-extrabold text-[26px] leading-[1.2] tracking-[-0.015em]">Shaped with the Deaf community, not just for it.</span>
              <span className="text-[16px] leading-6 text-canvas/80">Answer cards, wording and sign language clips are reviewed by Deaf patients before they reach a desk.</span>
            </div>
          </div>
        </Wrap>
      </section>

      {/* Testimonial */}
      <section>
        <Wrap className="py-16">
          <div className="rounded-[28px] bg-brand text-canvas overflow-hidden grid lg:grid-cols-12">
            <img src={IMG.doctor} alt="Portrait of a clinician" loading="lazy" className="lg:col-span-4 h-[320px] lg:h-full w-full object-cover" />
            <figure className="lg:col-span-8 p-10 md:p-14 flex flex-col gap-6 relative">
              <Quotes size={44} weight="fill" className="text-mint" />
              <blockquote className="font-display font-bold text-[26px] md:text-[32px] leading-[1.3] tracking-[-0.015em]">
                "For the first time, I could ask a Deaf patient a follow-up question and know they understood me, without waiting an hour for an interpreter."
              </blockquote>
              <figcaption className="text-[16px] text-canvas/80">Reception nurse, pilot hospital, Nairobi <span className="text-canvas/60">(sample quote)</span></figcaption>
            </figure>
          </div>
        </Wrap>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-sky">
        <Wrap className="py-24 grid lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Eyebrow>Questions</Eyebrow>
            <H2>Common questions</H2>
            <p className="text-[17px] leading-7 text-slate">Can't find what you need? <a href="#contact" className="text-brand font-bold underline underline-offset-4">Talk to our team.</a></p>
          </div>
          <div className="lg:col-span-8"><Faq /></div>
        </Wrap>
      </section>

      {/* Contact */}
      <section id="contact">
        <Wrap className="py-24 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Eyebrow>Get started</Eyebrow>
            <H2>Bring ClearCaption to your reception desk.</H2>
            <ul className="flex flex-col gap-4 text-[17px]">
              {['We set up the tablet and stand for you', 'Your staff are shown how to use it on day one', 'Shaped with Deaf patients and community groups'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-mint text-brand grid place-items-center"><Check size={16} weight="bold" /></span>{t}
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="lg:col-span-6 lg:col-start-7 rounded-[24px] bg-canvas border border-line p-6 md:p-9 grid sm:grid-cols-2 gap-5">
            <p className="sm:col-span-2 font-display font-bold text-[22px]">Request a visit</p>
            {[['Your name', 'text'], ['Hospital or clinic', 'text'], ['Work email', 'email'], ['Phone number', 'tel']].map(([l, t]) => (
              <label key={l} className="flex flex-col gap-2 text-[14px] font-bold text-slate">
                {l}
                <input type={t} required className="h-14 px-4 bg-canvas border border-line rounded-[12px] font-normal text-[17px] text-navy outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
              </label>
            ))}
            <label className="sm:col-span-2 flex flex-col gap-2 text-[14px] font-bold text-slate">
              How many reception desks?
              <select className="h-14 px-4 bg-canvas border border-line rounded-[12px] font-normal text-[17px] text-navy outline-none focus:border-brand focus:ring-4 focus:ring-brand/15">
                <option>1 desk</option><option>2 to 5 desks</option><option>More than 5</option>
              </select>
            </label>
            <button className="sm:col-span-2 h-14 rounded-full bg-brand hover:bg-brand-dark text-canvas font-bold text-[17px] flex items-center justify-center gap-2 transition-colors">
              Send request <ArrowRight size={18} />
            </button>
            <p className="sm:col-span-2 text-[13px] text-slate">We'll reply within two working days.</p>
          </form>
        </Wrap>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-canvas">
        <Wrap className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-[15px]">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-display font-extrabold text-[20px]">
              <span className="w-8 h-8 rounded-[9px] bg-brand grid place-items-center"><Cross className="w-3.5 h-3.5" /></span>ClearCaption
            </span>
            <p className="text-canvas/65 leading-6">Clear conversations for Deaf and hard-of-hearing patients at the hospital front desk.</p>
          </div>
          {[
            ['Learn', ['How it works', 'See the screen', 'Who it helps']],
            ['Support', ['Common questions', 'Request a visit', 'Accessibility statement']],
            ['Contact', ['Nairobi, Kenya', '+254 700 000 000', 'hello@clearcaption.co.ke']],
          ].map(([h, items]) => (
            <div key={h as string} className="flex flex-col gap-3">
              <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-canvas/50">{h as string}</span>
              {(items as string[]).map((i) => <span key={i} className="text-canvas/85">{i}</span>)}
            </div>
          ))}
        </Wrap>
        <div className="border-t border-canvas/10">
          <Wrap className="py-5 flex justify-between text-[13px] text-canvas/55"><span>© 2025 ClearCaption</span><span>Privacy · Terms</span></Wrap>
        </div>
      </footer>
    </div>
  )
}
