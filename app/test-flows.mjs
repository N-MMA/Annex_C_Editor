// End-to-end flow test (Node.js, no browser needed)
// Tests: template generation, Excel parsing, validation, XML generation, XSD validation

import * as XLSX from 'xlsx'
import { readFileSync, writeFileSync } from 'fs'
import { validateXML } from 'xmllint-wasm'
import { parseExcel } from './src/lib/excelParser.ts'
import { validate } from './src/lib/validation.ts'
import { generateXML } from './src/lib/xmlGenerator.ts'
import { generateTemplate } from './src/lib/excelTemplate.ts'

const GREEN = '\x1b[32m✓\x1b[0m'
const RED   = '\x1b[31m✗\x1b[0m'
const WARN  = '\x1b[33m⚠\x1b[0m'

let passed = 0, failed = 0

function ok(label) { console.log(`  ${GREEN} ${label}`); passed++ }
function fail(label, detail) { console.log(`  ${RED} ${label}: ${detail}`); failed++ }
function warn(label, detail) { console.log(`  ${WARN} ${label}: ${detail}`) }

// ── Flow 1: Parse demo Excel ──────────────────────────────────────────────────
console.log('\n[1] Excel parsing (demo file)')
const demoBuf = readFileSync('./TechFormacao_Demo_2025.xlsx')
let rfcData, parseWarnings
try {
  const result = parseExcel(demoBuf.buffer)
  rfcData = result.data
  parseWarnings = result.warnings
  ok('parseExcel returned without throwing')
} catch (e) {
  fail('parseExcel', e.message)
  process.exit(1)
}

rfcData.config.entityId === '987654321' ? ok('entityId parsed correctly') : fail('entityId', rfcData.config.entityId)
rfcData.config.cae === '62010' ? ok('CAE parsed correctly') : fail('CAE', rfcData.config.cae)
rfcData.trainingActions.length === 3 ? ok('3 training actions parsed') : fail('training actions count', rfcData.trainingActions.length)
rfcData.workers.length === 5 ? ok('5 workers parsed') : fail('workers count', rfcData.workers.length)
parseWarnings.length === 0 ? ok('no parse warnings') : warn('parse warnings', parseWarnings.join('; '))

// Carla should have 3 registos
const carla = rfcData.workers.find(w => w.nome === 'Carla Mendes')
carla?.registos.length === 3 ? ok('Carla Mendes has 3 registos') : fail('Carla registos', carla?.registos.length)

// Training 1 for Carla should have 2 periodosRef
const carlaTr1 = carla?.registos.find(r => r.trainingId === 1)
carlaTr1?.periodosRef.length === 2 ? ok('Carla training 1 has 2 periods (01,02)') : fail('Carla periods', carlaTr1?.periodosRef)

// David Santos should have no registos
const david = rfcData.workers.find(w => w.nome === 'David Santos')
david?.situacaoFreq === '02' && david.registos.length === 0 ? ok('David Santos: sitFreq=02, no registos') : fail('David', david)

// ── Flow 2: Validation ────────────────────────────────────────────────────────
console.log('\n[2] Validation')
const errors = validate(rfcData)
errors.length === 0 ? ok('validate() returns 0 errors') : fail('validation errors', errors.map(e => `${e.field}: ${e.message}`).join('; '))

// Test CAE validation — bad CAE
const badCaeData = { ...rfcData, config: { ...rfcData.config, cae: 'abc12' } }
const badErrors = validate(badCaeData)
badErrors.some(e => e.field === 'CAE') ? ok('non-numeric CAE caught by validator') : fail('CAE validator', 'did not catch non-numeric CAE')

const shortCaeData = { ...rfcData, config: { ...rfcData.config, cae: '1234' } }
const shortErrors = validate(shortCaeData)
shortErrors.some(e => e.field === 'CAE') ? ok('4-digit CAE caught by validator') : fail('CAE 4-digit', 'not caught')

