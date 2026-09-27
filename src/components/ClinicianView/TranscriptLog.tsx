import type { TranscriptEntry } from '../../types';
import TranscriptRow from './TranscriptRow';
import './TranscriptLog.css';

interface TranscriptLogProps {
  entries: TranscriptEntry[];
  onToggleFlag: (id: string) => void;
}

export default function TranscriptLog({ entries, onToggleFlag }: TranscriptLogProps) {
  const flaggedCount = entries.filter((e) => e.isFlagged).length;

  return (
    <section className="transcript-col" aria-label="Transcript log">
      <div className="transcript-header">
        <div className="transcript-header__left">
          <span className="pulse-dot" aria-hidden="true" />
          <span className="transcript-header__label">Transcript Log</span>
          <span className="transcript-badge">{entries.length} entries</span>
          <span className="transcript-badge transcript-badge--flagged">
            {flaggedCount} flagged
          </span>
        </div>
        <span className="transcript-header__hint">Tap row to flag / unflag</span>
      </div>

      <div className="transcript-list" role="log" aria-label="Transcript entries">
        {entries.map((entry) => (
          <TranscriptRow key={entry.id} entry={entry} onToggleFlag={onToggleFlag} />
        ))}
      </div>
    </section>
  );
}
