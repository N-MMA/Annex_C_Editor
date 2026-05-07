# Changelog

## v1.0.0 — 2026-05-07

First stable release.

### Features
- **Excel template generator** — 5-sheet `.xlsx` workbook with dropdown validation for all coded fields (10 RFC code tables, Tables 11 and 28–36)
- **Excel → XML** — parse filled template, validate against XSD constraints, export submission-ready XML
- **XML → Excel** — round-trip an existing RFC XML back into an editable Excel workbook
- **Full XSD validation** — generated XML validated against official `relatorio-rfc-3.2.14.xsd` and `anexo-rfc-1.2.14.xsd` schemas using `xmllint-wasm`
- **Web Worker** — Excel parsing runs off the main thread; UI stays responsive for large files (2000+ workers)
- **React Error Boundary** — unhandled errors show a friendly message instead of a blank screen
- **NISS conflict warnings** — detects inconsistent `situacaoFreq` or `nome` across rows for the same worker
- **Strict validation** — CAE enforced as 5 numeric digits; missing period references surface as errors (not silently defaulted)
- **Zero-install fallback** — pre-built `dist/` served by `serve.py` (Python 3); `launch.bat` auto-detects Node.js vs Python

### Architecture
- Browser-only (no backend, no telemetry, works fully offline after first load)
- React 19 + Vite 8 + TypeScript 6
- SheetJS (`xlsx` 0.18.5) for Excel read/write
- `xmllint-wasm` 5.2.0 for in-browser XSD validation
