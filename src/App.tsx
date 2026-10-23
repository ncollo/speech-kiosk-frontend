import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight, ArrowUpRight, ArrowUp, ArrowDown, Star, Phone, EnvelopeSimple, HandWaving, Heartbeat, Plus, Minus,
  List, X, Lock, ShieldCheck,
} from '@phosphor-icons/react'
import Kiosk from './Kiosk'

const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=${w}`
const IMG = {
  hero: u('1631558554184-319c88f4f8a4', 2200),
  doctor: u('1678695972687-033fa0bdbac9', 900),
  nurse: u('1643297654416-05795d62e39c', 900),
  bedside: u('1765222385397-6c2ea556086f'),
  desk: u('1739285388427-d6f85d12a8fc'),
  tablet: u('1758691462353-36b215702253'),
  writing: u('1758691461990-03b49d969495'),
  frustrated: u('1667581278300-a4035a2a5cd8', 1000),
  reception: u('1764727291644-5dcb0b1a0375'),
  elder: u('1692160756327-f0481e950b28', 900),
  gesture: u('1758599543122-fc551c9b4b1c'),
  signing: u('1737567425973-bf7b6369d08a'),
}

const Wrap = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`max-w-[1240px] mx-auto px-6 ${className}`}>{children}</div>
)
const Tag = ({ children, dark }: { children: string; dark?: boolean }) => (
  <span className={`inline-flex h-8 px-4 items-center rounded-full border text-[13px] ${dark ? 'border-canvas/30 text-canvas' : 'border-navy/15 text-navy'}`}>{children}</span>
)
const PillBtn = ({ href, children, tone = 'light' }: { href: string; children: ReactNode; tone?: 'light' | 'dark' | 'accent' }) => {
  const c = { light: 'bg-canvas text-navy', dark: 'bg-navy text-canvas', accent: 'bg-accent text-canvas' }[tone]
  const dot = tone === 'accent' ? 'bg-canvas text-accent' : 'bg-accent text-canvas'
  return (
    <a href={href} className={`group inline-flex items-center gap-3 h-12 pl-5 pr-1.5 rounded-full text-[15px] font-medium ${c}`}>
      {children}
      <span className={`w-9 h-9 rounded-full grid place-items-center transition-transform group-hover:rotate-[-45deg] ${dot}`}><ArrowRight size={16} weight="bold" /></span>
    </a>
  )
}
const Ticks = () => <span aria-hidden className="flex-1 h-3 bg-[repeating-linear-gradient(90deg,rgb(11_37_64/0.18)_0_1px,transparent_1px_5px)]" />

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
    <div ref={ref} className="relative w-full overflow-hidden rounded-[20px] bg-canvas" style={{ height: 800 * scale }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: 1280, height: 800, transform: `scale(${scale})` }}><Kiosk /></div>
    </div>
  )
}

const QUOTES = [
  { q: 'For the first time I could ask a Deaf patient a follow-up question', rest: ' and know they understood me, without waiting an hour for an interpreter.', who: 'Reception nurse', role: 'Pilot hospital, Nairobi', img: IMG.nurse },
  { q: 'I did not have to write on paper or guess.', rest: ' I read what the nurse said and tapped my answer. It felt like my visit, not someone else’s.', who: 'Patient', role: 'Deaf community advisor', img: IMG.elder },
]

const FAQS = [
  ['Does the patient need to download anything?', 'No. The tablet sits at the reception desk. The patient reads the screen and taps their answer.'],
  ['Which languages does it support?', 'English and Kiswahili on screen, with short Kenyan Sign Language clips on each answer card.'],
  ['What happens to the conversation afterwards?', 'It is cleared from the tablet when the visit ends. Nothing is kept unless the patient agrees.'],
  ['Does it replace a sign language interpreter?', 'No. It helps with everyday front-desk questions. The patient can ask for an interpreter at any time.'],
]

export default function App() {
  const [qi, setQi] = useState(0)
  const [faq, setFaq] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const q = QUOTES[qi]
  return (
    <div className="bg-canvas text-navy font-ui antialiased scroll-smooth">
      {/* HERO */}
      <header id="home" className="p-3 md:p-4">
        <div className="relative h-[min(92vh,820px)] min-h-[640px] rounded-[28px] overflow-hidden">
          <img src={IMG.hero} alt="A clinician leaning in to listen to a patient" className="absolute inset-0 w-full h-full object-cover object-[70%_30%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_24_43/0.82)_0%,rgb(6_24_43/0.45)_45%,rgb(6_24_43/0.15)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgb(6_24_43/0.6),transparent)]" />

          {/* nav */}
          <nav className="relative z-20 flex items-center justify-between px-6 md:px-8 pt-6 text-canvas">
            <a href="#home" className="flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em]">
              <span className="w-8 h-8 rounded-[9px] bg-canvas text-navy grid place-items-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" /></svg>
              </span>ClearCaption
            </a>
            <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-canvas/10 backdrop-blur-md border border-canvas/15 text-[14px]">
              {[
                ['Home', '#home'],
                ['Problem', '#problem'],
                ['How it works', '#how-it-works'],
                ['Stories', '#stories'],
                ['Contact', '#contact']
              ].map(([l, h]) => (
                <a key={l} href={h} className="h-9 px-4 rounded-full grid place-items-center hover:bg-canvas/20 transition-colors">{l}</a>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <a href="#/staff" className="h-10 px-4 rounded-full bg-canvas/15 hover:bg-canvas/25 text-canvas text-[13px] font-medium inline-flex items-center gap-1.5 backdrop-blur-md border border-canvas/20 transition-colors">
                <Lock size={14} /> Staff Login
              </a>
              <a href="#/kiosk" className="h-10 px-5 rounded-full bg-accent hover:bg-brand text-canvas text-[14px] font-medium grid place-items-center transition-colors shadow-sm">
                Launch Kiosk
              </a>
            </div>

            {/* Mobile menu toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <a href="#/kiosk" className="h-9 px-3.5 rounded-full bg-accent text-canvas text-[13px] font-medium grid place-items-center">
                Kiosk
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="w-9 h-9 rounded-full bg-canvas/20 grid place-items-center text-canvas"
              >
                {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile dropdown drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 inset-x-4 z-30 p-5 rounded-[22px] bg-navy/95 backdrop-blur-xl border border-canvas/20 text-canvas flex flex-col gap-3 shadow-xl">
              {[
                ['Home', '#home'],
                ['Problem', '#problem'],
                ['How it works', '#how-it-works'],
                ['Stories', '#stories'],
                ['Contact', '#contact']
              ].map(([l, h]) => (
                <a
                  key={l}
                  href={h}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-[12px] hover:bg-canvas/15 text-[16px] font-medium"
                >
                  {l}
                </a>
              ))}
              <div className="pt-3 border-t border-canvas/15 flex flex-col gap-2">
                <a
                  href="#/kiosk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 rounded-full bg-accent text-canvas font-medium flex items-center justify-center gap-2 text-[14px]"
                >
                  Launch Patient Kiosk
                </a>
                <a
                  href="#/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 rounded-full bg-canvas/15 text-canvas font-medium flex items-center justify-center gap-2 text-[14px]"
                >
                  <Lock size={15} /> Staff & Clinician Portal
                </a>
              </div>
            </div>
          )}

          {/* headline */}
          <div className="relative z-10 px-6 md:px-12 pt-[10vh] md:pt-[12vh] max-w-[760px] text-canvas flex flex-col gap-6">
            <h1 className="text-[44px] md:text-[76px] leading-[1.02] tracking-[-0.045em] font-medium">
              Every patient<br /><span className="md:pl-24">understood.</span>
            </h1>
            <p className="text-[17px] md:text-[18px] leading-relaxed text-canvas/90 max-w-[500px]">
              A reception-desk tablet that shows a nurse's words as large captions, so Deaf and hard-of-hearing patients can read, tap and answer for themselves.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <PillBtn href="#/kiosk" tone="accent">Launch Patient Kiosk</PillBtn>
              <a
                href="#/staff"
                className="hidden sm:inline-flex items-center gap-2 h-12 px-6 rounded-full bg-canvas/15 hover:bg-canvas/25 text-canvas text-[15px] font-medium backdrop-blur-md border border-canvas/20 transition-colors"
              >
                <Lock size={16} /> Staff Login
              </a>
            </div>
          </div>

          {/* chips */}
          <div className="hidden lg:flex absolute right-8 bottom-24 z-10 max-w-[420px] flex-wrap justify-end gap-2">
            {['Live captions', 'Answer cards', 'Body map', 'Sign language clips', 'Interpreter on call'].map((c, i) => (
              <span key={c} className={`h-9 px-4 rounded-full text-[13px] grid place-items-center backdrop-blur-md ${i === 0 ? 'bg-canvas text-navy' : 'bg-canvas/15 text-canvas border border-canvas/20'}`}>{c}</span>
            ))}
          </div>

          {/* bottom bar */}
          <div className="absolute inset-x-6 md:inset-x-12 bottom-6 z-10 flex items-center justify-between pt-4 border-t border-canvas/25 text-[13px] text-canvas/80">
            <span>Made in Nairobi for Kenyan hospitals</span>
            <span className="hidden md:inline">English · Kiswahili · KSL</span>
            <a href="#problem" className="hover:text-canvas">Scroll for more</a>
          </div>
        </div>
      </header>


      {/* PROCESS STRIP */}
      <Wrap className="py-8">
        <div className="flex items-center gap-4 text-[13px] text-slate">
          {['Welcome', 'Live captions', 'Tap to answer', 'Show where it hurts', 'Visit summary'].map((s, i) => (
            <span key={s} className="contents"><Ticks /><span className={i === 1 ? 'text-navy font-medium' : ''}>{s}</span></span>
          ))}
          <Ticks />
        </div>
      </Wrap>

      {/* ABOUT STATEMENT */}
      <Wrap className="py-16 md:py-24 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col justify-between gap-8">
          <Tag>About ClearCaption</Tag>
          <div className="flex gap-3">
            <img src={IMG.doctor} alt="A doctor" className="w-[88px] h-[88px] rounded-[16px] object-cover" />
            <img src={IMG.nurse} alt="A nurse" className="w-[88px] h-[88px] rounded-[16px] object-cover" />
          </div>
        </div>
        <p className="lg:col-span-8 text-[30px] md:text-[44px] leading-[1.15] tracking-[-0.035em] font-medium">
          We turn spoken words at the hospital desk into clear, large text<span className="text-navy/35"> so Deaf patients can share their name, symptoms and urgency, and answer for themselves.</span>
        </p>
      </Wrap>

      {/* FEATURE */}
      <section className="bg-ash">
        <Wrap className="py-20 md:py-28 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div className="flex gap-10">
              {[['430M+', 'people live with disabling hearing loss'], ['2', 'languages on every card'], ['1 tap', 'to call an interpreter']].map(([n, l]) => (
                <div key={l} className="flex flex-col gap-1">
                  <span className="text-[36px] tracking-[-0.04em] font-medium leading-none">{n}</span>
                  <span className="text-[12px] text-slate max-w-[96px] leading-4">{l}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate -mt-6">Source for 430M: World Health Organization.</p>
            <div className="flex flex-col gap-4 pt-6">
              <Tag>The kiosk</Tag>
              <h2 className="text-[34px] md:text-[44px] leading-[1.05] tracking-[-0.04em] font-medium">Built for the first five minutes of care</h2>
              <p className="text-[15px] leading-6 text-slate max-w-[360px]">Name, reason for visit and urgency are all decided at reception. ClearCaption makes sure both sides understand each one.</p>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="relative h-[420px] rounded-[24px] overflow-hidden bg-sky">
              <img src={IMG.nurse} alt="A reception nurse" className="w-full h-full object-cover" />
              <span className="absolute top-4 right-4 w-11 h-11 rounded-full bg-alert text-canvas grid place-items-center"><Heartbeat size={20} /></span>
            </div>
            <div className="px-1 flex flex-col gap-1">
              <p className="text-[20px] font-medium tracking-[-0.02em]">At reception</p>
              <p className="text-[13px] text-slate flex items-center gap-1"><Star size={14} weight="fill" className="text-amber" />Speaks as usual. No new habits.</p>
            </div>
            <div className="flex items-end justify-between gap-4 pt-2">
              <p className="text-[13px] leading-5 text-slate">The nurse talks. Their words appear on the patient's screen as they speak.</p>
              <a href="#/kiosk" className="shrink-0 h-11 pl-4 pr-1 rounded-full bg-accent text-canvas text-[13px] font-medium flex items-center gap-2">Try it<span className="w-9 h-9 rounded-full bg-canvas text-accent grid place-items-center"><ArrowRight size={14} weight="bold" /></span></a>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-[520px] rounded-[24px] overflow-hidden">
            <img src={IMG.bedside} alt="A nurse talking with a patient" className="w-full h-full object-cover" />
            <div className="absolute right-4 bottom-4 left-4 md:left-auto md:w-[300px] rounded-[18px] bg-canvas/90 backdrop-blur-xl p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 divide-x divide-line">
                <div className="pr-3"><p className="text-[11px] text-slate leading-4">Nurse said</p><p className="text-[14px] font-medium leading-5 mt-1">Where does it hurt?</p></div>
                <div className="pl-3"><p className="text-[11px] text-slate leading-4">Patient tapped</p><p className="text-[14px] font-medium leading-5 mt-1">Chest, left</p></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[11px] text-slate"><span>Check-in progress</span><span>3 of 5</span></div>
                <div className="flex gap-[3px] h-8">{Array.from({ length: 30 }).map((_, i) => <span key={i} className={`flex-1 rounded-full ${i < 18 ? 'bg-accent' : 'bg-accent/15'}`} />)}</div>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {/* PROBLEM BENTO */}
      <section id="problem">
        <Wrap className="py-20 md:py-28 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-[34px] md:text-[52px] leading-[1.02] tracking-[-0.045em] font-medium max-w-[620px]">Why front desks need a clearer way to talk</h2>
            <p className="text-[15px] leading-6 text-slate max-w-[360px]">Today, a Deaf patient at reception is often left guessing. These are the moments ClearCaption is designed for.</p>
          </div>
          <div className="grid md:grid-cols-12 gap-4">
            <figure className="md:col-span-5 relative h-[440px] rounded-[24px] overflow-hidden">
              <img src={IMG.writing} alt="A clinician writing notes on a chart" className="w-full h-full object-cover" />
              <figcaption className="absolute left-4 bottom-4 right-4 rounded-[16px] bg-canvas/85 backdrop-blur-xl p-4">
                <p className="text-[18px] font-medium tracking-[-0.02em]">Notes on scraps of paper</p>
                <p className="text-[13px] text-slate leading-5">Slow, short, and easy to misread.</p>
              </figcaption>
            </figure>
            <div className="md:col-span-3 rounded-[24px] bg-accent text-canvas p-7 flex flex-col justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">{[IMG.doctor, IMG.nurse, IMG.elder].map((s) => <img key={s} src={s} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-accent" />)}</div>
                <span className="text-[12px] text-canvas/85">Reviewed with Deaf advisors</span>
              </div>
              <div className="flex flex-col gap-4">
                <Tag dark>Guessing</Tag>
                <p className="text-[24px] leading-[1.2] tracking-[-0.025em] font-medium">Lip-reading through a mask, <span className="text-canvas/60">across a busy counter, means key words get missed.</span></p>
              </div>
            </div>
            <figure className="md:col-span-4 relative h-[440px] rounded-[24px] overflow-hidden">
              <img src={IMG.frustrated} alt="A man holding his head in frustration" className="w-full h-full object-cover" />
              <figcaption className="absolute left-4 bottom-4 right-4 rounded-[16px] bg-canvas/85 backdrop-blur-xl p-4">
                <p className="text-[18px] font-medium tracking-[-0.02em]">Waiting for an interpreter</p>
                <p className="text-[13px] text-slate leading-5">Rarely available at the desk, so patients wait or go without.</p>
              </figcaption>
            </figure>
          </div>
        </Wrap>
      </section>

      {/* HOW + SCREEN */}
      <section id="how-it-works" className="p-3 md:p-4">
        <div className="rounded-[28px] bg-navy text-canvas">
          <Wrap className="py-20 md:py-28 flex flex-col gap-14">
            <div className="grid lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-7 flex flex-col gap-5">
                <Tag dark>How it works</Tag>
                <h2 className="text-[34px] md:text-[52px] leading-[1.02] tracking-[-0.045em] font-medium">It reads like a text conversation<span className="text-canvas/40">, because that is how Deaf patients already talk.</span></h2>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-canvas/10 rounded-[20px] overflow-hidden">
              {[
                ['01', 'The nurse speaks', 'Their words appear on the tablet in large, easy-to-read text as they talk.'],
                ['02', 'The patient taps', 'Cards like "Chest Pain" answer common questions in one touch, each with a sign language clip.'],
                ['03', 'Both read the same screen', 'Every question and answer stays on screen, so nothing said at the desk is lost.'],
              ].map(([n, t, d]) => (
                <div key={n} className="bg-navy p-8 flex flex-col gap-10">
                  <span className="text-[13px] text-canvas/50">{n}</span>
                  <div className="flex flex-col gap-2">
                    <p className="text-[22px] tracking-[-0.02em] font-medium">{t}</p>
                    <p className="text-[14px] leading-6 text-canvas/65">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[24px] bg-canvas/[0.06] border border-canvas/10 p-3 md:p-4"><ScaledKiosk /></div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[14px] text-canvas/60">Tap any answer card above, or walk through a full intake session.</p>
              <PillBtn href="#/kiosk">Launch Patient Kiosk</PillBtn>
            </div>
          </Wrap>
        </div>
      </section>

      {/* WHO IT HELPS (card row) */}
      <section>
        <Wrap className="py-20 md:py-28 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-5">
              <Tag>Who it helps</Tag>
              <h2 className="text-[34px] md:text-[52px] leading-[1.02] tracking-[-0.045em] font-medium max-w-[640px]">Better for patients, easier for staff.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              [IMG.elder, 'Patients', 'Read every question and answer in your own language'],
              [IMG.desk, 'Reception staff', 'Speak naturally and see the answer straight away'],
              [IMG.reception, 'Hospital leaders', 'Offer equal access to care at every front desk'],
            ].map(([img, tag, t]) => (
              <article key={tag} className="rounded-[24px] bg-ash p-2.5 flex flex-col">
                <div className="relative h-[260px] rounded-[18px] overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute left-3 bottom-3 h-7 px-3 rounded-full bg-canvas text-[12px] grid place-items-center">{tag}</span>
                </div>
                <div className="p-4 pt-5 flex flex-col gap-4">
                  <p className="text-[19px] leading-6 tracking-[-0.02em] font-medium">{t}</p>
                  <a href="#/kiosk" className="text-[13px] font-medium flex items-center gap-1.5"><ArrowUpRight size={14} />See how</a>
                </div>
              </article>
            ))}
          </div>
        </Wrap>
      </section>

      {/* TESTIMONIAL */}
      <section id="stories" className="bg-ash">
        <Wrap className="py-20 md:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-3 flex lg:flex-col justify-between gap-6 h-full">
            <Tag>Stories</Tag>
            <img src={q.img} alt="" className="w-[160px] h-[180px] rounded-[18px] object-cover" />
          </div>
          <figure className="lg:col-span-7 flex flex-col gap-8">
            <span className="text-[56px] leading-none text-navy/20 font-medium">&ldquo;</span>
            <blockquote className="text-[26px] md:text-[38px] leading-[1.15] tracking-[-0.035em] font-medium">
              {q.q}<span className="text-navy/35">{q.rest}</span>
            </blockquote>
            <figcaption><p className="font-medium">{q.who}</p><p className="text-[13px] text-slate">{q.role} · sample quote</p></figcaption>
          </figure>
          <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-end gap-2">
            <button onClick={() => setQi((qi + 1) % QUOTES.length)} aria-label="Previous" className="w-11 h-11 rounded-full bg-accent text-canvas grid place-items-center"><ArrowUp size={18} /></button>
            <button onClick={() => setQi((qi + 1) % QUOTES.length)} aria-label="Next" className="w-11 h-11 rounded-full border border-navy/15 grid place-items-center"><ArrowDown size={18} /></button>
          </div>
        </Wrap>
      </section>

      {/* FAQ */}
      <Wrap className="py-20 md:py-28 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col gap-5">
          <Tag>Questions</Tag>
          <h2 className="text-[34px] md:text-[44px] leading-[1.05] tracking-[-0.04em] font-medium">Common questions</h2>
        </div>
        <ul className="lg:col-span-8 divide-y divide-line border-y border-line">
          {FAQS.map(([qq, a], i) => (
            <li key={qq}>
              <button onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i} className="w-full py-6 flex items-center justify-between gap-6 text-left text-[18px] font-medium tracking-[-0.01em]">
                {qq}
                <span className={`w-9 h-9 shrink-0 rounded-full grid place-items-center ${faq === i ? 'bg-accent text-canvas' : 'border border-navy/15'}`}>{faq === i ? <Minus size={16} /> : <Plus size={16} />}</span>
              </button>
              {faq === i && <p className="pb-6 pr-16 text-[15px] leading-7 text-slate">{a}</p>}
            </li>
          ))}
        </ul>
      </Wrap>

      {/* FOOTER / CONTACT */}
      <footer id="contact" className="p-3 md:p-4">
        <div className="relative rounded-[28px] bg-ash overflow-hidden">
          <Wrap className="relative z-10 pt-20 pb-8 flex flex-col gap-16">
            <div className="grid lg:grid-cols-12 gap-10 items-end">
              <h2 className="lg:col-span-7 text-[38px] md:text-[60px] leading-[1] tracking-[-0.045em] font-medium">Every patient understood.<br /><span className="text-navy/35">Built for hospital reception.</span></h2>
              <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry sent to hospital accessibility coordination.') }} className="lg:col-span-5 flex flex-col gap-3">
                <p className="text-[14px] text-slate">Hospital staff or department inquiry? Reach our on-site technical coordination team.</p>
                <div className="flex items-center gap-2 h-14 pl-5 pr-1.5 rounded-full bg-canvas border border-line focus-within:border-accent">
                  <EnvelopeSimple size={18} className="text-slate" />
                  <input type="email" required placeholder="Staff or hospital email" aria-label="Hospital email" className="flex-1 bg-transparent outline-none text-[15px]" />
                  <button className="h-11 px-5 rounded-full bg-accent hover:bg-brand text-canvas text-[14px] font-medium transition-colors">Send Inquiry</button>
                </div>
              </form>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-line text-[14px]">
              <div className="flex flex-col gap-2.5">
                <span className="text-[12px] uppercase tracking-[0.1em] text-slate">Product</span>
                <a href="#how-it-works" className="hover:text-accent">How it works</a>
                <a href="#/kiosk" className="hover:text-accent">Launch Patient Kiosk</a>
                <a href="#problem" className="hover:text-accent">Why front desks need it</a>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[12px] uppercase tracking-[0.1em] text-slate">Clinical Staff & Admin</span>
                <a href="#/staff" className="text-accent font-semibold hover:underline flex items-center gap-1.5"><Lock size={14} />Staff & Clinician Portal</a>
                <a href="#/admin" className="text-navy font-semibold hover:text-accent flex items-center gap-1.5"><ShieldCheck size={14} />Admin Suite (30 Staff)</a>
                <a href="#/kiosk" className="hover:text-accent">Desk 3 Terminal</a>
                <a href="#contact" className="hover:text-accent">Accessibility Support</a>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[12px] uppercase tracking-[0.1em] text-slate">Hospital Compliance</span>
                <a href="#contact" className="hover:text-accent">Data Protection (DPA)</a>
                <a href="#contact" className="hover:text-accent">Patient Confidentiality</a>
                <a href="#contact" className="hover:text-accent">KSL Interpreter Network</a>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[12px] uppercase tracking-[0.1em] text-slate">Desk Assistance</span>
                <a href="mailto:hello@clearcaption.co.ke" className="text-[17px] underline underline-offset-4">hello@clearcaption.co.ke</a>
                <a href="tel:+254700000000" className="flex items-center gap-2"><Phone size={14} />+254 700 000 000</a>
                <span className="flex items-center gap-2 text-slate"><HandWaving size={14} />Nairobi, Kenya</span>
              </div>
            </div>
          </Wrap>
          <div aria-hidden className="relative -mb-[3vw] select-none text-center text-[17vw] leading-[0.8] tracking-[-0.06em] font-semibold text-navy/[0.06]">ClearCaption</div>
          <Wrap className="relative z-10 py-5 flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate border-t border-line">
            <span>© 2026 ClearCaption · Hospital Front-Desk Speech Captioning</span>
            <div className="flex items-center gap-6">
              <a href="#/staff" className="flex items-center gap-1.5 text-accent font-semibold hover:underline">
                <Lock size={15} /> Clinician Login
              </a>
              <a href="#/admin" className="flex items-center gap-1.5 text-slate hover:text-accent font-semibold">
                <ShieldCheck size={15} /> Admin Portal
              </a>
              <a href="#/kiosk" className="hover:text-accent font-medium">Open Kiosk</a>
              <span>Privacy · DPA Compliant</span>
            </div>
          </Wrap>
        </div>
      </footer>
    </div>
  )
}
