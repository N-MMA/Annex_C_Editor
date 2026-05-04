import * as XLSX from 'xlsx'
import type { RFCData } from '../types'
import {
  RU_REREAP, RU_SITFREQ, RU_PEDREF, RU_AREAFORM,
  RU_MODAL, RU_INICIAT, RU_HORFORM, RU_ENTFORM,
  RU_DIPLOM, RU_QUALIF,
} from '../data/codeTables'
import type { CodeEntry } from '../data/codeTables'

// ── Helpers ──────────────────────────────────────────────────────────────────

function codeOptions(table: CodeEntry[]): string[] {
  return table.map(e => `${e.code} - ${e.label}`)
}

function addValidation(
  ws: XLSX.WorkSheet,
  sqref: string,
  options: string[],
) {
  if (!ws['!validations']) ws['!validations'] = []
  const list = options.map(o => o.replace(/,/g, ';')).join(',')
  ws['!validations'].push({
    type: 'list',
    sqref,
    formula1: `"${list}"`,
    showErrorMessage: true,
    error: 'Selecione um valor válido da lista.',
    errorTitle: 'Valor inválido',
  })
}

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map(w => ({ wch: w }))
}

function buildSheet(headers: string[], rows: (string | number | null)[][]): XLSX.WorkSheet {
  const aoa: (string | number | null)[][] = [headers, ...rows]
  return XLSX.utils.aoa_to_sheet(aoa)
}

// ── Configuração sheet ────────────────────────────────────────────────────────

function makeConfigSheet(data?: RFCData): XLSX.WorkSheet {
  const cfg = data?.config
  const aoa = [
    ['Campo', 'Valor', 'Notas'],
    ['Nome da Entidade', cfg?.entityName ?? '', 'Máx. 70 caracteres'],
    ['ID da Entidade (entidade)', cfg?.entityId ?? '', 'Número inteiro (ver conta RU)'],
    ['Ano de Referência', cfg?.year ?? new Date().getFullYear(), 'Ex: 2025'],
    ['CAE a 31 de Dezembro', cfg?.cae ?? '', 'Código CAE Rev.4 — 5 dígitos (ex: 46900)'],
    ['Existiram trabalhadores? (S/N)', cfg?.hasWorkers ?? 'S', 'S = Sim  |  N = Não'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 38 }, { wch: 30 }, { wch: 50 }]

  if (!ws['!validations']) ws['!validations'] = []
  ws['!validations'].push({
    type: 'list',
    sqref: 'B6',
    formula1: '"S,N"',
  })
  return ws
}

// ── Ações de Formação sheet ───────────────────────────────────────────────────

const ACOES_HEADERS = [
  'ID',
  'Área Educ/Formação (cód)',
  'Modalidade (cód)',
  'Duração (horas)',
  'Entidade Formadora (cód)',
  'Nível Qualificação (cód)',
]

function makeAcoesSheet(data?: RFCData): XLSX.WorkSheet {
  const rows: (string | number | null)[][] =
    data?.trainingActions.map(a => [
      a.id,
      a.areaEducacao,
      a.modalidade,
      a.duracaoAccao,
      a.entidadeFormadora,
      a.qualificacao,
    ]) ?? []

  const ws = buildSheet(ACOES_HEADERS, rows)
  setColumnWidths(ws, [6, 28, 22, 16, 28, 24])

  const maxRows = 500
  addValidation(ws, `B2:B${maxRows}`, codeOptions(RU_AREAFORM))
  addValidation(ws, `C2:C${maxRows}`, codeOptions(RU_MODAL))
  addValidation(ws, `E2:E${maxRows}`, codeOptions(RU_ENTFORM))
  addValidation(ws, `F2:F${maxRows}`, codeOptions(RU_QUALIF))
  return ws
}

// ── Trabalhadores sheet ───────────────────────────────────────────────────────

const TRAB_HEADERS = [
  'NISS',
  'Nome',
  'Regime Reforma (cód)',
  'Sit. Frequência (cód)',
  'ID Formação',
  'Iniciativa (cód)',
  'Horário (cód)',
  'Diploma (cód)',
  'Períodos Ref. (cód, sep. por vírgula)',
]

function makeWorkersSheet(data?: RFCData): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = []

  if (data?.workers) {
    for (const w of data.workers) {
      if (w.registos.length === 0) {
        rows.push([
          w.niss, w.nome, w.identRegApli, w.situacaoFreq,
          null, null, null, null, null,
        ])
      } else {
        for (const r of w.registos) {
          rows.push([
            w.niss,
            w.nome,
            w.identRegApli,
            w.situacaoFreq,
            r.trainingId,
            r.iniciativa,
            r.horario,
            r.diploma,
            r.periodosRef.join(','),
          ])
        }
      }
    }
  }

  const ws = buildSheet(TRAB_HEADERS, rows)
  setColumnWidths(ws, [22, 35, 20, 20, 12, 16, 14, 16, 30])

  const maxRows = 5000
  addValidation(ws, `C2:C${maxRows}`, codeOptions(RU_REREAP))
  addValidation(ws, `D2:D${maxRows}`, codeOptions(RU_SITFREQ))
  addValidation(ws, `F2:F${maxRows}`, codeOptions(RU_INICIAT))
  addValidation(ws, `G2:G${maxRows}`, codeOptions(RU_HORFORM))
  addValidation(ws, `H2:H${maxRows}`, codeOptions(RU_DIPLOM))
  return ws
}

