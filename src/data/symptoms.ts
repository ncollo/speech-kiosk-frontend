import type { SymptomOption } from '../types';

export const symptomOptions: SymptomOption[] = [
  { id: 'chest-pain',        label: 'Chest Pain',          iconKey: 'chest-pain',        hasAslVideo: true },
  { id: 'shortness-breath',  label: 'Shortness of Breath', iconKey: 'shortness-breath',  hasAslVideo: true },
  { id: 'nausea',            label: 'Nausea / Vomiting',   iconKey: 'nausea',            hasAslVideo: true },
  { id: 'dizziness',         label: 'Dizziness',           iconKey: 'dizziness',         hasAslVideo: true },
  { id: 'headache',          label: 'Headache',            iconKey: 'headache',          hasAslVideo: true },
  { id: 'fever',             label: 'Fever / Chills',      iconKey: 'fever',             hasAslVideo: true },
  { id: 'abdominal',         label: 'Abdominal Pain',      iconKey: 'abdominal',         hasAslVideo: true },
  { id: 'swelling',          label: 'Swelling',            iconKey: 'swelling',          hasAslVideo: true },
  { id: 'fatigue',           label: 'Fatigue',             iconKey: 'fatigue',           hasAslVideo: true },
  { id: 'other',             label: 'Other Concern',       iconKey: 'other',             hasAslVideo: true },
];
