import type { TranscriptEntry } from '../../types';
import { FlagIcon } from '../icons/UIIcons';
import './TranscriptRow.css';

interface TranscriptRowProps {
  entry: TranscriptEntry;
  onToggleFlag: (id: string) => void;
}

export default function TranscriptRow({ entry, onToggleFlag }: TranscriptRowProps) {
  return (
    <div
      className={`transcript-row ${entry.isFlagged ? 'transcript-row--flagged' : ''}`}
      onClick={() => onToggleFlag(entry.id)}
      style={{ cursor: 'pointer' }}
    >
      <time className="transcript-time">{entry.time}</time>
      <p className="transcript-text">
        {entry.isFlagged ? <strong>{entry.text}</strong> : entry.text}
      </p>
      <button
        className={`transcript-flag ${entry.isFlagged ? 'transcript-flag--active' : ''}`}
        aria-label={entry.isFlagged ? 'Unflag this entry' : 'Flag this entry'}
        aria-pressed={entry.isFlagged}
        title={entry.isFlagged ? 'Flagged' : 'Flag'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFlag(entry.id);
        }}
      >
        <FlagIcon filled={entry.isFlagged} />
      </button>
    </div>
  );
}
