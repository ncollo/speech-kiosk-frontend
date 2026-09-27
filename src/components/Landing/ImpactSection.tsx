import './ImpactSection.css';

const stats = [
  {
    value: '1.5B+',
    label: 'Global Population with Hearing Loss',
    source: 'World Health Organization (WHO)',
  },
  {
    value: '<300ms',
    label: 'Speech-to-Text Transcription Latency',
    source: 'Whisper AI Edge Streaming Pipeline',
  },
  {
    value: '100%',
    label: 'Atkinson Hyperlegible Typography',
    source: 'Braille Institute Low-Vision Standard',
  },
  {
    value: '0 Byte',
    label: 'Patient Speech Retention on Kiosk',
    source: 'HIPAA & ADA Compliant Architecture',
  },
];

export default function ImpactSection() {
  return (
    <section className="lp-impact" id="impact">
      <div className="lp-impact__inner">
        <div className="lp-impact__header">
          <span className="lp-section-label">Clinical & Social Impact</span>
          <h2 className="lp-section-title">Why this kiosk matters</h2>
          <p className="lp-section-subtitle">
            Communication barriers in emergency rooms and clinics cause diagnostic delays, 
            anxiety, and medication errors. ClearCaption ensures equitable access from the very first greeting.
          </p>
        </div>

        <div className="lp-impact__grid">
          {stats.map((item, idx) => (
            <div className="lp-stat-card" key={idx}>
              <span className="lp-stat-card__value">{item.value}</span>
              <h3 className="lp-stat-card__label">{item.label}</h3>
              <span className="lp-stat-card__source">{item.source}</span>
            </div>
          ))}
        </div>

        <div className="lp-quote-card">
          <blockquote className="lp-quote-card__quote">
            "For Deaf patients, visiting hospital reception is often stressful due to mask wearing and rapid spoken instructions. Having direct, reliable captioning on a dedicated kiosk screen transforms the experience from anxious guesswork into confident healthcare engagement."
          </blockquote>
          <div className="lp-quote-card__author">
            <strong>Dr. Sarah Lin, MD</strong>
            <span>Chief Accessibility Officer & Director of Emergency Intake, St. Mary's Medical Center</span>
          </div>
        </div>
      </div>
    </section>
  );
}
