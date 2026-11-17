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
  return CAREGIVER_TYPE_LABELS[type] ?? type.replace('_', ' ');
}