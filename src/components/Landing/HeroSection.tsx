import { Link } from 'react-router-dom';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="lp-hero" id="hero">
      <div className="lp-hero__overlay" />
      <img
        className="lp-hero__bg"
        src="/hero-reception.jpg"
        alt="Hospital reception with a captioning tablet bridging communication between a patient and receptionist"
      />
      <div className="lp-hero__content">
        <span className="lp-hero__badge">AI-Powered Accessibility</span>
        <h1 className="lp-hero__title">
          Every patient deserves<br />
          to be <em>understood.</em>
        </h1>
        <p className="lp-hero__subtitle">
          Real-time speech-to-text captioning for Deaf and hard-of-hearing
          patients at hospital reception. Bridging the communication gap
          with AI — so no one is left out of their own healthcare conversation.
        </p>
        <div className="lp-hero__actions">
          <Link to="/kiosk" className="lp-hero__btn lp-hero__btn--primary">
            Launch Kiosk Demo
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M5 10h10M12 6l4 4-4 4" />
            </svg>
          </Link>
          <a href="#how-it-works" className="lp-hero__btn lp-hero__btn--secondary">
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
