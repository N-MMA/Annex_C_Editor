import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          margin: '48px auto', maxWidth: 600, padding: '32px 24px',
          border: '1px solid #fca5a5', borderRadius: 8,
          background: '#fee2e2', color: '#991b1b', fontFamily: 'system-ui, sans-serif',
        }}>
          <h2 style={{ marginBottom: 12 }}>Erro inesperado</h2>
          <p style={{ marginBottom: 16 }}>
            Ocorreu um erro interno na aplicação. Por favor recarregue a página.
          </p>
          <pre style={{
            background: '#fff', padding: 12, borderRadius: 4,
            fontSize: 12, overflowX: 'auto', color: '#7f1d1d',
          }}>
            {this.state.error.message}
          </pre>
          <button
            style={{
              marginTop: 20, padding: '10px 20px', background: '#991b1b',
              color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
