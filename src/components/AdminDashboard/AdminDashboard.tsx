import { useState } from 'react';
import { Link } from 'react-router-dom';
import { symptomOptions } from '../../data/symptoms';
import { mockKslVideos, mockUsageMetrics } from '../../data/adminData';
import type { SymptomOption, KslVideoItem } from '../../types';
import './AdminDashboard.css';

type AdminTab = 'symptoms' | 'ksl' | 'analytics';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('admin@stmarys.ke');
  const [password, setPassword] = useState<string>('••••••••');
  const [activeTab, setActiveTab] = useState<AdminTab>('symptoms');
  const [symptoms] = useState<SymptomOption[]>(symptomOptions);
  const [kslVideos] = useState<KslVideoItem[]>(mockKslVideos);
  const [notification, setNotification] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleToggleSymptom = (id: string) => {
    setNotification(`Updated status for symptom ${id}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleVerifyKslSigner = (symptomId: string) => {
    setNotification(`Consent verification refreshed for ${symptomId}`);
    setTimeout(() => setNotification(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <header className="admin-login-header">
          <Link to="/" className="admin-login-back">← Back to Main Kiosk</Link>
          <span className="admin-badge">Hospital Administration</span>
        </header>

        <main className="admin-login-box">
          <div className="admin-login-head">
            <span className="admin-lock-icon" aria-hidden="true">🔐</span>
            <h1>Hospital Administrator Portal</h1>
            <p>The only authenticated login in the ClearCaption architecture. Sign in to manage clinical content and review anonymised metrics.</p>
          </div>

          <form onSubmit={handleLogin} className="admin-form">
            <div className="form-group">
              <label htmlFor="admin-email">Hospital Staff Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-pass">Secure Password</label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input"
              />
            </div>

            <button type="submit" className="admin-login-btn">
              Sign In to Management Console
            </button>

            <button
              type="button"
              className="admin-demo-btn"
              onClick={() => setIsAuthenticated(true)}
            >
              ★ Demo 1-Click Sign-In
            </button>
          </form>

          <footer className="admin-login-footer">
            <span>St. Mary's Medical Center · Security Compliance Enforced</span>
            <span>Zero patient data is accessible in this portal. All metrics are aggregated.</span>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-nav">
        <div className="admin-nav__left">
          <span className="admin-nav__logo">🏥</span>
          <div>
            <h1>St. Mary's Medical Center · Reception Admin</h1>
            <span className="admin-nav__role">Signed in as: Dr. Sarah Lin (Chief Accessibility Officer)</span>
          </div>
        </div>

        <div className="admin-nav__right">
          <Link to="/kiosk" className="admin-link-kiosk">Open Live Kiosk</Link>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => setIsAuthenticated(false)}
          >
            Sign Out
          </button>
        </div>
      </header>

      {notification && (
        <div className="admin-toast" role="status">
          ✓ {notification}
        </div>
      )}

      {/* Admin Tabs */}
      <nav className="admin-tab-bar" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'symptoms'}
          className={`admin-tab ${activeTab === 'symptoms' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('symptoms')}
        >
          Symptom Cards Manager ({symptoms.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'ksl'}
          className={`admin-tab ${activeTab === 'ksl' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('ksl')}
        >
          KSL Video Library ({kslVideos.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'analytics'}
          className={`admin-tab ${activeTab === 'analytics' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Anonymised Usage & Analytics
        </button>
      </nav>

      <main className="admin-body">
        {/* TAB 1: SYMPTOM CARDS MANAGER */}
        {activeTab === 'symptoms' && (
          <section className="admin-panel">
            <div className="panel-header">
              <div>
                <h2>Active Symptom Touch Cards</h2>
                <p>Manage cards displayed on patient 10-inch kiosk tablet screens.</p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setNotification('New symptom card modal opened')}
              >
                + Add Symptom Card
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Symptom Label (EN)</th>
                    <th>Kiswahili Label</th>
                    <th>Urgency Level</th>
                    <th>KSL Video</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {symptoms.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.label}</strong></td>
                      <td>{s.labelSwahili || '—'}</td>
                      <td>
                        <span className={`pill pill--${s.urgencyLevel || 'routine'}`}>
                          {s.urgencyLevel || 'routine'}
                        </span>
                      </td>
                      <td>
                        <span className="ksl-indicator">✓ Certified KSL</span>
                      </td>
                      <td>
                        <span className="status-active">Active on Kiosk</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-table"
                          onClick={() => handleToggleSymptom(s.id)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: KSL VIDEO LIBRARY */}
        {activeTab === 'ksl' && (
          <section className="admin-panel">
            <div className="panel-header">
              <div>
                <h2>Kenya Sign Language (KSL) Video Library</h2>
                <p>Curated medical sign language demonstrations featuring real certified signers with verified consent.</p>
              </div>
              <span className="compliance-shield">✓ Deaf Community Approved</span>
            </div>

            <div className="ksl-grid">
              {kslVideos.map((vid) => (
                <div key={vid.symptomId} className="ksl-card">
                  <div className="ksl-card__head">
                    <h3>{vid.title}</h3>
                    <span className="ksl-duration">{vid.durationSeconds}s</span>
                  </div>
                  <p className="ksl-signer">
                    <strong>Signer:</strong> {vid.signerName}
                  </p>
                  <div className="ksl-consent-status">
                    <span className="consent-badge">✓ Verified Consent Signed</span>
                    <span className="updated-date">Updated: {vid.lastUpdated}</span>
                  </div>
                  <div className="ksl-card__actions">
                    <button
                      type="button"
                      className="btn-table"
                      onClick={() => handleVerifyKslSigner(vid.symptomId)}
                    >
                      Audit Consent
                    </button>
                    <button
                      type="button"
                      className="btn-table btn-table--primary"
                      onClick={() => setNotification(`Previewing video for ${vid.title}`)}
                    >
                      Preview Clip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: ANONYMISED USAGE & ANALYTICS */}
        {activeTab === 'analytics' && (
          <section className="admin-panel">
            <div className="panel-header">
              <div>
                <h2>Anonymised Clinical Usage & System Metrics</h2>
                <p>Audited figures with zero patient identifiers (No PII stored).</p>
              </div>
              <span className="privacy-pill">HIPAA & KDPA Compliant</span>
            </div>

            <div className="metrics-cards">
              <div className="metric-box">
                <span className="metric-num">{mockUsageMetrics.dailyIntakesCount}</span>
                <span className="metric-title">Today's Total Intakes</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">3m 38s</span>
                <span className="metric-title">Avg Intake Duration</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{mockUsageMetrics.kslPromptActivationRate}%</span>
                <span className="metric-title">KSL Prompt Opt-In Rate</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{mockUsageMetrics.avgLatencyMs}ms</span>
                <span className="metric-title">Speech-to-Text Latency</span>
              </div>
            </div>

            <div className="analytics-details-grid">
              <div className="analytics-block">
                <h3>Most Frequently Selected Symptoms</h3>
                <div className="symptom-bars">
                  {mockUsageMetrics.topSymptoms.map((ts) => (
                    <div key={ts.label} className="symptom-bar-row">
                      <div className="symptom-bar-info">
                        <span>{ts.label}</span>
                        <strong>{ts.count} ({ts.percentage}%)</strong>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${ts.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-block">
                <h3>Recent Completed Intake Sessions</h3>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Time</th>
                      <th>Symptoms</th>
                      <th>Flags</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsageMetrics.recentSessions.map((row) => (
                      <tr key={row.id}>
                        <td><strong>{row.id}</strong></td>
                        <td>{row.time}</td>
                        <td>{row.symptomsCount}</td>
                        <td>{row.flaggedCount}</td>
                        <td>
                          <span className="status-completed">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
