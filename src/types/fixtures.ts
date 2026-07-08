/**
 * Example A2UI payloads used for development, tests, and manual rendering
 * checks before a real backend is wired up.
 */
import type { A2UIPayload } from './a2ui'

/** A minimal payload: a single card with a heading and a button. */
export const simpleCardFixture: A2UIPayload = {
  id: 'fixture-simple-card',
  version: '1.0',
  root: {
    type: 'card',
    children: [
      { type: 'text', content: 'Welcome back!' },
      {
        type: 'button',
        label: 'Continue',
        action: { name: 'continue' },
        variant: 'primary',
      },
    ],
  },
}

/**
 * A card containing a form: the form references two text-fields by id and
 * shares its submit action's name with the button that triggers it. This
 * demonstrates nested composition and how a form is wired to its fields
 * and submit control without nesting them as its children.
 */
export const signupFormFixture: A2UIPayload = {
  id: 'fixture-signup-form',
  version: '1.0',
  root: {
    type: 'card',
    children: [
      { type: 'text', content: 'Create your account' },
      {
        type: 'form',
        fieldIds: ['email', 'password'],
        submitAction: { name: 'submitSignup' },
      },
      {
        type: 'text-field',
        fieldId: 'email',
        label: 'Email',
        placeholder: 'you@example.com',
        required: true,
      },
      {
        type: 'text-field',
        fieldId: 'password',
        label: 'Password',
        placeholder: '••••••••',
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

/**
 * A container with two cards, showing composition across three levels of
 * nesting (container > card > text/button).
 */
export const dashboardFixture: A2UIPayload = {
  id: 'fixture-dashboard',
  version: '1.0',
  root: {
    type: 'container',
    children: [
      {
        type: 'card',
        children: [
          { type: 'text', content: 'Storage used: 42%' },
          {
            type: 'button',
            label: 'Manage storage',
            action: { name: 'openStorageSettings' },
            variant: 'secondary',
          },
        ],
      },
      {
        type: 'card',
        children: [
          { type: 'text', content: 'Your subscription renews in 12 days.' },
          {
            type: 'button',
            label: 'Cancel subscription',
            action: { name: 'cancelSubscription' },
            variant: 'danger',
          },
        ],
      },
    ],
  },
}

/**
 * Intentionally malformed payload for exercising `validateA2UI` and
 * `A2UIRenderer`'s fallback UI: an unknown component type, and a button
 * missing its required `label`. Typed `unknown` (rather than
 * `A2UIPayload`) since it deliberately doesn't conform to the schema.
 */
export const brokenPayloadFixture: unknown = {
  id: 'fixture-broken',
  version: '1.0',
  root: {
    type: 'container',
    children: [
      { type: 'text', content: 'Before the broken bits.' },
      { type: 'not-a-real-type', foo: 'bar' },
      { type: 'button', action: { name: 'doSomething' } },
    ],
  },
}
