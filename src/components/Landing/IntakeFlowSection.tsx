import { Link } from 'react-router-dom';
import './IntakeFlowSection.css';

const flowSteps = [
  {
    step: 'Screen 01',
    title: 'Welcome & Consent',
    badge: 'Patient Interface · Zero Login',
    description:
      'Patients arrive stressed and cannot deal with account sign-ups. One tap starts the session. Transparent data-protection disclosure informs the patient that audio is processed live and never stored.',
    features: ['Instant Tap-to-Start', 'Text Size Selector (28px - 42px)', 'KSL Video Prompts Toggle', 'Kenya Data Protection Act Compliance'],
    route: '/welcome',
    routeLabel: 'Open Welcome Screen →',
  },
  {
    step: 'Screen 02',
    title: 'Clinician PIN Unlock',
    badge: 'Staff Terminal · Low Friction',
    description:
      'Desk nurses and receptionists unlock their active station using a 4-digit PIN. Staff identity and desk assignments are audited without imposing login barriers onto the patient.',
    features: ['Tactile 4-Digit PIN Keypad', 'Active Desk Selector', 'Quick Station Switcher', 'Audited Shift Tracking'],
    route: '/clinician/unlock',
    routeLabel: 'Open PIN Unlock →',
  },
  {
    step: 'Screen 03',
    title: 'Session Summary',
    badge: 'Triage Nurse · Unified Record',
    description:
      'Consolidates patient dialogue and non-verbal symptom selections onto one screen for the triage nurse. Flagged urgent statements are highlighted in amber for rapid clinical handoff.',
    features: ['Combined Transcript & Symptom Cards', 'KSL Demonstration Verification', 'One-Click In-Person Interpreter Dispatch', 'EMR Export (FHIR/HL7) & RAM Wipe'],
    route: '/summary',
    routeLabel: 'Open Summary Screen →',
  },
  {
    step: 'Screen 04',
    title: 'Hospital Admin Portal',
    badge: 'Administrator · Authenticated',
    description:
      'The only authenticated account portal in the architecture. Hospital administrators manage symptom cards, audit verified KSL videos, and inspect anonymised usage figures.',
    features: ['Symptom Catalog Manager', 'KSL Video Library & Signer Consent', 'Audited Anonymised Analytics', 'Zero-PII Storage Policy'],
    route: '/admin',
    routeLabel: 'Open Admin Portal →',
  },
];

export default function IntakeFlowSection() {
  return (
    <section className="lp-flow" id="architecture-flow">
      <div className="lp-flow__inner">
        <div className="lp-flow__header">
          <span className="lp-section-label">HCI-Centered Architecture</span>
          <h2 className="lp-section-title">The 4-Screen Clinical Progression</h2>
          <p className="lp-section-subtitle">
            Eliminating the patient login barrier. A restrained, respectful workflow designed
            around the cognitive state of patients arriving at hospital reception.
          </p>
        </div>

        <div className="lp-flow__grid">
          {flowSteps.map((item, idx) => (
            <article key={idx} className="lp-flow-card">
              <div className="lp-flow-card__top">
                <span className="lp-flow-card__step">{item.step}</span>
                <span className="lp-flow-card__badge">{item.badge}</span>
              </div>

              <h3 className="lp-flow-card__title">{item.title}</h3>
              <p className="lp-flow-card__desc">{item.description}</p>

              <ul className="lp-flow-card__features">
                {item.features.map((feat, fIdx) => (
                  <li key={fIdx}>✓ {feat}</li>
                ))}
              </ul>

              <Link to={item.route} className="lp-flow-card__btn">
                {item.routeLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
