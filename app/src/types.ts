export interface RFCConfig {
  entityName: string   // nome_entidade, max 70
  entityId: string     // entidade attribute (long)
  year: string         // ano, 4 digits
  cae: string          // cae_31Dez, RU_CAE_5DIG
  hasWorkers: 'S' | 'N'
}

export interface TrainingAction {
  id: number
  areaEducacao: string     // RU_AREAFORM table 30
  modalidade: string       // RU_MODAL table 31
  duracaoAccao: number     // hours, max 4 digits
  entidadeFormadora: string // RU_ENTFORM table 34
  qualificacao: string     // RU_QUALIF table 36
}

export interface WorkerRegistration {
  trainingId: number       // FK → TrainingAction.id
  iniciativa: string       // RU_INICIAT table 32
  horario: string          // RU_HORFORM table 33
  diploma: string          // RU_DIPLOM table 35
  periodosRef: string[]    // RU_PEDREF table 29, one or more
}

export interface Worker {
  niss: string             // max 20
  nome: string             // max 70
  identRegApli: string     // RU_REREAP table 11
  situacaoFreq: string     // RU_SITFREQ table 28
  registos: WorkerRegistration[]
}

export interface RFCData {
  config: RFCConfig
  trainingActions: TrainingAction[]
  workers: Worker[]
}

export interface ValidationError {
  sheet: string
  row?: number
  field: string
  message: string
}
