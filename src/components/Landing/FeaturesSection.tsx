import './FeaturesSection.css';

const features = [
  {
    image: '/feature-realtime.jpg',
    imageAlt: 'Tablet displaying real-time captioned text in a hospital setting',
    title: 'Real-Time Speech-to-Text',
    description:
      'AI-powered captioning converts the receptionist\'s spoken words into large, clear text instantly — with less than 300ms latency. Patients read the conversation as it happens.',
  },
  {
    image: '/feature-accessibility.jpg',
    imageAlt: 'A patient and healthcare worker communicating with a captioning tablet between them',
    title: 'Designed for Deaf & HoH Patients',
    description:
      'Every design decision prioritizes the Deaf and hard-of-hearing experience: Atkinson Hyperlegible typeface, 34px minimum caption size, high contrast, and sign language video support on every symptom card.',
  },
  {
    image: '/feature-clinical.jpg',
    imageAlt: 'A clinician reviewing a transcript log on a computer monitor',
    title: 'Clinician Transcript & Triage',
    description:
      'Staff get a separate view with a full timestamped transcript, flag critical statements for handoff, and escalate to triage with one tap — all while the patient sees only the captions.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="lp-features" id="features">
      <div className="lp-features__header">
        <span className="lp-section-label">Core Capabilities</span>
        <h2 className="lp-section-title">
          Purpose-built for accessible healthcare
        </h2>
        <p className="lp-section-subtitle">
          Three integrated interfaces — patient-facing captions, symptom selection,
          and clinician transcript — working together to close the communication gap.
        </p>
      </div>

      <div className="lp-features__grid">
        {features.map((feat, i) => (
          <article className="lp-feature-card" key={i}>
            <div className="lp-feature-card__img-wrap">
              <img src={feat.image} alt={feat.imageAlt} className="lp-feature-card__img" />
            </div>
            <div className="lp-feature-card__body">
              <h3 className="lp-feature-card__title">{feat.title}</h3>
              <p className="lp-feature-card__desc">{feat.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
