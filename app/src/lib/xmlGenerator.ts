import type { RFCData, TrainingAction, Worker, WorkerRegistration } from '../types'

const NS_RU = 'http://www.gep.msess.gov.pt/sguri/ru'
const NS_RFC = 'http://www.gep.msess.gov.pt/sguri/ru/anexo_rfc'

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function coded(tag: string, tbl: string, code: string): string {
  return `<rfc:${tag} tbl="${tbl}">${esc(code)}</rfc:${tag}>`
}

function generateFormacao(action: TrainingAction): string {
  return `        <rfc:formacao>
          ${coded('area_educacao', 'RU_AREAFORM', action.areaEducacao)}
          ${coded('modalidade', 'RU_MODAL', action.modalidade)}
          <rfc:duracao_accao>${action.duracaoAccao}</rfc:duracao_accao>
          ${coded('entidade_formadora', 'RU_ENTFORM', action.entidadeFormadora)}
          ${coded('qualificacao', 'RU_QUALIF', action.qualificacao)}
        </rfc:formacao>`
}

function generateRegisto(reg: WorkerRegistration): string {
  const periods = reg.periodosRef
    .map(p => `              <rfc:periodo_ref tbl="RU_PEDREF">${esc(p)}</rfc:periodo_ref>`)
    .join('\n')
  return `          <rfc:registo>
            <rfc:id_formacao_registo>${reg.trainingId}</rfc:id_formacao_registo>
            ${coded('iniciativa', 'RU_INICIAT', reg.iniciativa)}
            ${coded('horario_formacao', 'RU_HORFORM', reg.horario)}
            ${coded('diploma', 'RU_DIPLOM', reg.diploma)}
            <rfc:periodos_ref>
${periods}
            </rfc:periodos_ref>
          </rfc:registo>`
}

function generateTrabalhador(worker: Worker): string {
  const registosXml =
    worker.registos.length > 0
      ? `        <rfc:registos>
${worker.registos.map(generateRegisto).join('\n')}
        </rfc:registos>`
      : ''
  return `      <rfc:trabalhador>
        ${coded('ident_reg_apli', 'RU_REREAP', worker.identRegApli)}
        <rfc:niss>${esc(worker.niss)}</rfc:niss>
        <rfc:nome>${esc(worker.nome)}</rfc:nome>
        ${coded('situacao_freq', 'RU_SITFREQ', worker.situacaoFreq)}
${registosXml}
      </rfc:trabalhador>`
}

export function generateXML(data: RFCData): string {
  const { config, trainingActions, workers } = data

  const formacoesXml =
    trainingActions.length > 0
      ? trainingActions.map(generateFormacao).join('\n')
      : ''

  const trabalhadoresXml =
    workers.length > 0
      ? workers.map(generateTrabalhador).join('\n')
      : ''

  const dadosRfcXml =
    config.hasWorkers === 'S'
      ? `    <rfc:dados_rfc>
      <rfc:cae_31Dez tbl="RU_CAE_5DIG">${esc(config.cae)}</rfc:cae_31Dez>
      <rfc:formacoes>
${formacoesXml}
      </rfc:formacoes>
      <rfc:trabalhadores>
${trabalhadoresXml}
      </rfc:trabalhadores>
    </rfc:dados_rfc>`
      : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<ru:relatorio_unico XML_DATA="3.2.14"
  xmlns:ru="${NS_RU}"
  xmlns:rfc="${NS_RFC}">
  <ru:header>
    <ru:aplicacao>
      <ru:nome>Anexo C Editor</ru:nome>
      <ru:versao>1.0</ru:versao>
      <ru:empresa>${esc(config.entityName)}</ru:empresa>
    </ru:aplicacao>
  </ru:header>
  <ru:body>
    <ru:anexos>
      <rfc:anexo_rfc entidade="${esc(config.entityId)}" ano="${esc(config.year)}" XML_DATA="1.2.14">
    <rfc:nome_entidade>${esc(config.entityName)}</rfc:nome_entidade>
    <rfc:exist_trabalhadores>${config.hasWorkers}</rfc:exist_trabalhadores>
${dadosRfcXml}
      </rfc:anexo_rfc>
    </ru:anexos>
  </ru:body>
</ru:relatorio_unico>`
}
