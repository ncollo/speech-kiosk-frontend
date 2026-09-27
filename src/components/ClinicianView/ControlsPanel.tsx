import type { TranscriptEntry } from '../../types';
import { MicrophoneIcon, TrashIcon, AlertIcon } from '../icons/UIIcons';
import './ControlsPanel.css';

interface ControlsPanelProps {
  entries: TranscriptEntry[];
}

export default function ControlsPanel({ entries }: ControlsPanelProps) {
  const flaggedCount = entries.filter((e) => e.isFlagged).length;

  return (
    <aside className="controls-col" aria-label="Session controls">
      <h2 className="controls-heading">Controls</h2>

      <button className="control-btn" id="btn-mute">
        <span className="control-btn__icon" aria-hidden="true">
          <MicrophoneIcon />
        </span>
        <span className="control-btn__text">
          <strong>Mute Microphone</strong>
          <small>Currently capturing</small>
        </span>
      </button>

      <button className="control-btn" id="btn-clear">
        <span className="control-btn__icon" aria-hidden="true">
          <TrashIcon />
        </span>
        <span className="control-btn__text">
          <strong>Clear Transcript</strong>
          <small>Remove all entries</small>
        </span>
      </button>

      <button className="control-btn control-btn--escalate" id="btn-escalate">
        <span className="control-btn__icon" aria-hidden="true">
          <AlertIcon />
        </span>
        <span className="control-btn__text">
          <strong>Escalate to Triage</strong>
          <small>Alert clinical staff</small>
        </span>
      </button>

      {/* Session status panel */}
      <div className="session-panel" aria-label="Session status">
        <h3 className="session-panel__heading">Session Status</h3>
        <dl className="session-panel__list">
          <div className="session-panel__row">
            <dt>Microphone</dt>
            <dd className="session-val--active">Active</dd>
          </div>
          <div className="session-panel__row">
            <dt>Captions</dt>
            <dd className="session-val--live">Live</dd>
          </div>
          <div className="session-panel__row">
            <dt>Transcript</dt>
            <dd className="session-val--info">{entries.length} entries</dd>
          </div>
          <div className="session-panel__row">
            <dt>Flagged</dt>
            <dd className="session-val--flagged">{flaggedCount} items</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
