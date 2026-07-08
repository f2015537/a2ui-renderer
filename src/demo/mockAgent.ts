import type { A2UIPayload } from '../types/a2ui'

let responseCounter = 0

function nextId(prefix: string): string {
  responseCounter += 1
  return `${prefix}-${responseCounter}`
}

/**
 * Stand-in for a real agent backend: matches a few keywords in the user's
 * message and returns a canned A2UI payload. Enough to exercise
 * `A2UIRenderer` end-to-end (nested composition, form validation, plain
 * button clicks) without a real server.
 */
export function getMockAgentResponse(message: string): A2UIPayload {
  const text = message.toLowerCase()

  if (text.includes('signup') || text.includes('register')) {
    return {
      id: nextId('signup'),
      version: '1.0',
      root: {
        type: 'card',
        children: [
          { type: 'text', content: 'Create your account to get started.' },
          {
            type: 'form',
            fieldIds: ['name', 'email'],
            submitAction: { name: 'submitSignup' },
          },
          {
            type: 'text-field',
            fieldId: 'name',
            label: 'Name',
            placeholder: 'Ada Lovelace',
            required: true,
          },
          {
            type: 'text-field',
            fieldId: 'email',
            label: 'Email',
            placeholder: 'ada@example.com',
            required: true,
          },
          {
            type: 'button',
            label: 'Sign up',
            action: { name: 'submitSignup' },
            variant: 'primary',
          },
        ],
      },
    }
  }

  if (text.includes('confirm') || text.includes('book')) {
    return {
      id: nextId('booking'),
      version: '1.0',
      root: {
        type: 'card',
        style: 'flat',
        children: [
          { type: 'text', content: 'Should I confirm this booking for you?' },
          {
            type: 'button',
            label: 'Confirm',
            action: { name: 'confirmBooking' },
            variant: 'primary',
          },
          {
            type: 'button',
            label: 'Cancel',
            action: { name: 'cancelBooking' },
            variant: 'secondary',
          },
        ],
      },
    }
  }

  return {
    id: nextId('fallback'),
    version: '1.0',
    root: {
      type: 'card',
      children: [
        {
          type: 'text',
          content:
            'I didn\'t catch that. Try mentioning "signup" or "book" to see a form or confirmation flow.',
        },
      ],
    },
  }
}
