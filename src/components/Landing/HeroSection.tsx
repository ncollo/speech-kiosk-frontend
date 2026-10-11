import { Link } from 'react-router-dom';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="lp-hero" id="hero">
      <div className="lp-hero__overlay" />
      <img
        className="lp-hero__bg"
        src="/hero-reception.jpg"
        alt="Hospital reception with an accessible speech-to-text tablet on the desk for Deaf and hard-of-hearing patient intake"
      />
      <div className="lp-hero__content">
        <span className="lp-hero__badge">Zero-Login Intake · KSL Enabled · KDPA & HIPAA</span>
        <h1 className="lp-hero__title">
          Every patient deserves<br />
          to be <em>understood.</em>
        </h1>
        <p className="lp-hero__subtitle">
          Real-time speech-to-text captioning and Kenya Sign Language (KSL) triage
          for Deaf and hard-of-hearing patients at hospital reception. No patient logins,
          zero data retention, and a seamless 4-screen clinical handoff.
        </p>
        <div className="lp-hero__actions">
          <Link to="/welcome" className="lp-hero__btn lp-hero__btn--primary">
            Start Patient Intake
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M5 10h10M12 6l4 4-4 4" />
            </svg>
          </Link>
          <Link to="/kiosk" className="lp-hero__btn lp-hero__btn--secondary">
            Live Kiosk Simulator
          </Link>
          <a href="#architecture-flow" className="lp-hero__btn lp-hero__btn--outline">
            4-Screen Flow ↓
          </a>
        </div>
      </div>
    </section>
  );
}
