import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button label="Continue" onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('defaults to the primary variant', () => {
    const { container } = render(<Button label="Go" onClick={vi.fn()} />)
    expect(container.querySelector('.a2ui-button--primary')).not.toBeNull()
  })

  it('applies the requested variant', () => {
    const { container } = render(
      <Button label="Delete" variant="danger" onClick={vi.fn()} />,
    )
    expect(container.querySelector('.a2ui-button--danger')).not.toBeNull()
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button label="Go" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
