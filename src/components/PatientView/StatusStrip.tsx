import type { ConnectionStatus } from '../../types';
import './StatusStrip.css';

interface StatusStripProps {
  status: ConnectionStatus;
  sessionMinutes: number;
}

const statusLabels: Record<ConnectionStatus, string> = {
  listening: 'Listening',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
};

export default function StatusStrip({ status, sessionMinutes }: StatusStripProps) {
  return (
    <footer className="status-strip" aria-live="polite" aria-label="Connection status">
      <span
        className={`status-dot ${
          status === 'listening'
            ? 'status-dot--connected'
            : status === 'reconnecting'
            ? 'status-dot--reconnecting'
            : 'status-dot--disconnected'
        }`}
        aria-hidden="true"
      />
      <span className="status-text">{statusLabels[status]}</span>
      <span className="status-separator" aria-hidden="true">·</span>
      <span className="status-session">Session active — {sessionMinutes} min</span>
    </footer>
  );
}
