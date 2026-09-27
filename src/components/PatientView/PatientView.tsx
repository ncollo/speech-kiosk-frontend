import { useState } from 'react';
import type { CaptionState, ConnectionStatus, SymptomOption } from '../../types';
import CaptionHeader from './CaptionHeader';
import CaptionArea from './CaptionArea';
import ConcernSection from './ConcernSection';
import StatusStrip from './StatusStrip';
import './PatientView.css';

interface PatientViewProps {
  captions: CaptionState;
  symptoms: SymptomOption[];
  connectionStatus: ConnectionStatus;
  sessionMinutes: number;
  facilityName: string;
  department: string;
}

export default function PatientView({
  captions,
  symptoms,
  connectionStatus,
  sessionMinutes,
  facilityName,
  department,
}: PatientViewProps) {
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>('chest-pain');

  return (
    <main className="view" id="view-patient" role="tabpanel" aria-labelledby="tab-patient">
      <CaptionHeader facilityName={facilityName} department={department} />
      <CaptionArea captions={captions} />
      <ConcernSection
        symptoms={symptoms}
        selectedId={selectedSymptomId}
        onSelect={setSelectedSymptomId}
      />
      <StatusStrip status={connectionStatus} sessionMinutes={sessionMinutes} />
    </main>
  );
}
