import { useState } from 'react';
import { Link } from 'react-router-dom';
import './SystemPreviewSection.css';

export default function SystemPreviewSection() {
  const [activeTab, setActiveTab] = useState<'patient' | 'clinician'>('patient');

  return (
    <section className="lp-preview" id="preview">
      <div className="lp-preview__inner">
        <div className="lp-preview__header">
          <span className="lp-section-label">Interface Showcase</span>
          <h2 className="lp-section-title">See the system in action</h2>
          <p className="lp-section-subtitle">
            A synchronized dual-display system: an accessible 10-inch tablet interface for the patient, 
            and a comprehensive transcript and triage station for reception staff.
          </p>
        </div>

        <div className="lp-preview__tabs" role="tablist" aria-label="Kiosk Interface Views">
          <button
            role="tab"
            aria-selected={activeTab === 'patient'}
            className={`lp-preview__tab ${activeTab === 'patient' ? 'lp-preview__tab--active' : ''}`}
            onClick={() => setActiveTab('patient')}
          >
            <span className="lp-preview__tab-indicator" />
            Patient View (10" Tablet Kiosk)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'clinician'}
            className={`lp-preview__tab ${activeTab === 'clinician' ? 'lp-preview__tab--active' : ''}`}
            onClick={() => setActiveTab('clinician')}
          >
            <span className="lp-preview__tab-indicator" />
            Clinician & Staff Console
          </button>
        </div>

        <div className="lp-preview__display">
          <div className="lp-device-frame">
            <div className="lp-device-frame__header">
              <span className="lp-device-frame__dot" />
              <span className="lp-device-frame__dot" />
              <span className="lp-device-frame__dot" />
              <span className="lp-device-frame__title">
                {activeTab === 'patient'
                  ? 'St. Mary\'s Medical Center — Patient Reception Kiosk'
                  : 'St. Mary\'s Medical Center — Staff Triage Station'}
              </span>
            </div>
            <div className="lp-device-frame__screen">
              <img
                src={
                  activeTab === 'patient'
                    ? '/kiosk-patient-preview.png'
                    : '/kiosk-clinician-preview.png'
                }
                alt={
                  activeTab === 'patient'
                    ? 'Patient view showing live question captions and visual symptom cards'
                    : 'Clinician view showing live transcript log, triage actions, and audio status'
                }
                className="lp-device-frame__img"
              />
            </div>
          </div>

          <div className="lp-preview__details">
            {activeTab === 'patient' ? (
              <div className="lp-preview__feature-list">
                <div className="lp-preview__feature-item">
                  <div className="lp-preview__feature-icon">01</div>
                  <div>
                    <h4>34px High-Legibility Live Captions</h4>
                    <p>Clinician speech is transcribed instantly with high line-height and contrast against a warm off-white background.</p>
                  </div>
                </div>
                <div className="lp-preview__feature-item">
                  <div className="lp-preview__feature-icon">02</div>
                  <div>
                    <h4>Visual Symptom Selector</h4>
                    <p>8 touch cards (chest pain, breathing, fever, etc.) allow quick non-verbal expression with tactile feedback.</p>
                  </div>
                </div>
                <div className="lp-preview__feature-item">
                  <div className="lp-preview__feature-icon">03</div>
                  <div>
                    <h4>Integrated ASL Video References</h4>
                    <p>Each card provides an instant American Sign Language video thumbnail for visual validation.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lp-preview__feature-list">
                <div className="lp-preview__feature-item">
                  <div className="lp-preview__feature-icon">01</div>
                  <div>
                    <h4>Chronological Timestamped Transcript</h4>
                    <p>Receptionists see speaker breakdown (Clinician vs. Patient) with millisecond-accurate timestamps.</p>
                  </div>
                </div>
                <div className="lp-preview__feature-item">
                  <div className="lp-preview__feature-icon">02</div>
                  <div>
                    <h4>One-Click Symptom & Statement Flagging</h4>
                    <p>Mark high-urgency statements with amber triage flags for immediate physician handoff.</p>
                  </div>
                </div>
                <div className="lp-preview__feature-item">
                  <div className="lp-preview__feature-icon">03</div>
                  <div>
                    <h4>Triage Escalation & Audio Controls</h4>
                    <p>Direct triggers to request an in-person ASL interpreter, escalate to emergency triage, or adjust microphone gain.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lp-preview__cta-banner">
          <div>
            <h3>Ready to test the interactive interface?</h3>
            <p>Experience the actual touch kiosk with live simulation and audio transcript tools.</p>
          </div>
          <Link to="/kiosk" className="lp-hero__btn lp-hero__btn--primary">
            Open Interactive Kiosk
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M5 10h10M12 6l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
