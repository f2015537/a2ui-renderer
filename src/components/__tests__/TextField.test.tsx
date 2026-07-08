import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TextField } from '../TextField'

describe('TextField', () => {
  it('renders the label, placeholder, and current value', () => {
    render(
      <TextField
        label="Email"
        placeholder="you@example.com"
        value="a@b.com"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Email')).toHaveValue('a@b.com')
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('shows a required marker when required', () => {
    render(<TextField label="Email" required value="" onChange={vi.fn()} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange with the new value as the user types', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TextField label="Email" value="" onChange={onChange} />)
    await user.type(screen.getByLabelText('Email'), 'x')
    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('shows an inline error when passed', () => {
    render(
      <TextField
        label="Email"
        value=""
        onChange={vi.fn()}
        error="Email is required."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required.')
  })
})
