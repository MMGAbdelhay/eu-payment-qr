import type {
  PaymentData,
  ValidationResult,
  ValidationError,
  ErrorCode,
} from './types';
import {
  SEPA_COUNTRIES,
  MAX_RECIPIENT_LENGTH,
  MAX_AMOUNT,
  MAX_REFERENCE_LENGTH,
  MAX_MESSAGE_LENGTH,
  cleanString,
} from './constants';

function err(props: {
  field: string;
  message: string;
  code: ErrorCode;
}): ValidationError {
  return props;
}

export function validate(data: PaymentData): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.recipient || data.recipient.trim().length === 0) {
    errors.push(
      err({
        field: 'recipient',
        message: 'Recipient is required',
        code: 'RECIPIENT_REQUIRED',
      })
    );
  } else if (data.recipient.length > MAX_RECIPIENT_LENGTH) {
    errors.push(
      err({
        field: 'recipient',
        message: `Recipient must be ${MAX_RECIPIENT_LENGTH} characters or less`,
        code: 'RECIPIENT_TOO_LONG',
      })
    );
  }

  if (!data.iban || data.iban.trim().length === 0) {
    errors.push(
      err({ field: 'iban', message: 'IBAN is required', code: 'IBAN_REQUIRED' })
    );
  } else {
    const ibanResult = validateIBAN(data.iban);

    if (!ibanResult.valid && ibanResult.error) {
      errors.push(ibanResult.error);
    }
  }

  if (data.bic) {
    const bicResult = validateBIC(data.bic);

    if (!bicResult.valid && bicResult.error) {
      errors.push(bicResult.error);
    }
  }

  if (data.amount !== undefined) {
    if (
      typeof data.amount !== 'number' ||
      isNaN(data.amount) ||
      data.amount < 0
    ) {
      errors.push(
        err({
          field: 'amount',
          message: 'Amount must be a positive number',
          code: 'AMOUNT_INVALID',
        })
      );
    } else if (data.amount > MAX_AMOUNT) {
      errors.push(
        err({
          field: 'amount',
          message: `Amount must not exceed ${MAX_AMOUNT}`,
          code: 'AMOUNT_TOO_LARGE',
        })
      );
    }
  }

  if (data.reference && data.reference.length > MAX_REFERENCE_LENGTH) {
    errors.push(
      err({
        field: 'reference',
        message: `Reference must be ${MAX_REFERENCE_LENGTH} characters or less`,
        code: 'REFERENCE_TOO_LONG',
      })
    );
  }

  if (data.message && data.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(
      err({
        field: 'message',
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or less`,
        code: 'MESSAGE_TOO_LONG',
      })
    );
  }

  return { valid: errors.length === 0, errors };
}

export function validateIBAN(iban: string): {
  valid: boolean;
  error?: ValidationError;
} {
  const cleaned = cleanString(iban);

  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    return {
      valid: false,
      error: err({
        field: 'iban',
        message: 'IBAN format is invalid',
        code: 'IBAN_INVALID_FORMAT',
      }),
    };
  }

  const countryCode = cleaned.substring(0, 2);

  if (!(countryCode in SEPA_COUNTRIES)) {
    return {
      valid: false,
      error: err({
        field: 'iban',
        message: `Country code ${countryCode} is not a SEPA country`,
        code: 'IBAN_INVALID_COUNTRY',
      }),
    };
  }

  const expectedLength = SEPA_COUNTRIES[countryCode];
  if (cleaned.length !== expectedLength) {
    return {
      valid: false,
      error: err({
        field: 'iban',
        message: `IBAN for ${countryCode} must be ${expectedLength} characters`,
        code: 'IBAN_INVALID_FORMAT',
      }),
    };
  }

  if (!validateIBANChecksum(cleaned)) {
    return {
      valid: false,
      error: err({
        field: 'iban',
        message: 'IBAN checksum is invalid',
        code: 'IBAN_INVALID_CHECKSUM',
      }),
    };
  }

  return { valid: true };
}

function validateIBANChecksum(iban: string): boolean {
  const rearranged = iban.substring(4) + iban.substring(0, 4);

  let numericString = '';
  for (const char of rearranged) {
    if (char >= 'A' && char <= 'Z') {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }

  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = numericString.substring(i, i + 7);
    remainder = parseInt(remainder.toString() + chunk, 10) % 97;
  }

  return remainder === 1;
}

export function validateBIC(bic: string): {
  valid: boolean;
  error?: ValidationError;
} {
  const cleaned = cleanString(bic);

  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned)) {
    return {
      valid: false,
      error: err({
        field: 'bic',
        message: 'BIC format is invalid (must be 8 or 11 characters)',
        code: 'BIC_INVALID_FORMAT',
      }),
    };
  }

  return { valid: true };
}

export function formatIBAN(iban: string) {
  return cleanString(iban)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}
