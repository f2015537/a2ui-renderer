import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('shows the fallback instead of crashing when a child throws', () => {
    // The DOM environment logs uncaught render errors to the console; this
    // is expected noise for this test, not something to assert on.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <ErrorBoundary fallback={<p>Something went wrong.</p>}>
          <Bomb />
        </ErrorBoundary>,
      ),
    ).not.toThrow()

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
