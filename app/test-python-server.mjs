// Simulates what the browser does when served from Python's http.server
// Fetches all assets from http://localhost:8001 and runs the full flow

import { readFileSync } from 'fs'
import { validateXML } from 'xmllint-wasm'
import { parseExcel } from './src/lib/excelParser.ts'
import { validate } from './src/lib/validation.ts'
import { generateXML } from './src/lib/xmlGenerator.ts'
import { generateTemplate } from './src/lib/excelTemplate.ts'

const BASE = 'http://localhost:8001'
const GREEN = '\x1b[32m✓\x1b[0m'
const RED   = '\x1b[31m✗\x1b[0m'

let passed = 0, failed = 0
function ok(label)         { console.log(`  ${GREEN} ${label}`); passed++ }
function fail(label, detail) { console.log(`  ${RED} ${label}${detail ? ': ' + detail : ''}`); failed++ }

// ── 1. Check all critical assets are reachable from the Python server ─────────
console.log('\n[1] Asset availability from Python server')

const ASSETS = [
  '/',
  '/assets/index-7t7kpXe3.js',
  '/assets/excelParser.worker-CZsut4Hy.js',
  '/assets/xmllint-CcuGSrO9.wasm',
  '/assets/xmllint-browser-VScsKEpi.js',
  '/assets/index-BksoxUsJ.css',
  '/schemas/relatorio-rfc-3.2.14.xsd',
  '/schemas/anexo-rfc-1.2.14.xsd',
  '/schemas/tipos-comuns-1.3.14.xsd',
  '/schemas/codigos-1.14.xsd',
  '/schemas/entity_workers-1.14.xsd',
  '/schemas/entity-data-1.2.14.xsd',
]

for (const path of ASSETS) {
  const res = await fetch(BASE + path)
  res.ok ? ok(`${res.status} ${path}`) : fail(`${res.status} ${path}`)
}

// ── 2. MIME types ─────────────────────────────────────────────────────────────
console.log('\n[2] MIME types')

const mimeChecks = [
  ['/assets/index-7t7kpXe3.js',           'text/javascript'],
  ['/assets/excelParser.worker-CZsut4Hy.js', 'text/javascript'],
  ['/assets/xmllint-CcuGSrO9.wasm',       'application/wasm'],
  ['/schemas/relatorio-rfc-3.2.14.xsd',   'text/xml'],
]
for (const [path, expectedPrefix] of mimeChecks) {
  const res = await fetch(BASE + path)
  const ct = res.headers.get('content-type') ?? ''
  ct.startsWith(expectedPrefix)
    ? ok(`${path.split('/').pop()} → ${ct}`)
    : fail(`${path.split('/').pop()} wrong MIME`, `got "${ct}", expected "${expectedPrefix}"`)
}

// ── 3. Full Excel → validate → XML → XSD flow (same logic as Tab 2) ───────────
console.log('\n[3] Excel → validate → XML flow')

const demoBuf = readFileSync('./TechFormacao_Demo_2025.xlsx')
const { data, warnings } = parseExcel(demoBuf.buffer)

data.workers.length === 5  ? ok('5 workers parsed')              : fail('workers', data.workers.length)
data.trainingActions.length === 3 ? ok('3 training actions')     : fail('actions', data.trainingActions.length)
warnings.length === 0      ? ok('no parse warnings')             : fail('warnings', warnings.join('; '))

const errors = validate(data)
errors.length === 0        ? ok('0 validation errors')           : fail('validation', errors.map(e=>e.message).join('; '))

const xml = generateXML(data)
xml.length > 500           ? ok(`XML generated (${xml.length} chars)`) : fail('XML too short', xml.length)

// ── 4. XSD validation — fetch schemas from the Python server (as browser would) ──
console.log('\n[4] XSD validation (schemas fetched from Python server)')

const schemaFiles = [
  'tipos-comuns-1.3.14.xsd',
  'codigos-1.14.xsd',
  'entity_workers-1.14.xsd',
  'entity-data-1.2.14.xsd',
  'anexo-rfc-1.2.14.xsd',
  'relatorio-rfc-3.2.14.xsd',
]

const schemas = await Promise.all(
  schemaFiles.map(async name => ({
    fileName: name,
    contents: await fetch(`${BASE}/schemas/${name}`).then(r => r.text()),
  }))
)
ok(`fetched ${schemas.length} XSD schema files from Python server`)

const xsdResult = await validateXML({
  xml: [{ fileName: 'relatorio.xml', contents: xml }],
  schema: schemas,
})
xsdResult.valid
  ? ok('generated XML passes XSD validation when schemas fetched from Python')
  : fail('XSD', xsdResult.errors.map(e => e.message).join('; '))

// ── 5. Round-trip: Excel → XML → Excel (XML→Excel tab flow) ──────────────────
console.log('\n[5] Round-trip: Excel → XML → Excel')

const excelBuf = generateTemplate(data)
excelBuf.byteLength > 1000 ? ok(`Excel template generated (${excelBuf.byteLength} bytes)`) : fail('template', 'too small')

const reparsed = parseExcel(excelBuf)
reparsed.data.workers.length === 5  ? ok('round-trip: 5 workers preserved')  : fail('round-trip workers', reparsed.data.workers.length)
reparsed.data.trainingActions.length === 3 ? ok('round-trip: 3 actions preserved') : fail('round-trip actions', reparsed.data.trainingActions.length)
validate(reparsed.data).length === 0 ? ok('round-trip: 0 validation errors') : fail('round-trip validate', '')

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(54)}`)
console.log(`  ${GREEN} Passed: ${passed}   ${failed > 0 ? RED : GREEN} Failed: ${failed}`)
console.log('─'.repeat(54))
if (failed > 0) process.exit(1)
