import type { CaptionState } from '../../types';
import './CaptionArea.css';

interface CaptionAreaProps {
  captions: CaptionState;
}

export default function CaptionArea({ captions }: CaptionAreaProps) {
  return (
    <section
      className="caption-area"
      aria-live="polite"
      aria-atomic={false}
      aria-label="Live captions of clinician speech"
    >
      {captions.previousText && (
        <p className="caption-prev" aria-label="Previous question">
          {captions.previousText}
        </p>
      )}
      <p className="caption-current" aria-label="Current speech">
        {captions.currentText}
      </p>
      <p className="caption-helper">
        The receptionist's speech will appear here. You can also tap a card
        below to indicate your concern.
      </p>
    </section>
  );
}
