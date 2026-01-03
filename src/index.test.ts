import { describe, it, expect } from 'vitest';
import {
  generate,
  parse,
  isEpcQR,
  validate,
  validateIBAN,
  validateBIC,
  formatIBAN,
  EpcError,
} from './index';

describe('generate', () => {
  it('generates valid EPC QR string', () => {
    const qr = generate({
      recipient: 'Max Müller',
      iban: 'DE89370400440532013000',
      amount: 149.99,
      reference: 'INV-2024-001',
    });

    expect(qr).toContain('BCD');
    expect(qr).toContain('SCT');
    expect(qr).toContain('Max Müller');
    expect(qr).toContain('DE89370400440532013000');
    expect(qr).toContain('EUR149.99');
  });

  it('generates QR without optional fields', () => {
    const qr = generate({
      recipient: 'Test',
      iban: 'DE89370400440532013000',
    });

    expect(qr).toContain('BCD');
    expect(qr).toContain('Test');
  });

  it('throws EpcError for invalid IBAN', () => {
    expect(() =>
      generate({
        recipient: 'Test',
        iban: 'INVALID',
      })
    ).toThrow(EpcError);
  });

  it('throws EpcError for missing recipient', () => {
    expect(() =>
      generate({
        recipient: '',
        iban: 'DE89370400440532013000',
      })
    ).toThrow(EpcError);
  });
});

describe('parse', () => {
  it('parses valid EPC QR string', () => {
    const qr = generate({
      recipient: 'Max Müller',
      iban: 'DE89370400440532013000',
      amount: 149.99,
      reference: 'INV-001',
    });

    const result = parse(qr);

    expect(result.valid).toBe(true);
    expect(result.data?.recipient).toBe('Max Müller');
    expect(result.data?.iban).toBe('DE89370400440532013000');
    expect(result.data?.amount).toBe(149.99);
    expect(result.data?.reference).toBe('INV-001');
  });

  it('returns error for invalid format', () => {
    const result = parse('invalid string');

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for empty input', () => {
    const result = parse('');

    expect(result.valid).toBe(false);
  });
});

describe('isEpcQR', () => {
  it('returns true for valid EPC QR', () => {
    const qr = generate({
      recipient: 'Test',
      iban: 'DE89370400440532013000',
    });

    expect(isEpcQR(qr)).toBe(true);
  });

  it('returns false for random string', () => {
    expect(isEpcQR('hello world')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isEpcQR('')).toBe(false);
  });
});

describe('validateIBAN', () => {
  it('validates correct German IBAN', () => {
    const result = validateIBAN('DE89370400440532013000');
    expect(result.valid).toBe(true);
  });

  it('validates correct Austrian IBAN', () => {
    const result = validateIBAN('AT611904300234573201');
    expect(result.valid).toBe(true);
  });

  it('validates IBAN with spaces', () => {
    const result = validateIBAN('DE89 3704 0044 0532 0130 00');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid checksum', () => {
    const result = validateIBAN('DE00370400440532013000');
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('IBAN_INVALID_CHECKSUM');
  });

  it('rejects invalid format', () => {
    const result = validateIBAN('INVALID');
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('IBAN_INVALID_FORMAT');
  });

  it('rejects non-SEPA country', () => {
    const result = validateIBAN('US00000000000000000000');
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('IBAN_INVALID_COUNTRY');
  });
});

describe('validateBIC', () => {
  it('validates 8-character BIC', () => {
    const result = validateBIC('COBADEFF');
    expect(result.valid).toBe(true);
  });

  it('validates 11-character BIC', () => {
    const result = validateBIC('COBADEFFXXX');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid BIC', () => {
    const result = validateBIC('INVALID');
    expect(result.valid).toBe(false);
  });
});

describe('validate', () => {
  it('validates complete payment data', () => {
    const result = validate({
      recipient: 'Max Müller',
      iban: 'DE89370400440532013000',
      amount: 100,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns multiple errors', () => {
    const result = validate({
      recipient: '',
      iban: 'INVALID',
      amount: -50,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('rejects amount over maximum', () => {
    const result = validate({
      recipient: 'Test',
      iban: 'DE89370400440532013000',
      amount: 9999999999,
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('AMOUNT_TOO_LARGE');
  });
});

describe('formatIBAN', () => {
  it('formats IBAN with spaces', () => {
    const formatted = formatIBAN('DE89370400440532013000');
    expect(formatted).toBe('DE89 3704 0044 0532 0130 00');
  });

  it('handles already spaced IBAN', () => {
    const formatted = formatIBAN('DE89 3704 0044 0532 0130 00');
    expect(formatted).toBe('DE89 3704 0044 0532 0130 00');
  });
});

describe('roundtrip', () => {
  it('generate -> parse produces same data', () => {
    const original = {
      recipient: 'Test Company GmbH',
      iban: 'DE89370400440532013000',
      bic: 'COBADEFFXXX',
      amount: 1234.56,
      reference: 'RF18539007547034',
    };

    const qr = generate(original);
    const result = parse(qr);

    expect(result.valid).toBe(true);
    expect(result.data?.recipient).toBe(original.recipient);
    expect(result.data?.iban).toBe(original.iban);
    expect(result.data?.bic).toBe(original.bic);
    expect(result.data?.amount).toBe(original.amount);
    expect(result.data?.reference).toBe(original.reference);
  });
});
