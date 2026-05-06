import { validateXML } from 'xmllint-wasm'

// XSD filenames needed to validate the RFC report (loaded from /schemas/)
const SCHEMA_FILES = [
  'tipos-comuns-1.3.14.xsd',
  'codigos-1.14.xsd',
  'entity_workers-1.14.xsd',
  'entity-data-1.2.14.xsd',
  'anexo-rfc-1.2.14.xsd',
  'relatorio-rfc-3.2.14.xsd',
]

async function fetchSchema(name: string): Promise<{ fileName: string; contents: string }> {
  const res = await fetch(`/schemas/${name}`)
  if (!res.ok) throw new Error(`Não foi possível carregar schema: ${name}`)
  return { fileName: name, contents: await res.text() }
}

export interface XsdValidationResult {
  valid: boolean
  errors: string[]
}

export async function validateXMLAgainstSchema(xmlString: string): Promise<XsdValidationResult> {
  const schemas = await Promise.all(SCHEMA_FILES.map(fetchSchema))

  const result = await validateXML({
    xml: [{ fileName: 'relatorio.xml', contents: xmlString }],
    schema: schemas,
  })

  if (result.valid) {
    return { valid: true, errors: [] }
  }

  // Parse error messages: filter noise, extract meaningful lines
  const errors = result.errors
    .map(e => e.message.trim())
    .filter(Boolean)

  return { valid: false, errors }
}
