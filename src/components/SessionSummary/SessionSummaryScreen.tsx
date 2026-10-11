import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { initialTranscript } from '../../data/transcripts';
import { symptomOptions } from '../../data/symptoms';
import type { TranscriptEntry, SymptomOption } from '../../types';
import './SessionSummaryScreen.css';

export default function SessionSummaryScreen() {
  const navigate = useNavigate();
  const [transcripts] = useState<TranscriptEntry[]>(initialTranscript);
  const [selectedSymptoms] = useState<SymptomOption[]>([
    symptomOptions[0], // Chest Pain
    symptomOptions[1], // Shortness of Breath
    symptomOptions[5], // Fever / Chills
  ]);
  const [isInterpreterRequested, setIsInterpreterRequested] = useState<boolean>(false);
  const [isHandedOff, setIsHandedOff] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string>('');

  const handleExportEMR = () => {
    setExportNotice('EMR Record generated in FHIR/HL7 format and transmitted to St. Mary\'s Intake System.');
    setTimeout(() => setExportNotice(''), 4000);
  };

  const handleWipeAndFinish = () => {
    sessionStorage.clear();
    navigate('/welcome');
  };

  return (
    <div className="summary-screen">
      <header className="summary-header">
        <div className="summary-header__left">
          <Link to="/kiosk" className="summary-back-link">
            ← Return to Live Kiosk
          </Link>
          <div className="summary-meta">
            <span className="summary-tag">Session Summary</span>
            <h1>Patient Intake & Triage Record</h1>
          </div>
        </div>

        <div className="summary-header__right">
          <div className="summary-badge-item">
            <span className="badge-label">Session ID</span>
            <strong className="badge-val">SM-9024</strong>
          </div>
          <div className="summary-badge-item">
            <span className="badge-label">Intake Duration</span>
            <strong className="badge-val">4m 18s</strong>
          </div>
          <div className="summary-badge-item">
            <span className="badge-label">Status</span>
            <span className="status-pill status-pill--ready">Ready for Triage</span>
          </div>
        </div>
      </header>

      {exportNotice && (
        <div className="summary-alert" role="status">
          ✓ {exportNotice}
        </div>
      )}

      <main className="summary-content">
        {/* Left Column: Symptom Assessment & KSL Verification */}
        <section className="summary-card summary-card--symptoms">
          <div className="summary-card__head">
            <span className="card-icon" aria-hidden="true">📋</span>
            <div>
              <h2>Selected Symptom Cards</h2>
              <p>Non-verbal touch selections with Kenya Sign Language (KSL) confirmation</p>
            </div>
          </div>

          <div className="symptom-summary-list">
            {selectedSymptoms.map((symp) => (
              <div key={symp.id} className="symptom-summary-item">
                <div className="symptom-summary-item__main">
                  <span className="symptom-name">{symp.label}</span>
                  {symp.labelSwahili && (
                    <span className="symptom-swahili">({symp.labelSwahili})</span>
                  )}
                  <span className={`urgency-badge urgency-badge--${symp.urgencyLevel || 'routine'}`}>
                    {(symp.urgencyLevel || 'routine').toUpperCase()}
                  </span>
                </div>
                <div className="symptom-summary-item__sub">
                  <span className="ksl-verified">✓ KSL Video Demonstration Verified</span>
                  <span className="timestamp">Onset: ~08:00 AM today</span>
                </div>
              </div>
            ))}
          </div>

          <div className="patient-prefs-box">
            <h3>Intake Accessibility Settings Recorded</h3>
            <div className="prefs-grid">
              <div>
                <span>Caption Text Size:</span>
                <strong>Large (34px)</strong>
              </div>
              <div>
                <span>Sign Language:</span>
                <strong>KSL Enabled</strong>
              </div>
              <div>
                <span>Language:</span>
                <strong>English & Kiswahili</strong>
              </div>
              <div>
                <span>Identity:</span>
                <strong>Anonymous / Zero-PII</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Complete Dialogue Transcript & Flagged Statements */}
        <section className="summary-card summary-card--transcript">
          <div className="summary-card__head">
            <span className="card-icon" aria-hidden="true">🎙️</span>
            <div>
              <h2>Conversation Transcript Log</h2>
              <p>Chronological speech-to-text dialogue (Flagged statements highlighted)</p>
            </div>
          </div>

          <div className="summary-transcript-scroll">
            {transcripts.map((entry) => (
              <div
                key={entry.id}
                className={`summary-transcript-row ${entry.isFlagged ? 'summary-transcript-row--flagged' : ''}`}
              >
                <div className="row-meta">
                  <span className="row-time">{entry.time}</span>
                  {entry.isFlagged && <span className="flag-tag">🚩 Flagged for Physician</span>}
                </div>
                <p className="row-text">{entry.text}</p>
              </div>
            ))}
          </div>

          <div className="audio-metrics-bar">
            <span>Audio Stream: <strong>16kHz Raw PCM</strong></span>
            <span>Average Latency: <strong>178 ms</strong></span>
            <span>Speech Confidence: <strong>99.4%</strong></span>
          </div>
        </section>
      </main>

      {/* Action Toolbar */}
      <footer className="summary-toolbar">
        <div className="summary-toolbar__actions">
          <button
            type="button"
            className={`btn-action btn-action--handoff ${isHandedOff ? 'btn-action--done' : ''}`}
            onClick={() => setIsHandedOff(true)}
          >
            {isHandedOff ? '✓ Handed Off to Triage Dr.' : '→ Hand off to Triage Doctor'}
          </button>

          <button
            type="button"
            className={`btn-action btn-action--interpreter ${isInterpreterRequested ? 'btn-action--done' : ''}`}
            onClick={() => setIsInterpreterRequested(!isInterpreterRequested)}
          >
            {isInterpreterRequested ? '✓ In-Person KSL Interpreter Alerted' : '📢 Request In-Person KSL Interpreter'}
          </button>

          <button
            type="button"
            className="btn-action btn-action--emr"
            onClick={handleExportEMR}
          >
            📄 Export to Hospital EMR
          </button>
        </div>

        <button
          type="button"
          className="btn-action btn-action--wipe"
          onClick={handleWipeAndFinish}
          title="Erases all temporary session audio and captions from memory"
        >
          🗑️ End & Wipe Session Data
        </button>
      </footer>
    </div>
  );
}
