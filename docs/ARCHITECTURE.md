# Annex C Editor — Architecture & Module Relations

## Purpose
Browser-only React app that converts between the Portuguese "Relatório Único" Annex C (RFC)
XML submission format and an editable Excel workbook. No backend. All processing runs in the browser.

---

## Data Flow

```
XML file ──► parseXML ──► RFCData ──► generateTemplate ──► Excel file
                                │
Excel file ──► parseExcel ──────┘──► validate ──► ValidationError[]
                                │
                                └──► generateXML ──► XML file
```

---

## Central Type: `RFCData` (`src/types.ts`)

All modules speak the same internal representation:

```
RFCData
├── config: RFCConfig          entity name, ID, year, CAE, hasWorkers flag
├── trainingActions: TrainingAction[]   one entry per ação de formação
│     id, areaEducacao, modalidade, duracaoAccao, entidadeFormadora, qualificacao
└── workers: Worker[]
      niss, nome, identRegApli, situacaoFreq
      └── registos: WorkerRegistration[]   one per training attended
            trainingId (FK → TrainingAction.id), iniciativa, horario, diploma, periodosRef[]
```

`ValidationError` carries `{ sheet, row?, field, message }` for display in the UI.

---

## Module Map

```
src/
├── types.ts                 ← shared interfaces (no dependencies)
├── data/
│   └── codeTables.ts        ← 10 lookup tables + isValidCode/lookupLabel helpers
│                              (no dependencies)
├── lib/
│   ├── xmlGenerator.ts      ← RFCData → XML string
│   │     depends on: types, (no codeTables needed — codes written as-is)
│   ├── xmlParser.ts         ← XML string → RFCData (DOMParser, localName-based)
│   │     depends on: types
│   ├── excelTemplate.ts     ← RFCData? → ArrayBuffer (.xlsx, 5 sheets)
│   │     depends on: types, codeTables (for dropdown options), xlsx
│   ├── excelParser.ts       ← ArrayBuffer → RFCData
│   │     depends on: types, xlsx
│   └── validation.ts        ← RFCData → ValidationError[]
│         depends on: types, codeTables (for isValidCode)
├── components/
│   ├── FileDropZone.tsx     ← drag-and-drop file input (no app logic)
│   └── ValidationReport.tsx ← renders ValidationError[] grouped by sheet
└── App.tsx                  ← wires everything together (3 tabs)
      depends on: all lib/* modules, both components, types
```

---

## Module Responsibilities

### `types.ts`
Defines all shared TypeScript interfaces. No logic, no imports. Every other module depends on this.

### `data/codeTables.ts`
Hardcoded lookup tables for all 10 RFC code domains (Tables 11, 28–36 of the official spec).
- `isValidCode(table, code)` — used by validation
- `lookupLabel(table, code)` — available for display use
- Used by: `excelTemplate.ts` (dropdown lists), `validation.ts` (code checks)

### `lib/xmlGenerator.ts`
Converts `RFCData` to a fully namespace-qualified XML string ready for submission.
- Uses `rfc:` prefix for Annex C elements, `ru:` for the wrapper
- Emits `tbl="TABLE_NAME"` attributes on every coded element (XSD requirement)
- Uses `esc()` for XML character escaping
- Entry point: `generateXML(data: RFCData): string`

### `lib/xmlParser.ts`
Parses an existing RFC XML file back into `RFCData` using the browser's `DOMParser`.
- Matches elements by `localName` (namespace-agnostic — works with any prefix style)
- Training action IDs are re-assigned sequentially (1, 2, 3…) on parse
- Entry point: `parseXML(xmlString: string): RFCData`

### `lib/excelTemplate.ts`
Generates a 5-sheet `.xlsx` workbook (optionally pre-populated from `RFCData`).
- **Instruções** — plain-text instructions
- **Configuração** — entity config fields with S/N dropdown on B6
- **Ações_Formação** — training actions with dropdowns on B, C, E, F (up to row 500)
- **Trabalhadores** — workers (denormalised: one row per worker×training) with dropdowns on C, D, F, G, H (up to row 5000)
- **Códigos** — all 10 lookup tables for reference
- Dropdowns use SheetJS `!validations` with `"code - label"` format
- Entry point: `generateTemplate(data?: RFCData): ArrayBuffer`

