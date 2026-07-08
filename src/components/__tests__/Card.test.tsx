import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from '../Card'

describe('Card', () => {
  it('renders its children', () => {
    render(
      <Card>
        <p>Inside the card</p>
      </Card>,
    )
    expect(screen.getByText('Inside the card')).toBeInTheDocument()
  })

  it('defaults to the elevated style', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>,
    )
    expect(container.querySelector('.a2ui-card--elevated')).not.toBeNull()
    expect(container.querySelector('.a2ui-card--flat')).toBeNull()
  })

  it('applies the flat style when passed', () => {
    const { container } = render(
      <Card style="flat">
        <p>Content</p>
      </Card>,
    )
    expect(container.querySelector('.a2ui-card--flat')).not.toBeNull()
    expect(container.querySelector('.a2ui-card--elevated')).toBeNull()
  })
})
