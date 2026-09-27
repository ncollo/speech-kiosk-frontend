import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Patient Arrives',
    description: 'The Deaf or hard-of-hearing patient approaches the reception desk. The kiosk tablet is already active and facing them.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="14" r="6" />
        <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Receptionist Speaks',
    description: 'The receptionist speaks naturally. The AI captures their voice through the tablet microphone and converts speech to text in real time.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="6" width="12" height="16" rx="6" />
        <path d="M10 22a10 10 0 0 0 20 0" />
        <line x1="20" y1="32" x2="20" y2="36" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Patient Reads Captions',
    description: 'Large, high-contrast text appears instantly on the patient\'s screen — minimum 34px, Atkinson Hyperlegible font — designed for maximum readability.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="28" height="20" rx="3" />
        <path d="M11 16h12" />
        <path d="M11 21h18" />
        <path d="M11 26h8" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Patient Responds',
    description: 'The patient taps a visual symptom card to communicate their concern, or uses sign language. Each card includes an ASL video reference.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="10" width="10" height="10" rx="2" />
        <rect x="22" y="10" width="10" height="10" rx="2" />
        <rect x="8" y="24" width="10" height="10" rx="2" />
        <rect x="22" y="24" width="10" height="10" rx="2" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="lp-how" id="how-it-works">
      <div className="lp-how__inner">
        <div className="lp-how__header">
          <span className="lp-section-label">Workflow</span>
          <h2 className="lp-section-title lp-section-title--light">How it works</h2>
          <p className="lp-section-subtitle lp-section-subtitle--light">
            From arrival to triage — a seamless, four-step flow that requires
            no training for patients and minimal setup for staff.
          </p>
        </div>

        <div className="lp-how__steps">
          {steps.map((step) => (
            <div className="lp-step" key={step.number}>
              <div className="lp-step__icon" aria-hidden="true">
                {step.icon}
              </div>
              <span className="lp-step__number">{step.number}</span>
              <h3 className="lp-step__title">{step.title}</h3>
              <p className="lp-step__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
