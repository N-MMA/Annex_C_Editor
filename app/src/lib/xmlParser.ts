import type { RFCData, RFCConfig, TrainingAction, Worker, WorkerRegistration } from '../types'

function getText(parent: Element, localName: string): string {
  const el = findChild(parent, localName)
  return el?.textContent?.trim() ?? ''
}

function findChild(parent: Element, localName: string): Element | null {
  for (const child of Array.from(parent.children)) {
    if (child.localName === localName) return child
  }
  return null
}

function findChildren(parent: Element, localName: string): Element[] {
  return Array.from(parent.children).filter(c => c.localName === localName)
}

function parseFormacao(el: Element, index: number): TrainingAction {
  return {
    id: index + 1,
    areaEducacao: getText(el, 'area_educacao'),
    modalidade: getText(el, 'modalidade'),
    duracaoAccao: parseInt(getText(el, 'duracao_accao'), 10) || 0,
    entidadeFormadora: getText(el, 'entidade_formadora'),
    qualificacao: getText(el, 'qualificacao'),
  }
}

function parseRegisto(el: Element): WorkerRegistration {
  const periodosEl = findChild(el, 'periodos_ref')
  const periodos = periodosEl
    ? findChildren(periodosEl, 'periodo_ref').map(p => p.textContent?.trim() ?? '')
    : []
  return {
    trainingId: parseInt(getText(el, 'id_formacao_registo'), 10) || 0,
    iniciativa: getText(el, 'iniciativa'),
    horario: getText(el, 'horario_formacao'),
    diploma: getText(el, 'diploma'),
    periodosRef: periodos,
  }
}

function parseTrabalhador(el: Element): Worker {
  const registosEl = findChild(el, 'registos')
  const registos: WorkerRegistration[] = registosEl
    ? findChildren(registosEl, 'registo').map(parseRegisto)
    : []
  return {
    identRegApli: getText(el, 'ident_reg_apli'),
    niss: getText(el, 'niss'),
    nome: getText(el, 'nome'),
    situacaoFreq: getText(el, 'situacao_freq'),
    registos,
  }
}

export function parseXML(xmlString: string): RFCData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`XML inválido: ${parseError.textContent}`)
  }

  const anexoRfc = doc.querySelector('anexo_rfc')
  if (!anexoRfc) throw new Error('Elemento anexo_rfc não encontrado no XML.')

  const entityId = anexoRfc.getAttribute('entidade') ?? ''
  const year = anexoRfc.getAttribute('ano') ?? ''
  const entityName = getText(anexoRfc, 'nome_entidade')
  const hasWorkers = getText(anexoRfc, 'exist_trabalhadores') as 'S' | 'N'

  const dadosRfc = findChild(anexoRfc, 'dados_rfc')

  const config: RFCConfig = {
    entityName,
    entityId,
    year,
    cae: dadosRfc ? getText(dadosRfc, 'cae_31Dez') : '',
    hasWorkers,
  }

  const trainingActions: TrainingAction[] = []
  const workers: Worker[] = []

  if (dadosRfc) {
    const formacoesEl = findChild(dadosRfc, 'formacoes')
    if (formacoesEl) {
      findChildren(formacoesEl, 'formacao').forEach((el, i) => {
        trainingActions.push(parseFormacao(el, i))
      })
    }

    const trabalhadoresEl = findChild(dadosRfc, 'trabalhadores')
    if (trabalhadoresEl) {
      findChildren(trabalhadoresEl, 'trabalhador').forEach(el => {
        workers.push(parseTrabalhador(el))
      })
    }
  }

  return { config, trainingActions, workers }
}
