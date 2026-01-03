import type { PaymentData, ParseResult } from './types';
import { SERVICE_TAG, SCT_ID, EPC_LINES } from './constants';

function parseError(error: string): ParseResult {
  return { valid: false, error };
}

export function parse(qrString: string): ParseResult {
  if (!qrString || typeof qrString !== 'string') {
    return parseError('Input is empty or not a string');
  }

  const lines = qrString.split('\n');

  if (lines.length < 7) {
    return parseError('Invalid EPC format: insufficient data');
  }

  if (lines[EPC_LINES.SERVICE_TAG] !== SERVICE_TAG) {
    return parseError(
      `Invalid EPC format: expected service tag "${SERVICE_TAG}"`
    );
  }

  const version = lines[EPC_LINES.VERSION];
  if (version !== '001' && version !== '002') {
    return parseError(`Invalid EPC version: ${version}`);
  }

  const encoding = lines[EPC_LINES.ENCODING];
  if (encoding !== '1' && encoding !== '2') {
    return parseError(`Invalid encoding identifier: ${encoding}`);
  }

  if (lines[EPC_LINES.SCT_ID] !== SCT_ID) {
    return parseError(`Invalid identification code: expected "${SCT_ID}"`);
  }

  const bic = lines[EPC_LINES.BIC] || undefined;
  const recipient = lines[EPC_LINES.RECIPIENT];
  const iban = lines[EPC_LINES.IBAN];

  if (!recipient) {
    return parseError('Invalid EPC format: missing recipient');
  }

  if (!iban) {
    return parseError('Invalid EPC format: missing IBAN');
  }

  let amount: number | undefined;
  if (lines[EPC_LINES.AMOUNT]) {
    const amountMatch = lines[EPC_LINES.AMOUNT].match(
      /^EUR(\d+(?:\.\d{1,2})?)$/
    );
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }
  }

  const structuredRef = lines[EPC_LINES.STRUCTURED_REF] || '';
  const unstructuredRef = lines[EPC_LINES.UNSTRUCTURED_REF] || '';
  const reference = structuredRef || unstructuredRef || undefined;
  const message = lines[EPC_LINES.MESSAGE] || undefined;

  const data: PaymentData = {
    recipient,
    iban,
    ...(bic && { bic }),
    ...(amount !== undefined && { amount }),
    ...(reference && { reference }),
    ...(message && { message }),
  };

  return { valid: true, data };
}

export function isEpcQR(qrString: string): boolean {
  if (!qrString || typeof qrString !== 'string') return false;

  const lines = qrString.split('\n');

  if (lines.length < 4) return false;

  const version = lines[EPC_LINES.VERSION];
  const isValidVersion = version === '001' || version === '002';

  return (
    lines[EPC_LINES.SERVICE_TAG] === SERVICE_TAG &&
    isValidVersion &&
    lines[EPC_LINES.SCT_ID] === SCT_ID
  );
}
