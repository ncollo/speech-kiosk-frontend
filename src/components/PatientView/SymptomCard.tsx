import type { SymptomOption } from '../../types';
import { getSymptomIcon } from '../icons/SymptomIcons';
import { AslVideoIndicator } from '../icons/UIIcons';
import './SymptomCard.css';

interface SymptomCardProps {
  symptom: SymptomOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function SymptomCard({ symptom, isSelected, onSelect }: SymptomCardProps) {
  const Icon = getSymptomIcon(symptom.iconKey);

  return (
    <button
      className={`symptom-card ${isSelected ? 'symptom-card--selected' : ''}`}
      role="option"
      aria-selected={isSelected}
      id={`card-${symptom.id}`}
      onClick={() => onSelect(symptom.id)}
    >
      <div className="card-icon" aria-hidden="true">
        {Icon && <Icon />}
      </div>
      <span className="card-label">{symptom.label}</span>
      {symptom.hasAslVideo && (
        <span
          className="card-asl"
          aria-label="Sign language video available"
          title="Tap for sign language video"
        >
          <AslVideoIndicator />
        </span>
      )}
    </button>
  );
}
