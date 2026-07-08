# Prompts

A log of prompts given to Claude Code for this project, recorded before each commit.

## 2026-07-08

> Set up a new Vite + React + TypeScript project called "a2ui-renderer".
> Requirements:
> - React 18, TypeScript strict mode
> - Vitest + React Testing Library for tests
> - ESLint + Prettier configured
> - Folder structure: src/types, src/renderer, src/components, src/demo, src/lib
> - Initialize git, create a .gitignore for node_modules/dist/.env
> - First commit: "chore: scaffold Vite + React + TS project"
> Don't build any A2UI logic yet, just the skeleton and confirm it runs with npm run dev.

> maintain a Prompts.md file in the root repo where you log each prompt before committing to git

> push this to github

> In src/types/a2ui.ts, define TypeScript types for a simplified A2UI JSON schema
> supporting these 6 component types: container, card, text, button, text-field, form.
>
> Requirements:
> - A discriminated union `A2UIComponent` keyed on `type`
> - Each variant has only the props it needs (e.g. text-field has label, placeholder,
>   fieldId, required; button has label, action, variant; form has fieldIds and
>   submitAction; container/card have `children: A2UIComponent[]`)
> - A top-level `A2UIPayload` type wrapping a root component plus optional metadata
>   (id, version)
> - Add JSDoc comments explaining each field
> - Write 2-3 example payloads as const fixtures in src/types/fixtures.ts covering
>   nested composition (a card containing a form containing text-fields and a button)
> Commit as "feat: define A2UI schema types and fixtures"

> yes, push it

> Build the A2UIRenderer component in src/renderer/A2UIRenderer.tsx.
>
> Requirements:
> - Props: `payload: A2UIPayload`, `onEvent: (event: A2UIEvent) => void`
> - Recursively renders A2UIComponent trees using a switch/lookup on `type`
> - Each of the 6 component types maps to a presentational component in
>   src/components/ (Container.tsx, Card.tsx, Text.tsx, Button.tsx,
>   TextField.tsx, Form.tsx) — keep the renderer itself thin, it just dispatches
> - Define an `A2UIEvent` union type (button-click, form-submit) in src/types/a2ui.ts
>   and pass it up via onEvent
> - Add basic CSS (CSS modules or plain CSS file, your call) so it's not unstyled,
>   but keep this pass functional over pretty — I'll polish styling later
> Commit as "feat: implement core A2UIRenderer and component set"

> yes

> Add form state handling to Form.tsx and TextField.tsx.
>
> Requirements:
> - Form maintains controlled state for all its child text-fields (a Record<fieldId, value>)
> - TextField is a controlled input reading/writing that shared state via context or
>   props drilling — pick whichever is cleaner given the current structure and explain
>   your choice in a code comment
> - Required-field validation on submit: if a required field is empty, show an inline
>   error and don't fire onEvent
> - On successful submit, call onEvent with type "form-submit", the form's submitAction,
>   and the collected field values
> - Add a small unit test in src/renderer/__tests__/Form.test.tsx covering: renders
>   fields, blocks submit on missing required field, fires onEvent with correct
>   payload on valid submit
> Commit as "feat: add form state management and validation"

> yes

> Build a demo app in src/demo/App.tsx: a minimal chat interface.
>
> Requirements:
> - A text input where the "user" types a message and hits send
> - A mock "agent" (src/demo/mockAgent.ts) that returns different A2UI payloads
>   based on simple keyword matching in the message — implement at least 2 distinct
>   scenarios, e.g.:
>     1. message mentions "signup"/"register" -> returns a card with a form
>        (name, email fields) and a submit button
>     2. message mentions "confirm"/"book" -> returns a card with text + two buttons
>        (confirm/cancel)
> - Each agent response renders via A2UIRenderer in the chat thread
> - Wire onEvent so form submits / button clicks post a follow-up "system" message
>   into the thread showing what was received (simulating sending the interaction
>   back to the agent)
> - Keep chat history in App-level state, newest message at the bottom
> Commit as "feat: add demo chatbot app with two mock agent payloads"
