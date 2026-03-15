# Contributing to eu-payment-qr

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/eu-payment-qr.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b my-feature`

## Development

```bash
npm run dev      # Watch mode
npm run build    # Build the package
npm run test     # Run tests
npm run lint     # Type-check
```

## Before Submitting a PR

- Run `npm run test` and make sure all tests pass
- Run `npm run lint` to check for type errors
- Add tests for any new functionality
- Keep the zero-dependency philosophy — no new runtime dependencies

## Reporting Bugs

Open a [GitHub Issue](https://github.com/MMGAbdelhay/eu-payment-qr/issues) with:

- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node.js version, OS)

## Feature Requests

Open a [GitHub Issue](https://github.com/MMGAbdelhay/eu-payment-qr/issues) describing:

- The use case
- Why existing functionality doesn't cover it
- A proposed API if you have one in mind
