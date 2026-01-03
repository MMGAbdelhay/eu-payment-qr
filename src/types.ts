export interface PaymentData {
  recipient: string;
  iban: string;
  bic?: string;
  amount?: number;
  reference?: string;
  message?: string;
}

export interface GenerateOptions {
  version?: '001' | '002';
  encoding?: 'UTF-8' | 'ISO-8859-1';
}

export interface ParseResult {
  valid: boolean;
  data?: PaymentData;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: ErrorCode;
}

export type ErrorCode =
  | 'RECIPIENT_REQUIRED'
  | 'RECIPIENT_TOO_LONG'
  | 'IBAN_REQUIRED'
  | 'IBAN_INVALID_FORMAT'
  | 'IBAN_INVALID_CHECKSUM'
  | 'IBAN_INVALID_COUNTRY'
  | 'BIC_INVALID_FORMAT'
  | 'AMOUNT_INVALID'
  | 'AMOUNT_TOO_LARGE'
  | 'REFERENCE_TOO_LONG'
  | 'MESSAGE_TOO_LONG'
  | 'INVALID_CHARACTERS';
