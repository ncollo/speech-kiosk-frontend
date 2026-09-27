import './AccessibilitySection.css';

const principles = [
  {
    title: 'Atkinson Hyperlegible',
    stat: '100%',
    description: 'Every character in this interface uses the Braille Institute\'s Atkinson Hyperlegible typeface — designed to maximize letterform distinction for low-vision readers.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 24h6l2-6h8l2 6h6" />
        <path d="M12 18l4-12 4 12" />
      </svg>
    ),
  },
  {
    title: 'Minimum 34px Captions',
    stat: '34px',
    description: 'Caption text exceeds WCAG AAA requirements. High line-height, generous letter-spacing, and maximum contrast against the warm off-white background.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="24" height="20" rx="3" />
        <path d="M8 14h10" />
        <path d="M8 19h16" />
        <path d="M8 24h6" />
      </svg>
    ),
  },
  {
    title: '64px+ Touch Targets',
    stat: '64px',
    description: 'Every interactive element exceeds Apple\'s recommended 44pt minimum. Symptom cards are 80px tall with generous padding — accommodating motor differences.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="12" r="3" />
        <path d="M16 15v10" />
        <path d="M12 20l4 5 4-5" />
      </svg>
    ),
  },
  {
    title: 'ASL Video Support',
    stat: '10',
    description: 'Every symptom card includes a sign language video reference. Patients who prefer ASL can tap to see the sign for each symptom before selecting.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="20" height="14" rx="2" />
        <polygon points="14,12 14,18 19,15" fill="currentColor" />
        <line x1="6" y1="26" x2="26" y2="26" />
      </svg>
    ),
  },
  {
    title: 'Functional-Only Design',
    stat: '0',
    description: 'Zero decorative elements. No gradients, no drop shadows, no stock photos in the kiosk. Every pixel justifies its presence through function — reducing cognitive load.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="10" />
        <path d="M16 12v4l3 3" />
      </svg>
    ),
  },
  {
    title: '3-Color Palette',
    stat: '3',
    description: 'Deep teal, warm off-white, and muted amber — and amber only appears to indicate a selected state. Calm, predictable, clinically trustworthy.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="14" r="6" />
        <circle cx="20" cy="14" r="6" />
        <circle cx="16" cy="20" r="6" />
      </svg>
    ),
  },
];

export default function AccessibilitySection() {
  return (
    <section className="lp-a11y" id="accessibility">
      <div className="lp-a11y__inner">
        <div className="lp-a11y__header">
          <span className="lp-section-label">Design Philosophy</span>
          <h2 className="lp-section-title">
            Accessibility is not a feature.<br />It's the architecture.
          </h2>
          <p className="lp-section-subtitle">
            Every design decision was made with the Deaf and hard-of-hearing experience
            as the primary use case — not an afterthought.
          </p>
        </div>

        <div className="lp-a11y__grid">
          {principles.map((p, i) => (
            <div className="lp-a11y-card" key={i}>
              <div className="lp-a11y-card__icon" aria-hidden="true">
                {p.icon}
              </div>
              <span className="lp-a11y-card__stat">{p.stat}</span>
              <h3 className="lp-a11y-card__title">{p.title}</h3>
              <p className="lp-a11y-card__desc">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
