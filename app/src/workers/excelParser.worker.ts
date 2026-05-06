import { parseExcel } from '../lib/excelParser'
import type { ParseResult } from '../lib/excelParser'

self.onmessage = (e: MessageEvent<ArrayBuffer>) => {
  try {
    const result: ParseResult = parseExcel(e.data)
    self.postMessage({ ok: true, result })
  } catch (err) {
    self.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
