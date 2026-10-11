import type { ClinicianStaff, KslVideoItem, UsageMetrics } from '../types';

export const mockStaffMembers: ClinicianStaff[] = [
  { id: 'ST-402', name: 'Nurse Kiprono', role: 'Emergency Intake Nurse', pin: '1234', deskNumber: 'Desk 2' },
  { id: 'ST-408', name: 'Nurse Wanjiku', role: 'Triage Receptionist', pin: '5678', deskNumber: 'Desk 1' },
  { id: 'ST-415', name: 'Dr. Omondi', role: 'Attending Physician', pin: '9900', deskNumber: 'Consultation A' },
  { id: 'ST-001', name: 'Duty Desk #1', role: 'General Intake Terminal', pin: '0000', deskNumber: 'Desk 1' },
];

export const mockKslVideos: KslVideoItem[] = [
  {
    symptomId: 'chest-pain',
    title: 'KSL: Chest Pain / Tightness',
    signerName: 'Jane Otieno (Certified KSL Medical Interpreter)',
    signerConsentVerified: true,
    durationSeconds: 12,
    fileSizeMb: 4.8,
    videoUrl: '/ksl/chest-pain-ksl.mp4',
    lastUpdated: '2026-09-15',
  },
  {
    symptomId: 'shortness-breath',
    title: 'KSL: Shortness of Breath / Breathing Difficulty',
    signerName: 'David Mutua (Kenya National Deaf Association)',
    signerConsentVerified: true,
    durationSeconds: 14,
    fileSizeMb: 5.2,
    videoUrl: '/ksl/shortness-breath-ksl.mp4',
    lastUpdated: '2026-09-18',
  },
  {
    symptomId: 'fever',
    title: 'KSL: High Fever / Body Chills',
    signerName: 'Jane Otieno (Certified KSL Medical Interpreter)',
    signerConsentVerified: true,
    durationSeconds: 10,
    fileSizeMb: 3.9,
    videoUrl: '/ksl/fever-chills-ksl.mp4',
    lastUpdated: '2026-09-15',
  },
  {
    symptomId: 'headache',
    title: 'KSL: Severe Headache / Migraine',
    signerName: 'Faith Chebet (KSL Health Access Fellow)',
    signerConsentVerified: true,
    durationSeconds: 11,
    fileSizeMb: 4.1,
    videoUrl: '/ksl/headache-ksl.mp4',
    lastUpdated: '2026-09-20',
  },
  {
    symptomId: 'dizziness',
    title: 'KSL: Dizziness / Loss of Balance',
    signerName: 'David Mutua (Kenya National Deaf Association)',
    signerConsentVerified: true,
    durationSeconds: 9,
    fileSizeMb: 3.4,
    videoUrl: '/ksl/dizziness-ksl.mp4',
    lastUpdated: '2026-09-22',
  },
  {
    symptomId: 'abdominal',
    title: 'KSL: Abdominal Cramps / Stomach Ache',
    signerName: 'Jane Otieno (Certified KSL Medical Interpreter)',
    signerConsentVerified: true,
    durationSeconds: 13,
    fileSizeMb: 4.6,
    videoUrl: '/ksl/abdominal-ksl.mp4',
    lastUpdated: '2026-09-21',
  },
];

export const mockUsageMetrics: UsageMetrics = {
  dailyIntakesCount: 38,
  avgIntakeDurationSec: 218,
  kslPromptActivationRate: 71,
  avgLatencyMs: 184,
  topSymptoms: [
    { label: 'Chest Pain', count: 14, percentage: 37 },
    { label: 'Fever / Chills', count: 11, percentage: 29 },
    { label: 'Shortness of Breath', count: 8, percentage: 21 },
    { label: 'Dizziness', count: 5, percentage: 13 },
  ],
  recentSessions: [
    { id: 'SM-9021', time: '14:48', symptomsCount: 2, flaggedCount: 2, status: 'Handed Off' },
    { id: 'SM-9020', time: '14:32', symptomsCount: 1, flaggedCount: 1, status: 'Completed' },
    { id: 'SM-9019', time: '14:05', symptomsCount: 3, flaggedCount: 3, status: 'Interpreter Dispatched' },
    { id: 'SM-9018', time: '13:40', symptomsCount: 1, flaggedCount: 0, status: 'Completed' },
    { id: 'SM-9017', time: '13:12', symptomsCount: 2, flaggedCount: 1, status: 'Handed Off' },
  ],
};
