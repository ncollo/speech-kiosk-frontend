import { Link } from 'react-router-dom';
import type { ViewMode } from '../../types';
import './TabBar.css';

interface TabBarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function TabBar({ activeView, onViewChange }: TabBarProps) {
  return (
    <nav className="tab-bar" role="tablist" aria-label="View selector">
      <div className="tab-bar__left">
        <Link to="/" className="tab-bar__link" title="Return to Landing Page">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <path d="M15 10H5M10 15l-5-5 5-5" />
          </svg>
          Overview
        </Link>
        <Link to="/welcome" className="tab-bar__link" title="Patient Welcome & Consent Screen">
          Welcome Screen
        </Link>
      </div>

      <div className="tab-bar__tabs">
        <button
          className={`tab ${activeView === 'patient' ? 'tab--active' : ''}`}
          role="tab"
          aria-selected={activeView === 'patient'}
          aria-controls="view-patient"
          onClick={() => onViewChange('patient')}
        >
          Patient View
        </button>
        <button
          className={`tab ${activeView === 'clinician' ? 'tab--active' : ''}`}
          role="tab"
          aria-selected={activeView === 'clinician'}
          aria-controls="view-clinician"
          onClick={() => onViewChange('clinician')}
        >
          Clinician View
        </button>
      </div>

      <div className="tab-bar__right">
        <Link to="/clinician/unlock" className="tab-bar__link" title="Staff PIN Unlock">
          PIN Unlock
        </Link>
        <Link to="/summary" className="tab-bar__link" title="Triage Session Summary">
          Summary
        </Link>
        <Link to="/admin" className="tab-bar__link tab-bar__link--admin" title="Hospital Admin Portal">
          Admin Portal
        </Link>
      </div>
    </nav>
  );
}
