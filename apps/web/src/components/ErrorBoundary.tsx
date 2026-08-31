import { ReactNode, Component, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h1 style={{ color: '#ff6b6b' }}>Initialization Error</h1>
          <p style={{ color: '#666', maxWidth: '500px', lineHeight: '1.6' }}>
            {this.state.error.message}
          </p>
          <details style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '4px', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Stack trace</summary>
            <pre style={{ overflow: 'auto', fontSize: '12px', marginTop: '10px' }}>
              {this.state.error.stack}
            </pre>
          </details>
          <p style={{ marginTop: '30px', color: '#999', fontSize: '14px' }}>
            Check browser console for more details
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
