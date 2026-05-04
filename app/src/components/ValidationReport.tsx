import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { ValidationError } from '../types'

interface Props {
  errors: ValidationError[]
}

export function ValidationReport({ errors }: Props) {
  if (errors.length === 0) {
    return (
      <div className="validation-ok">
        <CheckCircle size={20} />
        <span>Sem erros de validação — ficheiro pronto para exportar.</span>
      </div>
    )
  }

  // Group errors by sheet
  const bySheet = new Map<string, ValidationError[]>()
  for (const e of errors) {
    if (!bySheet.has(e.sheet)) bySheet.set(e.sheet, [])
    bySheet.get(e.sheet)!.push(e)
  }

  return (
    <div className="validation-report">
      <div className="validation-header">
        <AlertTriangle size={18} />
        <span>{errors.length} erro{errors.length !== 1 ? 's' : ''} encontrado{errors.length !== 1 ? 's' : ''}</span>
      </div>
      {Array.from(bySheet.entries()).map(([sheet, errs]) => (
        <div key={sheet} className="validation-group">
          <div className="validation-sheet">{sheet}</div>
          <table className="validation-table">
            <thead>
              <tr>
                <th>Linha</th>
                <th>Campo</th>
                <th>Erro</th>
              </tr>
            </thead>
            <tbody>
              {errs.map((e, i) => (
                <tr key={i}>
                  <td>{e.row ?? '—'}</td>
                  <td>{e.field}</td>
                  <td>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
