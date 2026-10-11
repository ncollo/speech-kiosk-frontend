import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="lp-navbar">
      <div className="lp-navbar__inner">
        <Link to="/" className="lp-navbar__brand">
          <span className="lp-navbar__logo" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="6" width="20" height="16" rx="3" />
              <path d="M8 14h6" />
              <path d="M8 18h10" />
              <circle cx="20" cy="10" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="lp-navbar__name">ClearCaption</span>
        </Link>

        <nav className="lp-navbar__links" aria-label="Main navigation">
          <a href="#architecture-flow" className="lp-navbar__link">4-Screen Flow</a>
          <a href="#clinical-photos" className="lp-navbar__link">Real Photos</a>
          <a href="#features" className="lp-navbar__link">Capabilities</a>
          <a href="#accessibility" className="lp-navbar__link">Accessibility</a>
          <Link to="/welcome" className="lp-navbar__link lp-navbar__link--sub">Welcome Screen</Link>
          <Link to="/summary" className="lp-navbar__link lp-navbar__link--sub">Summary</Link>
          <Link to="/admin" className="lp-navbar__link lp-navbar__link--admin">Admin Portal</Link>
          <Link to="/kiosk" className="lp-navbar__cta">Launch Kiosk</Link>
        </nav>
      </div>
    </header>
  );
}
