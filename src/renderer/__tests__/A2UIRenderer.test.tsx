import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { A2UIRenderer } from '../A2UIRenderer'
import { validateA2UI } from '../../lib/validateA2UI'
import { brokenPayloadFixture, simpleCardFixture } from '../../types/fixtures'

describe('A2UIRenderer', () => {
  it('renders a valid payload normally', () => {
    render(
      <A2UIRenderer
        result={validateA2UI(simpleCardFixture)}
        onEvent={vi.fn()}
      />,
    )
    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('renders a fallback listing the problems instead of throwing, for a malformed payload', () => {
    expect(() =>
      render(
        <A2UIRenderer
          result={validateA2UI(brokenPayloadFixture)}
          onEvent={vi.fn()}
        />,
      ),
    ).not.toThrow()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/unknown component type/)).toBeInTheDocument()
    expect(
      screen.getByText(/label: required string is missing/),
    ).toBeInTheDocument()
  })
})
