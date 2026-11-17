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

/** Sevyo support contact details (single source for floating widgets & footers). */
export const CONTACT_PHONE = '+919876543210';
export const WHATSAPP_NUMBER = '919876543210';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Sevyo, I need help with a booking.')}`;

/**
 * Caregiver types whose visits can happen on-site (clinic, office, lab, gym)
 * in addition to at home. Other services are delivered at home only.
 * (Equipment providers are not a bookable caregiver type yet.)
 */
export const SITE_ELIGIBLE_TYPES: ReadonlySet<CaregiverType> = new Set(['physiotherapist', 'lab', 'mental_health']);

/**
 * The six care categories shown on the landing and about pages.
 * `site: true` categories can be booked at home or at site; the rest are
 * delivered at home only. Booking eligibility is governed by SITE_ELIGIBLE_TYPES.
 */
export const CARE_SERVICES = [
  { icon: '🤲', label: 'Attendants', desc: 'Personal care attendants for daily assistance', site: false },
  { icon: '🏥', label: 'Nurses', desc: 'Licensed registered nurses for medical care', site: false },
  { icon: '💪', label: 'Physiotherapists', desc: 'Physical therapy and rehabilitation', site: true },
  { icon: '🧠', label: 'Mental Health', desc: 'Emotional and psychological support', site: true },
  { icon: '🧪', label: 'Labs', desc: 'Lab tests and home sample collection', site: true },
  { icon: '🛠️', label: 'Equipment Providers', desc: 'Medical equipment supply and support', site: true },
] as const;

/** Indian emergency numbers shown in the public SOS pop-up. */
export const EMERGENCY_NUMBERS: ReadonlyArray<{ number: string; label: string }> = [
  { number: '112', label: 'National Emergency (ambulance · police · fire)' },
  { number: '108', label: 'Ambulance' },
  { number: '102', label: 'Patient transport / ambulance' },
  { number: '14416', label: 'Tele-MANAS Mental Health' },
  { number: '100', label: 'Police' },
  { number: '101', label: 'Fire' },
  { number: '181', label: 'Women Helpline' },
  { number: '1098', label: 'Childline' },
];

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