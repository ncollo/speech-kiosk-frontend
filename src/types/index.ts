/** Which top-level view the kiosk is showing. */
export type ViewMode = 'patient' | 'clinician';

/** Connection / listening state shown in the status strip. */
export type ConnectionStatus = 'listening' | 'reconnecting' | 'disconnected';

/** A single symptom option card in the patient view. */
export interface SymptomOption {
  id: string;
  label: string;
  /** Key into the icon map — must match an entry in SymptomIcons. */
  iconKey: string;
  /** Whether an ASL video is available for this symptom. */
  hasAslVideo: boolean;
}

/** A single line in the clinician transcript log. */
export interface TranscriptEntry {
  id: string;
  time: string;
  text: string;
  isFlagged: boolean;
}

/** Live caption state for the patient view. */
export interface CaptionState {
  previousText: string;
  currentText: string;
}
