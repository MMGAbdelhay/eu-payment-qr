export { generate } from './generate';
export { parse, isEpcQR } from './parse';
export { validate, validateIBAN, validateBIC, formatIBAN } from './validate';
export { EpcError } from './errors';

export type {
  PaymentData,
  GenerateOptions,
  ParseResult,
  ValidationResult,
  ValidationError,
  ErrorCode,
} from './types';

import { generate } from './generate';
import { parse, isEpcQR } from './parse';
import { validate } from './validate';

export const girocode = { generate, parse, isEpcQR, validate };
