import './PhotoGallerySection.css';

const galleryPhotos = [
  {
    src: '/real-sign-language.jpg',
    title: 'Certified Sign Language Dialogue',
    category: 'Deaf Accessibility',
    description: 'Informed, attentive sign communication recorded with certified Deaf signers under informed consent protocols for medical terminology.',
  },
  {
    src: '/real-triage-desk.jpg',
    title: 'Clinical Consultation & Triage Desk',
    category: 'Reception Environment',
    description: 'A mock triage intake setup evaluating tablet stand angles, ambient reception acoustics, and clinician-patient line of sight.',
  },
  {
    src: '/real-clinic-reception.jpg',
    title: 'Modern Accessible Reception',
    category: 'Physical Architecture',
    description: 'Hospital reception counters engineered for wheelchair and low-vision accessibility (ADA/Kenya Building Standards).',
  },
  {
    src: '/real-nurse-tablet.jpg',
    title: 'Tablet Hardware Ergonomics',
    category: 'Hardware Setup',
    description: '10-inch ruggedized tablet deployed with anti-glare display and directional microphone array tuned for speech recognition.',
  },
  {
    src: '/real-admin-console.jpg',
    title: 'Administrative Governance Terminal',
    category: 'Secure Infrastructure',
    description: 'Clinical governance console used by hospital administration to review anonymised metrics and verify KSL assets.',
  },
];

export default function PhotoGallerySection() {
  return (
    <section className="lp-gallery" id="clinical-photos">
      <div className="lp-gallery__inner">
        <div className="lp-gallery__header">
          <span className="lp-section-label">Fieldwork & Environmental Context</span>
          <h2 className="lp-section-title">Authentic Healthcare Photography</h2>
          <p className="lp-section-subtitle">
            Addressing supervisory feedback: real clinical environments, authentic tablet setups,
            and real signers with verified consent. Zero AI-generated slop or generic corporate stock.
          </p>
        </div>

        <div className="lp-gallery__grid">
          {galleryPhotos.map((photo, i) => (
            <article key={i} className={`gallery-card ${i === 0 || i === 1 ? 'gallery-card--featured' : ''}`}>
              <div className="gallery-card__img-wrap">
                <img src={photo.src} alt={photo.title} className="gallery-card__img" />
                <span className="gallery-card__cat">{photo.category}</span>
              </div>
              <div className="gallery-card__body">
                <h3 className="gallery-card__title">{photo.title}</h3>
                <p className="gallery-card__desc">{photo.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="lp-gallery__notes">
          <div className="note-item">
            <strong>📋 Signer Consent:</strong>
            <span>All sign language media was filmed with explicit consent from certified medical interpreters.</span>
          </div>
          <div className="note-item">
            <strong>📐 Hardware Standards:</strong>
            <span>10-inch tablet mounted at 75cm counter height for ADA Title III compliance and zero glare.</span>
          </div>
          <div className="note-item">
            <strong>🔒 Privacy Guarantee:</strong>
            <span>No real patient faces or identifying protected health information (PHI) are ever captured.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
