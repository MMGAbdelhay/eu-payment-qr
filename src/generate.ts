import type { PaymentData, GenerateOptions } from './types';
import { EpcError } from './errors';
import { validate } from './validate';
import {
  SERVICE_TAG,
  SCT_ID,
  VERSIONS,
  ENCODINGS,
  cleanString,
} from './constants';

export function generate(data: PaymentData, options: GenerateOptions = {}) {
  const validation = validate(data);

  if (!validation.valid) {
    const err = validation.errors[0];

    throw new EpcError(err.message, err.code, err.field);
  }

  const version = options.version || '002';
  const encoding = options.encoding || 'UTF-8';
  const cleanIban = cleanString(data.iban);
  const cleanBic = cleanString(data.bic);
  const isStructuredRef = data.reference?.toUpperCase().startsWith('RF');
  const formattedAmount =
    data.amount !== undefined ? `EUR${data.amount.toFixed(2)}` : '';

  const lines = [
    SERVICE_TAG,
    VERSIONS[version],
    ENCODINGS[encoding],
    SCT_ID,
    cleanBic,
    data.recipient.trim(),
    cleanIban,
    formattedAmount,
    '', // purpose code
    isStructuredRef ? data.reference || '' : '',
    !isStructuredRef ? data.reference || '' : '',
    data.message || '',
  ];

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}
