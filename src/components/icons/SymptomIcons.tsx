/**
 * Functional SVG icons for each symptom card.
 * Every icon is a purposeful visual — no decoration without function.
 */

interface IconProps {
  className?: string;
}

const iconMap: Record<string, React.FC<IconProps>> = {
  'chest-pain': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 28S4 20 4 12a6 6 0 0 1 12 0 6 6 0 0 1 12 0c0 8-12 16-12 16z" />
    </svg>
  ),

  'shortness-breath': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="16" cy="16" rx="7" ry="10" />
      <path d="M11 12c2 2 6 2 10 0" />
      <path d="M11 18c2-2 6-2 10 0" />
    </svg>
  ),

  'nausea': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18c2-3 4-3 6 0s4 3 6 0s4 3 6 0" />
      <ellipse cx="16" cy="12" rx="8" ry="5" />
    </svg>
  ),

  'dizziness': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="10" />
      <path d="M16 6a6 6 0 0 1 0 12 4 4 0 0 0 0 8" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  ),

  'headache': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="14" r="9" />
      <path d="M7 14v6" />
      <path d="M25 14v6" />
      <path d="M10 8l-2-3" />
      <path d="M22 8l2-3" />
      <path d="M16 5V2" />
    </svg>
  ),

  'fever': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="4" width="6" height="22" rx="3" />
      <circle cx="16" cy="23" r="4" />
      <line x1="21" y1="10" x2="24" y2="10" />
      <line x1="21" y1="14" x2="24" y2="14" />
      <line x1="21" y1="18" x2="24" y2="18" />
    </svg>
  ),

  'abdominal': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="16" cy="18" rx="9" ry="7" />
      <path d="M12 16v4" />
      <path d="M16 15v5" />
      <path d="M20 16v4" />
    </svg>
  ),

  'swelling': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="6" />
      <circle cx="16" cy="16" r="10" strokeDasharray="4 3" />
      <path d="M16 6v-2M16 28v-2M6 16H4M28 16h-2" />
    </svg>
  ),

  'fatigue': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="12" width="20" height="12" rx="2" />
      <rect x="22" y="16" width="4" height="4" rx="1" />
      <line x1="10" y1="18" x2="18" y2="18" />
    </svg>
  ),

  'other': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16" y1="8" x2="16" y2="24" />
      <line x1="8" y1="16" x2="24" y2="16" />
    </svg>
  ),
};

export function getSymptomIcon(key: string): React.FC<IconProps> | null {
  return iconMap[key] ?? null;
}
