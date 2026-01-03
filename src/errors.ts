import type { ErrorCode } from './types';

// Custom error class for EPC QR validation and generation errors
export class EpcError extends Error {
  readonly code: ErrorCode;
  readonly field: string;

  constructor(message: string, code: ErrorCode, field: string) {
    super(message);
    this.name = 'EpcError';
    this.code = code;
    this.field = field;

    // Maintains proper stack trace in V8 environments
    const ErrorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor: Function) => void;
    };

    if (ErrorWithCapture.captureStackTrace) {
      ErrorWithCapture.captureStackTrace(this, EpcError);
    }
  }
}
