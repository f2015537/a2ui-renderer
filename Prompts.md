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
