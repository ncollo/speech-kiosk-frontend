import { useState, useCallback } from 'react';
import type { ViewMode, CaptionState, TranscriptEntry } from '../../types';
import TabBar from '../TabBar/TabBar';
import PatientView from '../PatientView/PatientView';
import ClinicianView from '../ClinicianView/ClinicianView';
import { symptomOptions } from '../../data/symptoms';
import { initialTranscript } from '../../data/transcripts';
import '../../App.css';

const defaultCaptions: CaptionState = {
  previousText: 'Can you tell me when this started?',
  currentText: 'It started around eight AM, after I had breakfast.',
};

export default function KioskShell() {
  const [activeView, setActiveView] = useState<ViewMode>('patient');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(initialTranscript);

  const handleToggleFlag = useCallback((id: string) => {
    setTranscript((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, isFlagged: !entry.isFlagged } : entry
      )
    );
  }, []);

  return (
    <div className="kiosk-wrapper">
      <div className="kiosk-shell">
        <TabBar activeView={activeView} onViewChange={setActiveView} />

        {activeView === 'patient' ? (
          <PatientView
            captions={defaultCaptions}
            symptoms={symptomOptions}
            connectionStatus="listening"
            sessionMinutes={4}
            facilityName="St. Mary's Medical Center"
            department="Reception"
          />
        ) : (
          <ClinicianView entries={transcript} onToggleFlag={handleToggleFlag} />
        )}
      </div>
    </div>
  );
}
