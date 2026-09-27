import type { SymptomOption } from '../../types';
import SymptomCard from './SymptomCard';
import './ConcernSection.css';

interface ConcernSectionProps {
  symptoms: SymptomOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConcernSection({ symptoms, selectedId, onSelect }: ConcernSectionProps) {
  return (
    <section className="concern-section" aria-label="Symptom selection">
      <h2 className="concern-heading">My concern is — tap to select</h2>
      <div className="card-grid" role="listbox" aria-label="Symptom options">
        {symptoms.map((symptom) => (
          <SymptomCard
            key={symptom.id}
            symptom={symptom}
            isSelected={selectedId === symptom.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