### `lib/excelParser.ts`
Reads the template back into `RFCData`.
- `extractCode()` strips `"01 - Label"` dropdown format down to `"01"`
- Groups multiple rows for the same NISS into a single `Worker` with multiple `registos`
- Entry point: `parseExcel(buffer: ArrayBuffer): RFCData`

### `lib/validation.ts`
Validates `RFCData` against XSD constraints and business rules.
- Config: required fields, numeric entityId, 4-digit year, CAE required
- Training actions: duplicate IDs, valid codes for all 5 coded fields, duration 1–9999
- Workers: NISS max 20 chars, nome max 70, duplicate NISS, valid codes for all coded fields
- Cross-validation: `situacaoFreq='01'` requires registos; other values must have none
- FK check: each `trainingId` must exist in the training actions set
- Entry point: `validate(data: RFCData): ValidationError[]`

### `components/FileDropZone.tsx`
Reusable drag-and-drop / click-to-browse file input. Calls `onFile(File)` prop.
No knowledge of file formats or app logic.

### `components/ValidationReport.tsx`
Renders a `ValidationError[]` grouped by sheet into a styled table.
Shows a green success box when the array is empty.

### `App.tsx`
Orchestrates the three tabs:
- **Gerar Modelo** — calls `generateTemplate()`, downloads blank `.xlsx`
- **Excel → XML** — `parseExcel` → `validate` → show `ValidationReport` → `generateXML` on export
- **XML → Excel** — `parseXML` → `generateTemplate` → auto-download pre-filled `.xlsx`

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| All processing in the browser | No server needed; sensitive employee data never leaves the user's machine |
| Denormalised Excel (one row per worker×training) | Easiest for mass editing of 2000+ workers in Excel |
| `localName`-based XML parsing | Works regardless of namespace prefix used in source XML |
| String-template XML generation | Full control over prefix style and `tbl=` attribute placement |
| `extractCode()` in parser | Handles both raw codes and dropdown-format values transparently |
| SheetJS `!validations` | Native Excel dropdowns without any extra dependency |

---

## XML Structure (abbreviated)

```xml
<ru:relatorio_unico XML_DATA="3.2.14" xmlns:ru="...ru" xmlns:rfc="...ru/anexo_rfc">
  <ru:header><ru:aplicacao>…</ru:aplicacao></ru:header>
  <ru:body><ru:anexos>
    <rfc:anexo_rfc entidade="12345" ano="2025" XML_DATA="1.2.14">
      <rfc:nome_entidade>Empresa SA</rfc:nome_entidade>
      <rfc:exist_trabalhadores>S</rfc:exist_trabalhadores>
      <rfc:dados_rfc>
        <rfc:cae_31Dez tbl="RU_CAE_5DIG">46900</rfc:cae_31Dez>
        <rfc:formacoes>
          <rfc:formacao>
            <rfc:area_educacao tbl="RU_AREAFORM">345</rfc:area_educacao>
            …
          </rfc:formacao>
        </rfc:formacoes>
        <rfc:trabalhadores>
          <rfc:trabalhador>
            <rfc:ident_reg_apli tbl="RU_REREAP">1</rfc:ident_reg_apli>
            <rfc:niss>12345678901</rfc:niss>
            <rfc:nome>João Silva</rfc:nome>
            <rfc:situacao_freq tbl="RU_SITFREQ">01</rfc:situacao_freq>
            <rfc:registos>
              <rfc:registo>
                <rfc:id_formacao_registo>1</rfc:id_formacao_registo>
                <rfc:iniciativa tbl="RU_INICIAT">01</rfc:iniciativa>
                <rfc:horario_formacao tbl="RU_HORFORM">01</rfc:horario_formacao>
                <rfc:diploma tbl="RU_DIPLOM">04</rfc:diploma>
                <rfc:periodos_ref>
                  <rfc:periodo_ref tbl="RU_PEDREF">01</rfc:periodo_ref>
                </rfc:periodos_ref>
              </rfc:registo>
            </rfc:registos>
          </rfc:trabalhador>
        </rfc:trabalhadores>
      </rfc:dados_rfc>
    </rfc:anexo_rfc>
  </ru:anexos></ru:body>
</ru:relatorio_unico>
```
