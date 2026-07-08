import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '../../components/Form'
import type { A2UITextField } from '../../types/a2ui'

const fields: A2UITextField[] = [
  {
    type: 'text-field',
    fieldId: 'email',
    label: 'Email',
    required: true,
  },
  {
    type: 'text-field',
    fieldId: 'nickname',
    label: 'Nickname',
    required: false,
  },
]

describe('Form', () => {
  it('renders each field', () => {
    render(
      <Form
        fields={fields}
        submitAction={{ name: 'submitSignup' }}
        submitLabel="Sign up"
        onEvent={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('blocks submit and shows an inline error when a required field is empty', async () => {
    const onEvent = vi.fn()
    const user = userEvent.setup()
    render(
      <Form
        fields={fields}
        submitAction={{ name: 'submitSignup' }}
        submitLabel="Sign up"
        onEvent={onEvent}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(onEvent).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required.')
  })

  it('fires onEvent with the collected values on a valid submit', async () => {
    const onEvent = vi.fn()
    const user = userEvent.setup()
    render(
      <Form
        fields={fields}
        submitAction={{ name: 'submitSignup' }}
        submitLabel="Sign up"
        onEvent={onEvent}
      />,
    )

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/nickname/i), 'AB')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(onEvent).toHaveBeenCalledWith({
      type: 'form-submit',
      action: { name: 'submitSignup' },
      fieldIds: ['email', 'nickname'],
      values: { email: 'a@b.com', nickname: 'AB' },
    })
  })
})
