import * as XLSX from 'xlsx'
import type { RFCData, RFCConfig, TrainingAction, Worker } from '../types'

function sheetToRows(ws: XLSX.WorkSheet): Record<string, string>[] {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')
  if (range.e.r < 1) return []

  const headers: string[] = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c })
    headers.push(String(ws[addr]?.v ?? '').trim())
  }

  const rows: Record<string, string>[] = []
  for (let r = 1; r <= range.e.r; r++) {
    const row: Record<string, string> = {}
    let hasData = false
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const val = String(ws[addr]?.v ?? '').trim()
      row[headers[c - range.s.c]] = val
      if (val) hasData = true
    }
    if (hasData) rows.push(row)
  }
  return rows
}

// Strip the "code - label" format produced by dropdowns → return just the code
function extractCode(value: string): string {
  if (!value) return ''
  const match = value.match(/^(\S+)\s*[-–]/)
  return match ? match[1].trim() : value.trim()
}

function parseConfig(ws: XLSX.WorkSheet): RFCConfig {
  // Configuração sheet: column A=field name, column B=value (rows 2-6, 1-indexed → r=1-5)
  const get = (row: number) => String(ws[XLSX.utils.encode_cell({ r: row, c: 1 })]?.v ?? '').trim()
  return {
    entityName: get(1),
    entityId: get(2),
    year: String(get(3)),
    cae: extractCode(get(4)),
    hasWorkers: get(5) === 'N' ? 'N' : 'S',
  }
}

function parseAcoes(ws: XLSX.WorkSheet): TrainingAction[] {
  return sheetToRows(ws)
    .filter(r => r['ID'])
    .map(r => ({
      id: parseInt(r['ID'], 10) || 0,
      areaEducacao: extractCode(r['Área Educ/Formação (cód)'] ?? ''),
      modalidade: extractCode(r['Modalidade (cód)'] ?? ''),
      duracaoAccao: parseInt(r['Duração (horas)'] ?? '0', 10) || 0,
      entidadeFormadora: extractCode(r['Entidade Formadora (cód)'] ?? ''),
      qualificacao: extractCode(r['Nível Qualificação (cód)'] ?? ''),
    }))
}

function parseWorkers(ws: XLSX.WorkSheet): Worker[] {
  const rows = sheetToRows(ws).filter(r => r['NISS'])

  // Group rows by NISS to merge multiple training registrations per worker
  const byNiss = new Map<string, Worker>()

  for (const row of rows) {
    const niss = row['NISS']
    const trainingIdRaw = row['ID Formação']

    if (!byNiss.has(niss)) {
      byNiss.set(niss, {
        niss,
        nome: row['Nome'] ?? '',
        identRegApli: extractCode(row['Regime Reforma (cód)'] ?? ''),
        situacaoFreq: extractCode(row['Sit. Frequência (cód)'] ?? ''),
        registos: [],
      })
    }

    const worker = byNiss.get(niss)!

    if (trainingIdRaw) {
      const rawPeriodos = row['Períodos Ref. (cód, sep. por vírgula)'] ?? ''
      const periodosRef = rawPeriodos
        .split(/[,;]+/)
        .map(p => extractCode(p.trim()))
        .filter(Boolean)

      worker.registos.push({
        trainingId: parseInt(trainingIdRaw, 10) || 0,
        iniciativa: extractCode(row['Iniciativa (cód)'] ?? ''),
        horario: extractCode(row['Horário (cód)'] ?? ''),
        diploma: extractCode(row['Diploma (cód)'] ?? ''),
        periodosRef: periodosRef.length > 0 ? periodosRef : ['01'],
      })
    }
  }

  return Array.from(byNiss.values())
}

export function parseExcel(buffer: ArrayBuffer): RFCData {
  const wb = XLSX.read(buffer, { type: 'array' })

  const configSheet = wb.Sheets['Configuração']
  if (!configSheet) throw new Error('Folha "Configuração" não encontrada.')

  const acoesSheet = wb.Sheets['Ações_Formação']
  if (!acoesSheet) throw new Error('Folha "Ações_Formação" não encontrada.')

  const trabSheet = wb.Sheets['Trabalhadores']
  if (!trabSheet) throw new Error('Folha "Trabalhadores" não encontrada.')

  const config = parseConfig(configSheet)
  const trainingActions = parseAcoes(acoesSheet)
  const workers = parseWorkers(trabSheet)

  return { config, trainingActions, workers }
}