// Test missing period caught (not silently defaulted)
const missingPeriodData = {
  ...rfcData,
  workers: rfcData.workers.map(w => ({
    ...w,
    registos: w.registos.map(r => ({ ...r, periodosRef: [] })),
  })),
}
const periodErrors = validate(missingPeriodData)
periodErrors.some(e => e.field === 'Períodos Ref.') ? ok('missing period caught by validator') : fail('missing period', 'not caught')

// ── Flow 3: XML generation ────────────────────────────────────────────────────
console.log('\n[3] XML generation')
let xml
try {
  xml = generateXML(rfcData)
  ok('generateXML returned without throwing')
} catch (e) {
  fail('generateXML', e.message)
  process.exit(1)
}

xml.includes('XML_DATA="3.2.14"') ? ok('wrapper XML_DATA version correct') : fail('wrapper version', '')
xml.includes('XML_DATA="1.2.14"') ? ok('annexe XML_DATA version correct') : fail('annexe version', '')
xml.includes('xmlns:rfc="http://www.gep.msess.gov.pt/sguri/ru/anexo_rfc"') ? ok('RFC namespace present') : fail('RFC namespace', '')
xml.includes('tbl="RU_AREAFORM"') ? ok('tbl attributes present on coded elements') : fail('tbl attrs', '')
xml.includes('<rfc:niss>11111111101</rfc:niss>') ? ok('worker NISS in XML') : fail('worker NISS', '')
xml.includes('<rfc:periodo_ref tbl="RU_PEDREF">02</rfc:periodo_ref>') ? ok('period 02 present (Carla multi-period)') : fail('period 02', '')

// ── Flow 4: XSD validation ────────────────────────────────────────────────────
console.log('\n[4] XSD validation (xmllint-wasm)')

const schemaNames = [
  'tipos-comuns-1.3.14.xsd',
  'codigos-1.14.xsd',
  'entity_workers-1.14.xsd',
  'entity-data-1.2.14.xsd',
  'anexo-rfc-1.2.14.xsd',
  'relatorio-rfc-3.2.14.xsd',
]

const schemas = schemaNames.map(name => ({
  fileName: name,
  contents: readFileSync(`./public/schemas/${name}`, 'utf8'),
}))

try {
  const result = await validateXML({
    xml: [{ fileName: 'relatorio.xml', contents: xml }],
    schema: schemas,
  })
  if (result.valid) {
    ok('generated XML passes XSD schema validation')
  } else {
    const msgs = result.errors.map(e => e.message).join('\n    ')
    fail('XSD validation', `\n    ${msgs}`)
  }
} catch (e) {
  fail('XSD validation threw', e.message)
}

// ── Flow 5: Round-trip (XML → Excel → re-parse) ───────────────────────────────
console.log('\n[5] Round-trip: XML → Excel → re-parse')
let roundTripData
try {
  const excelBuf = generateTemplate(rfcData)
  const reparse = parseExcel(excelBuf)
  roundTripData = reparse.data
  ok('generateTemplate + parseExcel round-trip completed')
} catch(e) {
  fail('round-trip', e.message)
}

if (roundTripData) {
  roundTripData.workers.length === rfcData.workers.length
    ? ok(`round-trip worker count matches (${rfcData.workers.length})`)
    : fail('round-trip workers', `got ${roundTripData.workers.length} expected ${rfcData.workers.length}`)
  roundTripData.trainingActions.length === rfcData.trainingActions.length
    ? ok(`round-trip training actions match (${rfcData.trainingActions.length})`)
    : fail('round-trip actions', `got ${roundTripData.trainingActions.length}`)
  validate(roundTripData).length === 0
    ? ok('round-trip data validates with 0 errors')
    : fail('round-trip validation', validate(roundTripData).map(e=>e.message).join('; '))
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`  ${GREEN} Passed: ${passed}   ${failed > 0 ? RED : GREEN} Failed: ${failed}`)
console.log('─'.repeat(50))
if (failed > 0) process.exit(1)
