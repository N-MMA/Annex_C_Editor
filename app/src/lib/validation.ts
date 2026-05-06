import type { RFCData, ValidationError } from '../types'
import { RU_REREAP, RU_SITFREQ, RU_PEDREF, RU_AREAFORM, RU_MODAL, RU_INICIAT, RU_HORFORM, RU_ENTFORM, RU_DIPLOM, RU_QUALIF, isValidCode } from '../data/codeTables'

export function validate(data: RFCData): ValidationError[] {
  const errors: ValidationError[] = []

  function err(sheet: string, row: number | undefined, field: string, message: string) {
    errors.push({ sheet, row, field, message })
  }

  // ── Configuração ──────────────────────────────────────────────────────────
  const { config } = data
  if (!config.entityName) err('Configuração', undefined, 'Nome da Entidade', 'Campo obrigatório.')
  if (config.entityName.length > 70) err('Configuração', undefined, 'Nome da Entidade', 'Máximo 70 caracteres.')
  if (!config.entityId) err('Configuração', undefined, 'ID da Entidade', 'Campo obrigatório.')
  if (!/^\d+$/.test(config.entityId)) err('Configuração', undefined, 'ID da Entidade', 'Deve ser um número inteiro.')
  if (!config.year || !/^\d{4}$/.test(config.year)) err('Configuração', undefined, 'Ano de Referência', 'Deve ser um ano com 4 dígitos.')
  if (!config.cae) err('Configuração', undefined, 'CAE', 'Campo obrigatório.')
  else if (!/^\d{5}$/.test(config.cae)) err('Configuração', undefined, 'CAE', 'Deve ser um código CAE Rev.4 de 5 dígitos numéricos (ex: 62010).')
  if (config.hasWorkers !== 'S' && config.hasWorkers !== 'N') err('Configuração', undefined, 'Existiram trabalhadores', 'Deve ser "S" ou "N".')

  if (config.hasWorkers === 'N') return errors // nothing else to validate

  // ── Ações de Formação ─────────────────────────────────────────────────────
  const actionIds = new Set<number>()
  data.trainingActions.forEach((a, i) => {
    const row = i + 2
    if (!a.id || a.id <= 0) err('Ações_Formação', row, 'ID', 'ID inválido.')
    if (actionIds.has(a.id)) err('Ações_Formação', row, 'ID', `ID ${a.id} duplicado.`)
    actionIds.add(a.id)
    if (!isValidCode(RU_AREAFORM, a.areaEducacao)) err('Ações_Formação', row, 'Área Educ/Formação', `Código "${a.areaEducacao}" inválido.`)
    if (!isValidCode(RU_MODAL, a.modalidade)) err('Ações_Formação', row, 'Modalidade', `Código "${a.modalidade}" inválido.`)
    if (!a.duracaoAccao || a.duracaoAccao <= 0) err('Ações_Formação', row, 'Duração', 'Duração deve ser > 0.')
    if (a.duracaoAccao > 9999) err('Ações_Formação', row, 'Duração', 'Máximo 9999 horas.')
    if (!isValidCode(RU_ENTFORM, a.entidadeFormadora)) err('Ações_Formação', row, 'Entidade Formadora', `Código "${a.entidadeFormadora}" inválido.`)
    if (!isValidCode(RU_QUALIF, a.qualificacao)) err('Ações_Formação', row, 'Nível Qualificação', `Código "${a.qualificacao}" inválido.`)
  })

  // ── Trabalhadores ─────────────────────────────────────────────────────────
  const seenNiss = new Set<string>()
  let excelRow = 2

  for (const w of data.workers) {
    const registoCount = w.registos.length
    const rowsForWorker = registoCount || 1

    if (!w.niss) err('Trabalhadores', excelRow, 'NISS', 'Campo obrigatório.')
    if (w.niss.length > 20) err('Trabalhadores', excelRow, 'NISS', 'Máximo 20 caracteres.')
    if (seenNiss.has(w.niss)) err('Trabalhadores', excelRow, 'NISS', `NISS "${w.niss}" duplicado.`)
    seenNiss.add(w.niss)

    if (!w.nome) err('Trabalhadores', excelRow, 'Nome', 'Campo obrigatório.')
    if (w.nome.length > 70) err('Trabalhadores', excelRow, 'Nome', 'Máximo 70 caracteres.')
    if (!isValidCode(RU_REREAP, w.identRegApli)) err('Trabalhadores', excelRow, 'Regime Reforma', `Código "${w.identRegApli}" inválido.`)
    if (!isValidCode(RU_SITFREQ, w.situacaoFreq)) err('Trabalhadores', excelRow, 'Sit. Frequência', `Código "${w.situacaoFreq}" inválido.`)

    const shouldHaveTraining = w.situacaoFreq === '01'
    if (shouldHaveTraining && registoCount === 0) {
      err('Trabalhadores', excelRow, 'ID Formação', 'Sit. Freq. "01" requer pelo menos uma formação associada.')
    }
    if (!shouldHaveTraining && registoCount > 0) {
      err('Trabalhadores', excelRow, 'ID Formação', 'Trabalhadores sem frequência (02/03/08) não devem ter formações associadas.')
    }

    for (const r of w.registos) {
      if (!actionIds.has(r.trainingId)) {
        err('Trabalhadores', excelRow, 'ID Formação', `ID de formação "${r.trainingId}" não existe em Ações_Formação.`)
      }
      if (!isValidCode(RU_INICIAT, r.iniciativa)) err('Trabalhadores', excelRow, 'Iniciativa', `Código "${r.iniciativa}" inválido.`)
      if (!isValidCode(RU_HORFORM, r.horario)) err('Trabalhadores', excelRow, 'Horário', `Código "${r.horario}" inválido.`)
      if (!isValidCode(RU_DIPLOM, r.diploma)) err('Trabalhadores', excelRow, 'Diploma', `Código "${r.diploma}" inválido.`)
      if (r.periodosRef.length === 0) err('Trabalhadores', excelRow, 'Períodos Ref.', 'Pelo menos um período de referência é obrigatório.')
      for (const p of r.periodosRef) {
        if (!isValidCode(RU_PEDREF, p)) err('Trabalhadores', excelRow, 'Períodos Ref.', `Código de período "${p}" inválido.`)
      }
      excelRow++
    }

    if (registoCount === 0) excelRow++
    else excelRow += rowsForWorker - 1
  }

  return errors
}
