import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches a runtime error thrown while rendering `children` and shows
 * `fallback` instead. Used around a single `A2UIRenderer` instance so a bug
 * triggered by one agent message can't take down the rest of the chat
 * thread — sibling messages are unaffected since each has its own boundary.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(
      'A2UIRenderer caught a rendering error:',
      error,
      info.componentStack,
    )
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
