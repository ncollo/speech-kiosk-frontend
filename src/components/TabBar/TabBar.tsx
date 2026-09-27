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
      <Link to="/" className="tab-bar__back" title="Return to Landing Page">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M15 10H5M10 15l-5-5 5-5" />
        </svg>
        Overview
      </Link>
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
    </nav>
  );
}
