import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select } from '../Select'

const options = [
  { label: 'Engineer', value: 'engineer' },
  { label: 'Designer', value: 'designer' },
]

describe('Select', () => {
  it('renders the label and every option', () => {
    render(
      <Select label="Role" options={options} value="" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Engineer' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Designer' })).toBeInTheDocument()
  })

  it('reflects the current value', () => {
    render(
      <Select
        label="Role"
        options={options}
        value="designer"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Role')).toHaveValue('designer')
  })

  it('shows a required marker when required', () => {
    render(
      <Select
        label="Role"
        options={options}
        required
        value=""
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange with the selected value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select label="Role" options={options} value="" onChange={onChange} />,
    )
    await user.selectOptions(screen.getByLabelText('Role'), 'designer')
    expect(onChange).toHaveBeenCalledWith('designer')
  })

  it('shows an inline error when passed', () => {
    render(
      <Select
        label="Role"
        options={options}
        value=""
        onChange={vi.fn()}
        error="Role is required."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Role is required.')
  })
})
