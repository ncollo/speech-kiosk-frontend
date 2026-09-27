/**
 * Shared UI icons used across both views.
 * Every icon serves a functional purpose — no decoration.
 */

interface IconProps {
  className?: string;
}

/** Small play-in-speech-bubble indicator — shows ASL video is available. */
export const AslVideoIndicator: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path d="M4 4h12v9H9l-3 3v-3H4V4z" />
    <polygon points="9,7 9,11 12,9" />
  </svg>
);

/** Flag icon for transcript rows. */
export const FlagIcon: React.FC<IconProps & { filled?: boolean }> = ({ className, filled }) => (
  <svg className={className} viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2v12M3 2h8l-2 3 2 3H3" />
  </svg>
);

/** Microphone icon. */
export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="4" width="10" height="14" rx="5" />
    <path d="M6 14a8 8 0 0 0 16 0" />
    <line x1="14" y1="22" x2="14" y2="26" />
  </svg>
);

/** Trash / clear icon. */
export const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h16M10 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 8l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
  </svg>
);

/** Alert triangle for escalation. */
export const AlertIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4l10 18H4L14 4z" />
    <line x1="14" y1="11" x2="14" y2="16" />
    <circle cx="14" cy="19" r="0.5" fill="currentColor" />
  </svg>
);
