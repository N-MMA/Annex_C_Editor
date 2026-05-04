export interface CodeEntry {
  code: string
  label: string
}

// Table 11 - Regime de Reforma Aplicado
export const RU_REREAP: CodeEntry[] = [
  { code: '1', label: 'Segurança social' },
  { code: '2', label: 'Caixa Geral de Aposentações' },
  { code: '8', label: 'Outro Regime' },
]

// Table 28 - Situação face à frequência de formação
export const RU_SITFREQ: CodeEntry[] = [
  { code: '01', label: 'Frequentou formação profissional no ano de referência' },
  { code: '02', label: 'Recebeu compensação monetária ou crédito de horas em substituição' },
  { code: '03', label: 'Usou horas para frequência a aulas / processo RVCC' },
  { code: '08', label: 'Outra situação' },
]

// Table 29 - Período de referência da formação
export const RU_PEDREF: CodeEntry[] = [
  { code: '01', label: 'Direito adquirido no ano de referência' },
  { code: '02', label: 'Direito adquirido nos dois anos anteriores' },
  { code: '03', label: 'Antecipação da aquisição do direito' },
  { code: '08', label: 'Outra situação' },
]

// Table 30 - Área de educação/formação
export const RU_AREAFORM: CodeEntry[] = [
  { code: '010', label: 'Programas de base' },
  { code: '080', label: 'Alfabetização' },
  { code: '090', label: 'Desenvolvimento pessoal' },
  { code: '142', label: 'Ciências da educação' },
  { code: '143', label: 'Formação de professores da educação pré-escolar' },
  { code: '144', label: 'Formação de professores do ensino básico' },
  { code: '145', label: 'Formação de professores de áreas disciplinares específicas' },
  { code: '146', label: 'Formação de professores e formadores de áreas tecnológicas' },
  { code: '149', label: 'Formação de professores/formadores e ciências da educação - outros' },
  { code: '211', label: 'Belas Artes' },
  { code: '212', label: 'Artes do Espectáculo' },
  { code: '213', label: 'Audiovisuais e produção dos media' },
  { code: '214', label: 'Design' },
  { code: '215', label: 'Artesanato' },
  { code: '219', label: 'Artes - outros' },
  { code: '221', label: 'Religião e teologia' },
  { code: '222', label: 'Línguas e literaturas estrangeiras' },
  { code: '223', label: 'Língua e literatura materna' },
  { code: '225', label: 'História e arqueologia' },
  { code: '226', label: 'Filosofia e ética' },
  { code: '229', label: 'Humanidades - outros' },
  { code: '311', label: 'Psicologia' },
  { code: '312', label: 'Sociologia e outros estudos' },
  { code: '313', label: 'Ciência política e cidadania' },
  { code: '314', label: 'Economia' },
  { code: '319', label: 'Ciências sociais e do comportamento - outros' },
  { code: '321', label: 'Jornalismo e reportagem' },
  { code: '322', label: 'Biblioteconomia, arquivo e documentação (BAD)' },
  { code: '329', label: 'Informação e jornalismo - outros' },
  { code: '341', label: 'Comércio' },
  { code: '342', label: 'Marketing e publicidade' },
  { code: '343', label: 'Finanças, banca e seguros' },
  { code: '344', label: 'Contabilidade e fiscalidade' },
  { code: '345', label: 'Gestão e administração' },
  { code: '346', label: 'Secretariado e trabalho administrativo' },
  { code: '347', label: 'Enquadramento na organização/empresa' },
  { code: '349', label: 'Ciências empresariais - outros' },
  { code: '380', label: 'Direito' },
  { code: '421', label: 'Biologia e bioquímica' },
  { code: '422', label: 'Ciências do ambiente' },
  { code: '429', label: 'Ciências da vida - outros' },
  { code: '441', label: 'Física' },
  { code: '442', label: 'Química' },
  { code: '443', label: 'Ciências da terra' },
  { code: '449', label: 'Ciências físicas - outros' },
  { code: '461', label: 'Matemática' },
  { code: '462', label: 'Estatística' },
  { code: '469', label: 'Matemática e estatística - outros' },
  { code: '481', label: 'Ciências informáticas' },
  { code: '482', label: 'Informática na óptica do utilizador' },
  { code: '489', label: 'Informática - outros' },
  { code: '521', label: 'Metalurgia e metalomecânica' },
  { code: '522', label: 'Electricidade e energia' },
  { code: '523', label: 'Electrónica e automação' },
  { code: '524', label: 'Tecnologia dos processos químicos' },
  { code: '525', label: 'Construção e reparação de veículos a motor' },
  { code: '529', label: 'Engenharia e técnicas afins - outros' },
  { code: '541', label: 'Indústrias alimentares' },
  { code: '542', label: 'Indústrias do têxtil, vestuário, calçado e couro' },
  { code: '543', label: 'Materiais (madeira, cortiça, papel, plástico, vidro e outros)' },
  { code: '544', label: 'Indústrias extractivas' },
  { code: '549', label: 'Indústrias transformadoras - outros' },
  { code: '581', label: 'Arquitectura e urbanismo' },
  { code: '582', label: 'Construção civil e engenharia civil' },
  { code: '589', label: 'Arquitectura e construção - outros' },
  { code: '621', label: 'Produção agrícola e animal' },
  { code: '622', label: 'Floricultura e jardinagem' },
  { code: '623', label: 'Silvicultura e caça' },
  { code: '624', label: 'Pescas' },
  { code: '629', label: 'Agricultura, silvicultura e pescas - outros' },
  { code: '640', label: 'Ciências veterinárias' },
  { code: '721', label: 'Medicina' },
  { code: '723', label: 'Enfermagem' },
  { code: '724', label: 'Ciências dentárias' },
  { code: '725', label: 'Tecnologias de diagnóstico e terapêutica' },
  { code: '726', label: 'Terapia e reabilitação' },
  { code: '727', label: 'Farmácia' },
  { code: '729', label: 'Saúde - outros' },
  { code: '761', label: 'Serviços de apoio a crianças e jovens' },
  { code: '762', label: 'Trabalho social e orientação' },
  { code: '769', label: 'Serviços sociais - outros' },
  { code: '811', label: 'Hotelaria e restauração' },
  { code: '812', label: 'Turismo e lazer' },
  { code: '813', label: 'Desporto' },
  { code: '814', label: 'Serviços domésticos' },
  { code: '815', label: 'Cuidados de beleza' },
  { code: '819', label: 'Serviços pessoais - outros' },
  { code: '840', label: 'Serviços de transporte' },
  { code: '851', label: 'Tecnologia de protecção do ambiente' },
  { code: '852', label: 'Ambientes naturais e vida selvagem' },
  { code: '853', label: 'Serviços de saúde pública' },
  { code: '859', label: 'Protecção do ambiente - outros' },
  { code: '861', label: 'Protecção de pessoas e bens' },
  { code: '862', label: 'Segurança e higiene no trabalho' },
  { code: '863', label: 'Segurança militar' },
  { code: '869', label: 'Serviços de segurança - outros' },
  { code: '999', label: 'Desconhecido ou não especificado' },
]

