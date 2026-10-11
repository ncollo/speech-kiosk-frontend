import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TextSizePreference } from '../../types';
import './WelcomeConsentScreen.css';

export default function WelcomeConsentScreen() {
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState<TextSizePreference>('large');
  const [enableKsl, setEnableKsl] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  const handleStart = () => {
    // Persist preferences in sessionStorage for the active kiosk session
    sessionStorage.setItem('kiosk_text_size', textSize);
    sessionStorage.setItem('kiosk_enable_ksl', String(enableKsl));
    sessionStorage.setItem('kiosk_language', language);
    navigate('/kiosk?view=patient');
  };

  return (
    <div className="welcome-screen">
      <header className="welcome-header">
        <div className="welcome-header__brand">
          <span className="welcome-header__dot" />
          <h1>St. Mary's Medical Center — Reception Kiosk</h1>
        </div>
        <div className="welcome-header__lang">
          <button
            type="button"
            className={`lang-btn ${language === 'en' ? 'lang-btn--active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'sw' ? 'lang-btn--active' : ''}`}
            onClick={() => setLanguage('sw')}
          >
            Kiswahili
          </button>
        </div>
      </header>

      <main className="welcome-main">
        <div className="welcome-hero">
          <span className="welcome-badge">
            {language === 'en' ? 'Accessible Intake' : 'Mapokezi Yenye Ufikiaji'}
          </span>
          <h2 className="welcome-title">
            {language === 'en'
              ? 'Real-Time Speech Captions & Non-Verbal Triage'
              : 'Manukuu ya Papo Hapo na Uteuzi wa Dalili'}
          </h2>
          <p className="welcome-desc">
            {language === 'en'
              ? 'This screen displays the receptionist\'s spoken questions as large, clear text. You can respond verbally or tap symptom cards with Kenya Sign Language (KSL) demonstrations.'
              : 'Skrini hii inaonyesha maneno ya mhudumu kama maandishi makubwa yaliyo wazi. Unaweza kujibu kwa sauti au kubofya dalili zenye video za Lugha ya Alama ya Kenya (KSL).'}
          </p>

          <button
            type="button"
            className="welcome-cta-btn"
            onClick={handleStart}
          >
            <span className="welcome-cta-btn__icon" aria-hidden="true">👆</span>
            <span>{language === 'en' ? 'Tap Screen to Start' : 'Bofya Hapa Kuanza'}</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
              <path d="M5 10h10M11 6l4 4-4 4" />
            </svg>
          </button>
        </div>

        <div className="welcome-controls-grid">
          {/* Data Protection Guarantee */}
          <section className="welcome-card welcome-card--privacy">
            <div className="welcome-card__header">
              <span className="privacy-shield">🛡️</span>
              <div>
                <h3 className="welcome-card__title">
                  {language === 'en' ? 'Data Protection Guarantee' : 'Ulinzi wa Data Yako'}
                </h3>
                <span className="welcome-card__sub">
                  Kenya Data Protection Act 2019 & Medical Privacy
                </span>
              </div>
            </div>

            <ul className="privacy-list">
              <li>
                <strong>No Login Required:</strong> Zero passwords, phone numbers, or account creation needed.
              </li>
              <li>
                <strong>On-Device Processing:</strong> Speech is transcribed live in RAM. Voice audio is never stored or recorded.
              </li>
              <li>
                <strong>Automatic Session Wipe:</strong> All captions and tapped symptoms are erased upon completion.
              </li>
            </ul>
          </section>

          {/* Accessibility Preferences */}
          <section className="welcome-card welcome-card--prefs">
            <h3 className="welcome-card__title">
              {language === 'en' ? 'Accessibility Preferences' : 'Chaguo za Ufikiaji'}
            </h3>

            {/* Font Size Picker */}
            <div className="pref-row">
              <label className="pref-label">
                {language === 'en' ? 'Caption Text Size' : 'Ukubwa wa Maandishi'}
              </label>
              <div className="size-selector" role="radiogroup" aria-label="Caption text size">
                <button
                  type="button"
                  className={`size-btn ${textSize === 'standard' ? 'size-btn--active' : ''}`}
                  onClick={() => setTextSize('standard')}
                >
                  Standard (28px)
                </button>
                <button
                  type="button"
                  className={`size-btn ${textSize === 'large' ? 'size-btn--active' : ''}`}
                  onClick={() => setTextSize('large')}
                >
                  Large (34px) ★
                </button>
                <button
                  type="button"
                  className={`size-btn ${textSize === 'xlarge' ? 'size-btn--active' : ''}`}
                  onClick={() => setTextSize('xlarge')}
                >
                  Extra Large (42px)
                </button>
              </div>
            </div>

            {/* KSL Toggle */}
            <div className="pref-row pref-row--switch">
              <div>
                <label className="pref-label">
                  {language === 'en' ? 'Kenya Sign Language (KSL) Prompts' : 'Video za Lugha ya Alama (KSL)'}
                </label>
                <p className="pref-desc">
                  Show certified sign language demonstration video badges on each symptom card.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableKsl}
                className={`switch-btn ${enableKsl ? 'switch-btn--on' : ''}`}
                onClick={() => setEnableKsl(!enableKsl)}
              >
                <span className="switch-knob" />
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="welcome-footer">
        <span>St. Mary's Medical Center · Reception Terminal #2</span>
        <span>Atkinson Hyperlegible Typography · WCAG 2.2 AAA</span>
      </footer>
    </div>
  );
}
