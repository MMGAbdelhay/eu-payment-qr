// ===================
// EPC QR Format
// ===================
export const SERVICE_TAG = 'BCD';
export const SCT_ID = 'SCT';

export const VERSIONS = {
  '001': '001',
  '002': '002',
};

export const ENCODINGS = {
  'UTF-8': '1',
  'ISO-8859-1': '2',
};

// ===================
// EPC Line Indices
// ===================
export const EPC_LINES = {
  SERVICE_TAG: 0,
  VERSION: 1,
  ENCODING: 2,
  SCT_ID: 3,
  BIC: 4,
  RECIPIENT: 5,
  IBAN: 6,
  AMOUNT: 7,
  PURPOSE_CODE: 8,
  STRUCTURED_REF: 9,
  UNSTRUCTURED_REF: 10,
  MESSAGE: 11,
};

// ===================
// Validation Limits
// ===================
export const MAX_RECIPIENT_LENGTH = 70;
export const MAX_AMOUNT = 999999999.99;
export const MAX_REFERENCE_LENGTH = 35;
export const MAX_MESSAGE_LENGTH = 140;

// ===================
// SEPA Countries
// ===================
export const SEPA_COUNTRIES: Record<string, number> = {
  AT: 20,
  BE: 16,
  BG: 22,
  HR: 21,
  CY: 28,
  CZ: 24,
  DK: 18,
  EE: 20,
  FI: 18,
  FR: 27,
  DE: 22,
  GR: 27,
  HU: 28,
  IE: 22,
  IT: 27,
  LV: 21,
  LT: 20,
  LU: 20,
  MT: 31,
  NL: 18,
  PL: 28,
  PT: 25,
  RO: 24,
  SK: 24,
  SI: 19,
  ES: 24,
  SE: 24,
  CH: 21,
  GB: 22,
  IS: 26,
  LI: 21,
  NO: 15,
  MC: 27,
  SM: 27,
  AD: 24,
  VA: 22,
};

// ===================
// Helpers
// ===================
export function cleanString(value: string | undefined): string {
  return (value || '').replace(/\s/g, '').toUpperCase();
}