// Table 31 - Modalidade de formação
export const RU_MODAL: CodeEntry[] = [
  { code: '01', label: 'Cursos profissionais' },
  { code: '02', label: 'Cursos de aprendizagem' },
  { code: '03', label: 'Cursos de educação e formação para jovens' },
  { code: '04', label: 'Cursos de educação e formação para adultos' },
  { code: '05', label: 'Cursos de especialização tecnológica' },
  { code: '06', label: 'Outras formações modulares inseridas no CNQ' },
  { code: '07', label: 'Formação-Ação' },
  { code: '08', label: 'Outras ações de formação contínua não inseridas no CNQ' },
  { code: '99', label: 'Desconhecida' },
]

// Table 32 - Iniciativa da formação
export const RU_INICIAT: CodeEntry[] = [
  { code: '01', label: 'Da responsabilidade do empregador' },
  { code: '02', label: 'Da iniciativa do trabalhador (crédito de horas)' },
  { code: '03', label: 'Da iniciativa da empresa utilizadora de mão-de-obra' },
]

// Table 33 - Horário da formação
export const RU_HORFORM: CodeEntry[] = [
  { code: '01', label: 'Laboral' },
  { code: '02', label: 'Pós-laboral' },
  { code: '03', label: 'Misto' },
]

// Table 34 - Entidade formadora
export const RU_ENTFORM: CodeEntry[] = [
  { code: '01', label: 'Própria empresa' },
  { code: '02', label: 'Centro de Emprego e/ou Formação Profissional de Gestão Direta' },
  { code: '03', label: 'Centro de Formação Profissional de Gestão Participada' },
  { code: '04', label: 'Associações de Empregadores ou Outras Associações Empresariais' },
  { code: '05', label: 'Associações Sindicais ou Ordens Profissionais' },
  { code: '06', label: 'Escolas/Universidades' },
  { code: '07', label: 'Empresas de formação' },
  { code: '08', label: 'Empresas privadas cuja atividade principal não é a formação' },
  { code: '09', label: 'Outro tipo de entidade' },
  { code: '99', label: 'Desconhecida' },
]

// Table 35 - Tipo de Certificado/Diploma
export const RU_DIPLOM: CodeEntry[] = [
  { code: '01', label: 'Diploma de qualificação' },
  { code: '02', label: 'Certificado de qualificação' },
  { code: '03', label: 'Certificado de formação profissional certificada' },
  { code: '04', label: 'Certificado de formação profissional não certificada' },
  { code: '05', label: 'Sem certificado por reprovação' },
  { code: '06', label: 'Certificado de frequência' },
  { code: '07', label: 'Diploma de ensino superior' },
  { code: '08', label: 'Não aplicável' },
  { code: '99', label: 'Desconhecido' },
]

// Table 36 - Nível de qualificação da formação
export const RU_QUALIF: CodeEntry[] = [
  { code: '01', label: 'Nível 1' },
  { code: '02', label: 'Nível 2' },
  { code: '03', label: 'Nível 3' },
  { code: '04', label: 'Nível 4' },
  { code: '05', label: 'Nível 5' },
  { code: '06', label: 'Nível 6 (Licenciatura)' },
  { code: '07', label: 'Nível 7 (Mestrado)' },
  { code: '08', label: 'Nível 8 (Doutoramento)' },
  { code: '09', label: 'Sem atribuição de nível' },
  { code: '99', label: 'Desconhecido' },
]

export const ALL_TABLES: Record<string, CodeEntry[]> = {
  RU_REREAP,
  RU_SITFREQ,
  RU_PEDREF,
  RU_AREAFORM,
  RU_MODAL,
  RU_INICIAT,
  RU_HORFORM,
  RU_ENTFORM,
  RU_DIPLOM,
  RU_QUALIF,
}

export function lookupLabel(table: CodeEntry[], code: string): string {
  return table.find(e => e.code === code)?.label ?? code
}

export function isValidCode(table: CodeEntry[], code: string): boolean {
  return table.some(e => e.code === code)
}
