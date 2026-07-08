import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from '../Checkbox'

describe('Checkbox', () => {
  it('renders the label', () => {
    render(<Checkbox label="Subscribe" checked={false} onChange={vi.fn()} />)
    expect(screen.getByLabelText(/subscribe/i)).toBeInTheDocument()
  })

  it('reflects the current checked state', () => {
    render(<Checkbox label="Subscribe" checked onChange={vi.fn()} />)
    expect(screen.getByLabelText(/subscribe/i)).toBeChecked()
  })

  it('shows a required marker when required', () => {
    render(
      <Checkbox
        label="Subscribe"
        required
        checked={false}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange with the new checked state', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Checkbox label="Subscribe" checked={false} onChange={onChange} />)
    await user.click(screen.getByLabelText(/subscribe/i))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows an inline error when passed', () => {
    render(
      <Checkbox
        label="Subscribe"
        checked={false}
        onChange={vi.fn()}
        error="Subscribe must be checked."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Subscribe must be checked.',
    )
  })
})
