/** Which top-level view the kiosk is showing. */
export type ViewMode = 'patient' | 'clinician';

/** Connection / listening state shown in the status strip. */
export type ConnectionStatus = 'listening' | 'reconnecting' | 'disconnected';

/** Text size preference for patient captioning. */
export type TextSizePreference = 'standard' | 'large' | 'xlarge';

/** Patient onboarding accessibility preferences. */
export interface ConsentPreferences {
  textSize: TextSizePreference;
  enableKslPrompts: boolean;
  language: 'en' | 'sw';
}

/** A single symptom option card in the patient view. */
export interface SymptomOption {
  id: string;
  label: string;
  labelSwahili?: string;
  iconKey: string;
  hasAslVideo: boolean;
  hasKslVideo?: boolean;
  urgencyLevel?: 'routine' | 'urgent' | 'emergency';
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

/** Clinician staff credential for quick PIN unlock. */
export interface ClinicianStaff {
  id: string;
  name: string;
  role: string;
  pin: string;
  deskNumber: string;
}

/** Kenya Sign Language video asset item. */
export interface KslVideoItem {
  symptomId: string;
  title: string;
  signerName: string;
  signerConsentVerified: boolean;
  durationSeconds: number;
  fileSizeMb: number;
  videoUrl: string;
  lastUpdated: string;
}

/** Anonymised clinical metrics for admin dashboard. */
export interface UsageMetrics {
  dailyIntakesCount: number;
  avgIntakeDurationSec: number;
  kslPromptActivationRate: number;
  avgLatencyMs: number;
  topSymptoms: { label: string; count: number; percentage: number }[];
  recentSessions: { id: string; time: string; symptomsCount: number; flaggedCount: number; status: string }[];
}
