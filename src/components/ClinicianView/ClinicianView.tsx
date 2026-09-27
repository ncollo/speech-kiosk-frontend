import type { TranscriptEntry } from '../../types';
import TranscriptLog from './TranscriptLog';
import ControlsPanel from './ControlsPanel';
import './ClinicianView.css';

interface ClinicianViewProps {
  entries: TranscriptEntry[];
  onToggleFlag: (id: string) => void;
}

export default function ClinicianView({ entries, onToggleFlag }: ClinicianViewProps) {
  return (
    <div
      className="view clinician-layout"
      id="view-clinician"
      role="tabpanel"
      aria-labelledby="tab-clinician"
    >
      <TranscriptLog entries={entries} onToggleFlag={onToggleFlag} />
      <ControlsPanel entries={entries} />
    </div>
  );
}
