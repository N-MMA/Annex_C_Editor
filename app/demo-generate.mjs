// Generates a filled demo Excel file: TechFormação Lda, 2025
// Run with: node demo-generate.mjs
import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'

function buildSheet(headers, rows) {
  return XLSX.utils.aoa_to_sheet([headers, ...rows])
}

// ── Instruções ────────────────────────────────────────────────────────────────
const wsInst = XLSX.utils.aoa_to_sheet([
  ['DEMO — TechFormação Lda — Relatório Único 2025 — Anexo C'],
  [null],
  ['Este ficheiro é um exemplo pré-preenchido para demonstração do conversor.'],
])
wsInst['!cols'] = [{ wch: 80 }]

// ── Configuração ──────────────────────────────────────────────────────────────
const wsConfig = XLSX.utils.aoa_to_sheet([
  ['Campo', 'Valor', 'Notas'],
  ['Nome da Entidade',              'TechFormação Lda',  'Máx. 70 caracteres'],
  ['ID da Entidade (entidade)',     '987654321',         'Número inteiro'],
  ['Ano de Referência',             2025,                'Ex: 2025'],
  ['CAE a 31 de Dezembro',         '62010',             'CAE Rev.4 — 5 dígitos'],
  ['Existiram trabalhadores? (S/N)','S',                 'S = Sim | N = Não'],
])
wsConfig['!cols'] = [{ wch: 38 }, { wch: 30 }, { wch: 50 }]

// ── Ações de Formação ─────────────────────────────────────────────────────────
// 3 training actions
const wsAcoes = buildSheet(
  ['ID', 'Área Educ/Formação (cód)', 'Modalidade (cód)', 'Duração (horas)', 'Entidade Formadora (cód)', 'Nível Qualificação (cód)'],
  [
    [1, '481', '08', 16, '01', '09'],  // Ciências informáticas, Outras ações, 16h, Própria empresa, Sem nível
    [2, '345', '08', 8,  '07', '09'],  // Gestão e administração, Outras ações, 8h, Empresa formação
    [3, '862', '08', 4,  '01', '09'],  // Seg. higiene trabalho, Outras ações, 4h, Própria empresa
  ]
)
wsAcoes['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 28 }, { wch: 24 }]

// ── Trabalhadores ─────────────────────────────────────────────────────────────
// 5 workers:
//   Ana Costa        — attended trainings 1 and 2 (2 rows)
//   Bruno Ferreira   — attended training 3 (1 row)
//   Carla Mendes     — attended trainings 1, 2 and 3 (3 rows)
//   David Santos     — no training (sitFreq=02, 1 row, training cols blank)
//   Eva Rodrigues    — attended training 1 (1 row)
const wsWorkers = buildSheet(
  ['NISS', 'Nome', 'Regime Reforma (cód)', 'Sit. Frequência (cód)', 'ID Formação', 'Iniciativa (cód)', 'Horário (cód)', 'Diploma (cód)', 'Períodos Ref. (cód, sep. por vírgula)'],
  [
    // Ana Costa — 2 trainings
    ['11111111101', 'Ana Costa',       '1', '01', 1, '01', '01', '04', '01'],
    ['11111111101', 'Ana Costa',       '1', '01', 2, '01', '02', '04', '01'],
    // Bruno Ferreira — 1 training
    ['22222222202', 'Bruno Ferreira',  '1', '01', 3, '01', '01', '04', '01'],
    // Carla Mendes — 3 trainings
    ['33333333303', 'Carla Mendes',    '1', '01', 1, '01', '01', '04', '01,02'],
    ['33333333303', 'Carla Mendes',    '1', '01', 2, '02', '02', '04', '01'],
    ['33333333303', 'Carla Mendes',    '1', '01', 3, '01', '01', '04', '01'],
    // David Santos — no training (received monetary comp instead)
    ['44444444404', 'David Santos',    '1', '02', null, null, null, null, null],
    // Eva Rodrigues — 1 training
    ['55555555505', 'Eva Rodrigues',   '2', '01', 1, '01', '03', '06', '01'],
  ]
)
wsWorkers['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 30 }]

// ── Write file ────────────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, wsInst,    'Instruções')
XLSX.utils.book_append_sheet(wb, wsConfig,  'Configuração')
XLSX.utils.book_append_sheet(wb, wsAcoes,   'Ações_Formação')
XLSX.utils.book_append_sheet(wb, wsWorkers, 'Trabalhadores')

const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
writeFileSync('TechFormacao_Demo_2025.xlsx', buf)
console.log('Created: TechFormacao_Demo_2025.xlsx')
