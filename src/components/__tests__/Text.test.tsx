import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Text } from '../Text'

describe('Text', () => {
  it('renders the given content', () => {
    render(<Text content="Hello there" />)
    expect(screen.getByText('Hello there')).toBeInTheDocument()
  })
})
