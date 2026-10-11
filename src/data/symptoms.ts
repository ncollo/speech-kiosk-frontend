import type { SymptomOption } from '../types';

export const symptomOptions: SymptomOption[] = [
  { id: 'chest-pain',        label: 'Chest Pain',          labelSwahili: 'Maumivu ya Kifua',   iconKey: 'chest-pain',        hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'emergency' },
  { id: 'shortness-breath',  label: 'Shortness of Breath', labelSwahili: 'Pumzi Fupi',          iconKey: 'shortness-breath',  hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'emergency' },
  { id: 'nausea',            label: 'Nausea / Vomiting',   labelSwahili: 'Kichefuchefu / Kutapika', iconKey: 'nausea',        hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'routine' },
  { id: 'dizziness',         label: 'Dizziness',           labelSwahili: 'Kizunguzungu',       iconKey: 'dizziness',         hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'urgent' },
  { id: 'headache',          label: 'Headache',            labelSwahili: 'Kuumwa na Kichwa',   iconKey: 'headache',          hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'urgent' },
  { id: 'fever',             label: 'Fever / Chills',      labelSwahili: 'Homa / Kutetemeka',  iconKey: 'fever',             hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'urgent' },
  { id: 'abdominal',         label: 'Abdominal Pain',      labelSwahili: 'Maumivu ya Tumbo',   iconKey: 'abdominal',         hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'urgent' },
  { id: 'swelling',          label: 'Swelling',            labelSwahili: 'Kuvimba Mwili',      iconKey: 'swelling',          hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'routine' },
  { id: 'fatigue',           label: 'Fatigue',             labelSwahili: 'Uchovu Mkubwa',      iconKey: 'fatigue',           hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'routine' },
  { id: 'other',             label: 'Other Concern',       labelSwahili: 'Shida Nyingine',     iconKey: 'other',             hasAslVideo: true, hasKslVideo: true, urgencyLevel: 'routine' },
];
