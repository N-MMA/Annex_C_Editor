import { useState } from 'react'
import { Download, FileSpreadsheet, FileCode2, RefreshCw } from 'lucide-react'
import { FileDropZone } from './components/FileDropZone'
import { ValidationReport } from './components/ValidationReport'
import { generateTemplate } from './lib/excelTemplate'
import { parseExcel } from './lib/excelParser'
import { generateXML } from './lib/xmlGenerator'
import { parseXML } from './lib/xmlParser'
import { validate } from './lib/validation'
import type { RFCData, ValidationError } from './types'
import './App.css'

type Tab = 'template' | 'excel2xml' | 'xml2excel'

function downloadBlob(data: BlobPart, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Tab 1: Generate blank template ──────────────────────────────────────────

function TemplateTab() {
  function download() {
    const buf = generateTemplate()
    downloadBlob(
      buf,
      'AnexoC_Modelo.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }
  return (
    <div className="tab-content">
      <h2>Gerar Modelo Excel</h2>
      <p className="description">
        Descarregue o modelo pré-formatado com as folhas <strong>Configuração</strong>,{' '}
        <strong>Ações_Formação</strong>, <strong>Trabalhadores</strong> e{' '}
        <strong>Códigos</strong> de referência. As colunas de código têm menus pendentes
        com os valores válidos.
      </p>
      <button className="btn-primary" onClick={download}>
        <Download size={18} />
        Descarregar Modelo Excel
      </button>
      <div className="info-box">
        <strong>Como preencher:</strong>
        <ol>
          <li>Preencha a folha <em>Configuração</em> com os dados da entidade.</li>
          <li>
            Na folha <em>Ações_Formação</em>, registe cada ação de formação com um ID
            único (1, 2, 3, …).
          </li>
          <li>
            Na folha <em>Trabalhadores</em>, insira uma linha por trabalhador por formação.
            Trabalhadores sem formação ficam numa linha com as colunas de formação em branco.
          </li>
          <li>Consulte a folha <em>Códigos</em> para todos os valores de código válidos.</li>
        </ol>
      </div>
    </div>
  )
}

// ── Tab 2: Excel → XML ──────────────────────────────────────────────────────

function ExcelToXmlTab() {
  const [errors, setErrors] = useState<ValidationError[] | null>(null)
  const [data, setData] = useState<RFCData | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [filename, setFilename] = useState('')

  async function handleFile(file: File) {
    setErrors(null)
    setData(null)
    setParseError(null)
    setFilename(file.name)
    try {
      const buf = await file.arrayBuffer()
      const parsed = parseExcel(buf)
      const errs = validate(parsed)
      setData(parsed)
      setErrors(errs)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e))
    }
  }

  function downloadXML() {
    if (!data) return
    const xml = generateXML(data)
    const baseName = filename.replace(/\.[^.]+$/, '')
    downloadBlob(xml, `${baseName}_AnexoC.xml`, 'application/xml')
  }

  const canExport = data !== null && errors !== null && errors.length === 0

  return (
    <div className="tab-content">
      <h2>Excel → XML</h2>
      <p className="description">
        Carregue o ficheiro Excel preenchido para validar os dados e gerar o XML
        pronto a submeter na plataforma do Relatório Único.
      </p>
      <FileDropZone
        accept=".xlsx,.xls"
        label="Ficheiro Excel (.xlsx)"
        onFile={handleFile}
      />
      {parseError && (
        <div className="error-box">
          <strong>Erro ao ler o ficheiro:</strong> {parseError}
        </div>
      )}
      {errors !== null && <ValidationReport errors={errors} />}
      {data && (
        <div className="summary-box">
          <strong>Resumo:</strong>{' '}
          {data.trainingActions.length} ação(ões) de formação ·{' '}
          {data.workers.length} trabalhador(es)
        </div>
      )}
      {canExport && (
        <button className="btn-primary" onClick={downloadXML}>
          <Download size={18} />
          Exportar XML
        </button>
      )}
      {errors !== null && errors.length > 0 && (
        <p className="hint">Corrija os erros no Excel e carregue o ficheiro novamente.</p>
      )}
    </div>
  )
}

// ── Tab 3: XML → Excel ──────────────────────────────────────────────────────

function XmlToExcelTab() {
  const [parseError, setParseError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleFile(file: File) {
    setParseError(null)
    setDone(false)
    try {
      const text = await file.text()
      const data = parseXML(text)
      const buf = generateTemplate(data)
      const baseName = file.name.replace(/\.[^.]+$/, '')
      downloadBlob(
        buf,
        `${baseName}_editavel.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      setDone(true)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="tab-content">
      <h2>XML → Excel</h2>
      <p className="description">
        Carregue um ficheiro XML existente do Anexo C para o converter num Excel
        editável. Edite os dados e volte a exportar para XML.
      </p>
      <FileDropZone
        accept=".xml"
        label="Ficheiro XML do Anexo C"
        onFile={handleFile}
      />
      {parseError && (
        <div className="error-box">
          <strong>Erro ao ler o XML:</strong> {parseError}
        </div>
      )}
      {done && (
        <div className="validation-ok">
          <RefreshCw size={20} />
          <span>Excel gerado e descarregado com sucesso.</span>
        </div>
      )}
    </div>
  )
}

// ── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>('template')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'template', label: 'Gerar Modelo', icon: <FileSpreadsheet size={18} /> },
    { id: 'excel2xml', label: 'Excel → XML', icon: <FileCode2 size={18} /> },
    { id: 'xml2excel', label: 'XML → Excel', icon: <RefreshCw size={18} /> },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Anexo C — Relatório Único 2025</h1>
          <span className="header-sub">Formação Contínua · Conversor Excel ↔ XML</span>
        </div>
      </header>

      <nav className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {tab === 'template' && <TemplateTab />}
        {tab === 'excel2xml' && <ExcelToXmlTab />}
        {tab === 'xml2excel' && <XmlToExcelTab />}
      </main>

      <footer className="app-footer">
        Relatório Único 2025 · XML_DATA 1.2.14 · Schema GEP/MSESS
      </footer>
    </div>
  )
}
