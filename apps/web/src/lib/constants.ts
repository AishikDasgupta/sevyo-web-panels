import type { CaregiverType } from '@sevyo/shared-types';

export const CAREGIVER_TYPE_LABELS: Record<CaregiverType, string> = {
  nurse: 'Nurse',
  caregiver: 'Caregiver',
  physiotherapist: 'Physiotherapist',
  lab: 'Lab',
  mental_health: 'Mental Health',
  elder_care: 'Elder Care',
  pediatric: 'Pediatric',
};

export const CAREGIVER_TYPE_OPTIONS = Object.entries(CAREGIVER_TYPE_LABELS) as Array<[CaregiverType, string]>;

export function caregiverTypeLabel(type: CaregiverType): string {
  return CAREGIVER_TYPE_LABELS[type] ?? type;
}

const EMOJI_RULES: Array<[RegExp, string]> = [
  [/iv|injection|albumin|antibiotic/i, '💉'],
  [/dressing|suture|bedsore|wound/i, '🩹'],
  [/electrolyte|multi[\s-]?vitamin|vitamin/i, '💧'],
  [/foley|ryle|enema|catheter/i, '🌬️'],
  [/physio|therapy/i, '💪'],
  [/mental|psych|depression/i, '🧠'],
  [/lab|test|blood/i, '🧪'],
  [/attendant|caregiver|nurse/i, '🩺'],
];

export function serviceEmoji(name: string | null | undefined): string {
  if (!name) return '🩺';
  for (const [rule, emoji] of EMOJI_RULES) {
    if (rule.test(name)) return emoji;
  }
  return '🩺';
}