# eu-payment-qr

Generate and parse EPC QR codes (GiroCode) for SEPA payments.

[![npm version](https://badge.fury.io/js/eu-payment-qr.svg)](https://badge.fury.io/js/eu-payment-qr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What this does

- Generate EPC-compliant QR strings (EPC069-12 standard)
- Parse QR strings into payment data
- Validate IBAN, BIC, and payment fields
- Zero dependencies

## What this doesn't do

- Render QR images (use `qrcode`, `react-native-qrcode-svg`)
- Scan QR codes (use `vision-camera`, `expo-camera`)
- Execute payments (use your bank's API)
- Generate invoices (use your invoicing system)

## Installation

```bash
npm install eu-payment-qr
```

## Usage

### Generate a QR string

```typescript
import { generate } from 'eu-payment-qr';

const qrString = generate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99,
  reference: 'INV-2024-001'
});

// Use with any QR library
// <QRCode value={qrString} />
```

### Parse a QR string

```typescript
import { parse, isEpcQR } from 'eu-payment-qr';

// Check if string is EPC format
if (isEpcQR(scannedData)) {
  const result = parse(scannedData);

  if (result.valid) {
    console.log(result.data);
    // { recipient: 'Max Müller', iban: '...', amount: 149.99, ... }
  } else {
    console.error(result.error);
  }
}
```

### Validate payment data

```typescript
import { validate, validateIBAN, validateBIC } from 'eu-payment-qr';

// Validate complete payment data
const result = validate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99
});

if (!result.valid) {
  console.log(result.errors);
  // [{ field: 'iban', message: '...', code: 'IBAN_INVALID_CHECKSUM' }]
}

// Validate individual fields
validateIBAN('DE89370400440532013000'); // { valid: true }
validateBIC('COBADEFFXXX');              // { valid: true }
```

### German market alias

```typescript
import { girocode } from 'eu-payment-qr';

const qrString = girocode.generate({ ... });
const result = girocode.parse(qrString);
```

## API

### `generate(data, options?)`

Generates an EPC QR code string.

**Parameters:**
- `data.recipient` (string, required) - Beneficiary name (max 70 chars)
- `data.iban` (string, required) - IBAN
- `data.bic` (string, optional) - BIC/SWIFT code
- `data.amount` (number, optional) - Amount in EUR (max 999,999,999.99)
- `data.reference` (string, optional) - Payment reference (max 35 chars)
- `data.message` (string, optional) - Additional info (max 140 chars)
- `options.version` ('001' | '002', default: '002') - EPC version
- `options.encoding` ('UTF-8' | 'ISO-8859-1', default: 'UTF-8')

**Returns:** `string` - EPC QR payload

**Throws:** `EpcError` if validation fails

### `parse(qrString)`

Parses an EPC QR code string.

**Parameters:**
- `qrString` (string) - Raw QR code content

**Returns:** `ParseResult`
- `valid` (boolean)
- `data` (PaymentData, if valid)
- `error` (string, if invalid)

### `isEpcQR(qrString)`

Quick check if a string is EPC QR format.

**Returns:** `boolean`

### `validate(data)`

Validates payment data.

**Returns:** `ValidationResult`
- `valid` (boolean)
- `errors` (ValidationError[])

### `validateIBAN(iban)`

Validates an IBAN.

**Returns:** `{ valid: boolean, error?: ValidationError }`

### `validateBIC(bic)`

Validates a BIC/SWIFT code.

**Returns:** `{ valid: boolean, error?: ValidationError }`

### `formatIBAN(iban)`

Formats IBAN with spaces for display.

**Returns:** `string` (e.g., "DE89 3704 0044 0532 0130 00")

## EPC QR Format

This library implements the EPC069-12 standard used by:
- GiroCode (Germany)
- EPC QR (EU-wide)

The generated string can be encoded as a QR code and scanned by banking apps across Europe.

## Supported Countries

All SEPA countries:
AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE, CH, GB, IS, LI, NO, MC, SM, AD, VA

## License

MIT
