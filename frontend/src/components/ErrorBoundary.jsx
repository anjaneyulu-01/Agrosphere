import { Component } from 'react'

/**
 * Catches render/runtime errors in a subtree so one broken section can't blank
 * the entire app (which, on the dark theme, shows up as a "black screen").
 * Shows a small inline fallback and logs the real error to the console.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Keep the real stack visible in the console for debugging.
    console.error(`[${this.props.name || 'Section'}] crashed:`, error, info)
  }

  handleRetry = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl text-center"
             style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold mb-1">
            {this.props.name ? `The ${this.props.name} section ran into a problem.` : 'Something went wrong.'}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            The rest of the page still works. {this.state.error?.message}
          </p>
          <button onClick={this.handleRetry}
                  className="btn-primary text-sm px-4 py-2 rounded-lg">
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