// ── Reference / Códigos sheet ─────────────────────────────────────────────────

function makeCodigosSheet(): XLSX.WorkSheet {
  interface TableDef { title: string; entries: CodeEntry[] }
  const tables: TableDef[] = [
    { title: 'REGIME REFORMA (RU_REREAP — Tab.11)', entries: RU_REREAP },
    { title: 'SIT. FREQUÊNCIA (RU_SITFREQ — Tab.28)', entries: RU_SITFREQ },
    { title: 'PERÍODO REF. (RU_PEDREF — Tab.29)', entries: RU_PEDREF },
    { title: 'ÁREA EDUCAÇÃO/FORM. (RU_AREAFORM — Tab.30)', entries: RU_AREAFORM },
    { title: 'MODALIDADE (RU_MODAL — Tab.31)', entries: RU_MODAL },
    { title: 'INICIATIVA (RU_INICIAT — Tab.32)', entries: RU_INICIAT },
    { title: 'HORÁRIO (RU_HORFORM — Tab.33)', entries: RU_HORFORM },
    { title: 'ENT. FORMADORA (RU_ENTFORM — Tab.34)', entries: RU_ENTFORM },
    { title: 'DIPLOMA (RU_DIPLOM — Tab.35)', entries: RU_DIPLOM },
    { title: 'QUALIFICAÇÃO (RU_QUALIF — Tab.36)', entries: RU_QUALIF },
  ]

  const aoa: (string | null)[][] = [['— TABELAS DE CÓDIGOS — consulte esta folha para preencher as colunas de código nas outras folhas']]
  aoa.push([null])

  for (const tbl of tables) {
    aoa.push([tbl.title])
    aoa.push(['Código', 'Designação'])
    for (const e of tbl.entries) {
      aoa.push([e.code, e.label])
    }
    aoa.push([null])
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 12 }, { wch: 80 }]
  return ws
}

// ── Instructions sheet ────────────────────────────────────────────────────────

function makeInstrucoesSheet(): XLSX.WorkSheet {
  const aoa = [
    ['INSTRUÇÕES DE PREENCHIMENTO — Anexo C (Formação Contínua) — Relatório Único 2025'],
    [null],
    ['ESTRUTURA DO FICHEIRO'],
    ['Este ficheiro tem 4 folhas:'],
    ['  1. Configuração   — dados da entidade empregadora (preencher uma vez)'],
    ['  2. Ações_Formação — lista de ações de formação realizadas (uma por linha)'],
    ['  3. Trabalhadores  — lista de trabalhadores e respetivas frequências (uma linha por trabalhador por formação)'],
    ['  4. Códigos        — tabela de referência com todos os códigos válidos'],
    [null],
    ['FOLHA "Ações_Formação"'],
    ['  • ID: número sequencial (1, 2, 3, …). Este ID será usado na coluna "ID Formação" dos Trabalhadores.'],
    ['  • Use os códigos da folha "Códigos" para os campos de código.'],
    ['  • Duração em horas (número inteiro).'],
    [null],
    ['FOLHA "Trabalhadores"'],
    ['  • Uma linha por combinação trabalhador + formação frequentada.'],
    ['  • Se um trabalhador frequentou 3 formações → 3 linhas (mesmo NISS, Nome, Regime, Sit.Freq.).'],
    ['  • Se um trabalhador NÃO frequentou formação (Sit.Freq. = 02, 03 ou 08) → 1 linha, colunas ID Formação em branco.'],
    ['  • Períodos Ref.: insira um ou mais códigos separados por vírgula (ex: 01  ou  01,02).'],
    ['  • NISS: número de identificação de Segurança Social (máx. 20 caracteres).'],
    [null],
    ['FLUXO DE TRABALHO RECOMENDADO'],
    ['  1. Preencha "Configuração" com os dados da empresa.'],
    ['  2. Registe todas as ações de formação em "Ações_Formação".'],
    ['  3. Preencha "Trabalhadores" ligando cada trabalhador ao ID da formação correspondente.'],
    ['  4. Guarde o ficheiro e carregue-o no conversor para gerar o XML.'],
    [null],
    ['NOTAS'],
    ['  • Os menus pendentes nas colunas de código só funcionam no Excel para Windows/Mac.'],
    ['  • Se o código não aparecer no menu, consulte a folha "Códigos".'],
    ['  • O campo CAE deve ser o código CAE Rev.4 de 5 dígitos da empresa a 31/12 do ano de referência.'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 100 }]
  return ws
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateTemplate(data?: RFCData): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, makeInstrucoesSheet(), 'Instruções')
  XLSX.utils.book_append_sheet(wb, makeConfigSheet(data), 'Configuração')
  XLSX.utils.book_append_sheet(wb, makeAcoesSheet(data), 'Ações_Formação')
  XLSX.utils.book_append_sheet(wb, makeWorkersSheet(data), 'Trabalhadores')
  XLSX.utils.book_append_sheet(wb, makeCodigosSheet(), 'Códigos')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}
