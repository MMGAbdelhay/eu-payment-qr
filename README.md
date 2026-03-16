<div align="center">

# eu-payment-qr

Generate, parse, and validate EPC QR codes (GiroCode) for SEPA payments.

[![npm version](https://badge.fury.io/js/eu-payment-qr.svg)](https://www.npmjs.com/package/eu-payment-qr)
[![npm downloads](https://img.shields.io/npm/dw/eu-payment-qr)](https://www.npmjs.com/package/eu-payment-qr)
[![CI](https://github.com/MMGAbdelhay/eu-payment-qr/actions/workflows/ci.yml/badge.svg)](https://github.com/MMGAbdelhay/eu-payment-qr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/eu-payment-qr)

</div>

---

## Why this library?

EPC QR codes (also known as **GiroCode** in Germany) let users scan a QR code with their banking app to instantly pre-fill payment details — no manual typing of IBANs or amounts.

`eu-payment-qr` handles the **data layer**: generating the EPC string, parsing it back, and validating every field. Zero dependencies. Full TypeScript support.

> **This library does not render QR images or scan cameras.** It generates the data string that goes inside a QR code. Pair it with any QR rendering library of your choice (see [Rendering QR codes](#rendering-qr-codes)).

---

## Installation

```bash
npm install eu-payment-qr
```

```bash
yarn add eu-payment-qr
```

```bash
pnpm add eu-payment-qr
```

---

## Quick Start

```typescript
import { generate, parse, validate } from 'eu-payment-qr';

// Generate an EPC string from payment data
const epcString = generate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99,
  reference: 'INV-2024-001',
});

// Parse it back into structured data
const { valid, data } = parse(epcString);
// data → { recipient: 'Max Müller', iban: 'DE89...', amount: 149.99, ... }

// Validate payment data before generating
const result = validate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99,
});
// result → { valid: true, errors: [] }
```

---

## Usage

### Generate an EPC string

Create an EPC-compliant string from payment details. This string is what gets encoded into a QR code.

```typescript
import { generate } from 'eu-payment-qr';

const epcString = generate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  bic: 'COBADEFFXXX', // optional
  amount: 149.99, // optional, in EUR
  reference: 'INV-2024-001', // optional, max 35 chars
  message: 'Order #1234', // optional, max 140 chars
});

console.log(epcString);
// BCD
// 002
// 1
// SCT
// COBADEFFXXX
// Max Müller
// DE89370400440532013000
// EUR149.99
// ...
```

**With options:**

```typescript
const epcString = generate(
  { recipient: 'Max Müller', iban: 'DE89370400440532013000' },
  { version: '001', encoding: 'ISO-8859-1' },
);
```

### Parse a QR string

Extract payment data from a scanned or received EPC string.

```typescript
import { parse, isEpcQR } from 'eu-payment-qr';

const scannedData = '...'; // from a QR scanner

// Step 1: Check if it's an EPC QR code
if (isEpcQR(scannedData)) {
  // Step 2: Parse the string
  const result = parse(scannedData);

  if (result.valid) {
    console.log(result.data);
    // {
    //   recipient: 'Max Müller',
    //   iban: 'DE89370400440532013000',
    //   bic: 'COBADEFFXXX',
    //   amount: 149.99,
    //   reference: 'INV-2024-001',
    //   message: 'Order #1234'
    // }
  } else {
    console.error(result.error);
  }
}
```

### Validate payment data

Catch errors before generating — validates all fields with detailed error codes.

```typescript
import { validate } from 'eu-payment-qr';

// Valid data
const result = validate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99,
});
// { valid: true, errors: [] }

// Invalid data — multiple errors
const result = validate({
  recipient: '',
  iban: 'INVALID',
  amount: -5,
});
// {
//   valid: false,
//   errors: [
//     { field: 'recipient', message: 'Recipient is required', code: 'RECIPIENT_REQUIRED' },
//     { field: 'iban', message: '...', code: 'IBAN_INVALID_FORMAT' },
//     { field: 'amount', message: '...', code: 'AMOUNT_INVALID' }
//   ]
// }
```

### Validate individual fields

```typescript
import { validateIBAN, validateBIC, formatIBAN } from 'eu-payment-qr';

// IBAN validation (checks format, checksum, and country)
validateIBAN('DE89370400440532013000'); // { valid: true }
validateIBAN('DE00000000000000000000'); // { valid: false, error: { field: 'iban', message: '...', code: 'IBAN_INVALID_CHECKSUM' } }

// BIC validation (accepts 8 or 11 characters)
validateBIC('COBADEFFXXX'); // { valid: true }
validateBIC('INVALID'); // { valid: false, error: { ... } }

// Format IBAN for display
formatIBAN('DE89370400440532013000');
// → 'DE89 3704 0044 0532 0130 00'
```

### German market alias

For German GiroCode-specific usage, use the `girocode` namespace — same API, clearer intent.

```typescript
import { girocode } from 'eu-payment-qr';

const qrString = girocode.generate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99,
});

const result = girocode.parse(qrString);
const validation = girocode.validate({ ... });
const isValid = girocode.isEpcQR(someString);
```

---

## Rendering QR Codes

This library generates the **data string** — pair it with any QR rendering library to create the actual image.

**Web (React):**

```typescript
import { generate } from 'eu-payment-qr';
import { QRCodeSVG } from 'qrcode.react';

const epcString = generate({ recipient: 'Max Müller', iban: 'DE89370400440532013000', amount: 149.99 });

<QRCodeSVG value={epcString} size={200} />
```

**React Native:**

```typescript
import { generate } from 'eu-payment-qr';
import QRCode from 'react-native-qrcode-svg';

const epcString = generate({ recipient: 'Max Müller', iban: 'DE89370400440532013000', amount: 149.99 });

<QRCode value={epcString} size={200} />
```

**Node.js (save to file):**

```typescript
import { generate } from 'eu-payment-qr';
import QRCode from 'qrcode';

const epcString = generate({
  recipient: 'Max Müller',
  iban: 'DE89370400440532013000',
  amount: 149.99,
});

await QRCode.toFile('./payment.png', epcString);
```

---

## API Reference

### `generate(data, options?)`

Generates an EPC QR code string.

| Parameter          | Type                      | Required | Description                             |
| ------------------ | ------------------------- | -------- | --------------------------------------- |
| `data.recipient`   | `string`                  | Yes      | Beneficiary name (max 70 chars)         |
| `data.iban`        | `string`                  | Yes      | IBAN                                    |
| `data.bic`         | `string`                  | No       | BIC/SWIFT code                          |
| `data.amount`      | `number`                  | No       | Amount in EUR (max 999,999,999.99)      |
| `data.reference`   | `string`                  | No       | Payment reference (max 35 chars)        |
| `data.message`     | `string`                  | No       | Additional info (max 140 chars)         |
| `options.version`  | `'001' \| '002'`          | No       | EPC version (default: `'002'`)          |
| `options.encoding` | `'UTF-8' \| 'ISO-8859-1'` | No       | Character encoding (default: `'UTF-8'`) |

**Returns:** `string` — EPC QR payload

**Throws:** `EpcError` if validation fails

---

### `parse(qrString)`

Parses an EPC QR code string into structured payment data.

| Parameter  | Type     | Description         |
| ---------- | -------- | ------------------- |
| `qrString` | `string` | Raw QR code content |

**Returns:** `ParseResult`

```typescript
{
  valid: boolean;
  data?: PaymentData;  // present if valid
  error?: string;      // present if invalid
}
```

---

### `formatIBAN(iban)`

Formats an IBAN with spaces for display.

**Returns:** `string` — e.g., `DE89 3704 0044 0532 0130 00`

---

### `isEpcQR(qrString)`

Quick check if a string follows the EPC QR format. Use this before calling `parse()`.

**Returns:** `boolean`

---

### `validate(data)`

Validates complete payment data and returns all errors.

**Returns:** `ValidationResult`

```typescript
{
  valid: boolean;
  errors: ValidationError[];  // { field, message, code }
}
```

<details>
<summary><strong>Error codes</strong></summary>

| Code                    | Description                           |
| ----------------------- | ------------------------------------- |
| `RECIPIENT_REQUIRED`    | Recipient name is missing             |
| `RECIPIENT_TOO_LONG`    | Recipient exceeds 70 characters       |
| `IBAN_REQUIRED`         | IBAN is missing                       |
| `IBAN_INVALID_FORMAT`   | IBAN format is incorrect              |
| `IBAN_INVALID_CHECKSUM` | IBAN checksum verification failed     |
| `IBAN_INVALID_COUNTRY`  | Country code is not a SEPA member     |
| `BIC_INVALID_FORMAT`    | BIC is not 8 or 11 characters         |
| `AMOUNT_INVALID`        | Amount is negative or not a number    |
| `AMOUNT_TOO_LARGE`      | Amount exceeds 999,999,999.99         |
| `REFERENCE_TOO_LONG`    | Reference exceeds 35 characters       |
| `MESSAGE_TOO_LONG`      | Message exceeds 140 characters        |
| `INVALID_CHARACTERS`    | Input contains unsupported characters |

</details>

---

### `validateIBAN(iban)`

Validates an IBAN (format, checksum, and country).

**Returns:** `{ valid: boolean, error?: ValidationError }`

---

### `validateBIC(bic)`

Validates a BIC/SWIFT code (8 or 11 characters).

**Returns:** `{ valid: boolean, error?: ValidationError }`

---

### `EpcError`

Custom error class thrown by `generate()` when validation fails. Extends `Error`.

```typescript
import { generate, EpcError } from 'eu-payment-qr';

try {
  generate({ recipient: '', iban: '' });
} catch (error) {
  if (error instanceof EpcError) {
    console.log(error.message);
  }
}
```

---

### TypeScript Support

All types are exported for full type safety:

```typescript
import type {
  PaymentData,
  GenerateOptions,
  ParseResult,
  ValidationResult,
  ValidationError,
  ErrorCode,
} from 'eu-payment-qr';
```

---

## Supported Countries

All 36 SEPA member countries:

|                  |                |             |                |                   |                 |
| ---------------- | -------------- | ----------- | -------------- | ----------------- | --------------- |
| AT Austria       | BE Belgium     | BG Bulgaria | HR Croatia     | CY Cyprus         | CZ Czechia      |
| DK Denmark       | EE Estonia     | FI Finland  | FR France      | DE Germany        | GR Greece       |
| HU Hungary       | IE Ireland     | IT Italy    | LV Latvia      | LT Lithuania      | LU Luxembourg   |
| MT Malta         | NL Netherlands | PL Poland   | PT Portugal    | RO Romania        | SK Slovakia     |
| SI Slovenia      | ES Spain       | SE Sweden   | CH Switzerland | GB United Kingdom | IS Iceland      |
| LI Liechtenstein | NO Norway      | MC Monaco   | SM San Marino  | AD Andorra        | VA Vatican City |

---

## EPC QR Standard

This library implements the **EPC069-12** standard defined by the European Payments Council. The generated strings are compatible with:

- **GiroCode** (Germany)
- **EPC QR** (EU-wide)
- All major European banking apps

Learn more: [European Payments Council — QR Code Guidelines](https://www.europeanpaymentscouncil.eu/what-we-do/epc-qr-code)

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
