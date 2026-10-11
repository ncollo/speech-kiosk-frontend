import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__brand-col">
          <div className="lp-footer__brand">
            <span className="lp-footer__logo" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                <rect x="4" y="6" width="20" height="16" rx="3" />
                <path d="M8 14h6" />
                <path d="M8 18h10" />
                <circle cx="20" cy="10" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <span className="lp-footer__name">ClearCaption Kiosk</span>
          </div>
          <p className="lp-footer__desc">
            An accessible healthcare communication interface built for Deaf and hard-of-hearing 
            patients at hospital reception desks. Deployed at St. Mary's Medical Center.
          </p>
          <div className="lp-footer__compliance">
            <span className="lp-badge">WCAG 2.2 AAA</span>
            <span className="lp-badge">ADA Title III</span>
            <span className="lp-badge">Kenya Data Protection Act</span>
            <span className="lp-badge">Zero PII Storage</span>
          </div>
        </div>

        <div className="lp-footer__links-col">
          <h4 className="lp-footer__col-title">Overview</h4>
          <ul className="lp-footer__list">
            <li><a href="#hero">Overview</a></li>
            <li><a href="#architecture-flow">4-Screen Progression</a></li>
            <li><a href="#clinical-photos">Authentic Field Photos</a></li>
            <li><a href="#features">Core Features</a></li>
            <li><a href="#accessibility">Accessibility Standards</a></li>
            <li><a href="#impact">Clinical Impact</a></li>
          </ul>
        </div>

        <div className="lp-footer__links-col">
          <h4 className="lp-footer__col-title">Clinical Progression</h4>
          <ul className="lp-footer__list">
            <li><Link to="/welcome">1. Welcome & Consent Screen</Link></li>
            <li><Link to="/clinician/unlock">2. Clinician PIN Unlock</Link></li>
            <li><Link to="/kiosk">3. Live Kiosk & Triage</Link></li>
            <li><Link to="/summary">4. Session Summary Handoff</Link></li>
            <li><Link to="/admin">5. Hospital Admin Portal</Link></li>
          </ul>
        </div>

        <div className="lp-footer__links-col">
          <h4 className="lp-footer__col-title">Specifications</h4>
          <p className="lp-footer__spec"><strong>Screen Spec:</strong> 10" Tablet, 1280×800 Landscape</p>
          <p className="lp-footer__spec"><strong>Typography:</strong> Atkinson Hyperlegible (Braille Institute)</p>
          <p className="lp-footer__spec"><strong>Sign Language:</strong> Certified Kenya Sign Language (KSL)</p>
          <Link to="/welcome" className="lp-hero__btn lp-hero__btn--primary lp-footer__launch-btn">
            Start Patient Intake →
          </Link>
        </div>
      </div>

      <div className="lp-footer__bottom">
        <p>© 2026 St. Mary's Medical Center — Accessible Healthcare Initiative. All rights reserved.</p>
        <p className="lp-footer__bottom-sub">Designed with Deaf and Hard-of-Hearing advocacy principles.</p>
      </div>
    </footer>
  );
}
