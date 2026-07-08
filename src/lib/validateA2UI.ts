import type { A2UIComponent, A2UIPayload } from '../types/a2ui'
import { assertUnreachable } from './assertUnreachable'

/** Component types the schema currently supports. */
const COMPONENT_TYPES: readonly A2UIComponent['type'][] = [
  'container',
  'card',
  'text',
  'button',
  'text-field',
  'select',
  'checkbox',
  'form',
]

function isComponentType(value: string): value is A2UIComponent['type'] {
  return (COMPONENT_TYPES as readonly string[]).includes(value)
}

/** Kept in sync with `A2UIButtonVariant` in `src/types/a2ui.ts`. */
const BUTTON_VARIANTS: readonly string[] = ['primary', 'secondary', 'danger']

/** Kept in sync with `A2UICardStyle` in `src/types/a2ui.ts`. */
const CARD_STYLES: readonly string[] = ['elevated', 'flat']

export interface A2UIValidationSuccess {
  valid: true
  payload: A2UIPayload
}

export interface A2UIValidationFailure {
  valid: false
  /** Human-readable, path-prefixed descriptions of every problem found. */
  errors: string[]
}

export type A2UIValidationResult = A2UIValidationSuccess | A2UIValidationFailure

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function validateAction(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an action object`)
    return
  }
  if (!isString(value.name)) {
    errors.push(`${path}.name: required string is missing`)
  }
  if (value.payload !== undefined && !isRecord(value.payload)) {
    errors.push(`${path}.payload: must be an object when present`)
  }
}

function validateChildren(
  value: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  if (!Array.isArray(value.children)) {
    errors.push(`${path}.children: required array is missing`)
    return
  }
  value.children.forEach((child, index) => {
    validateComponent(child, `${path}.children[${index}]`, errors)
  })
}

function validateComponent(
  value: unknown,
  path: string,
  errors: string[],
): void {
  if (!isRecord(value)) {
    errors.push(`${path}: expected a component object`)
    return
  }

  const { type } = value
  if (!isString(type) || !isComponentType(type)) {
    errors.push(`${path}.type: unknown component type ${JSON.stringify(type)}`)
    return
  }

  switch (type) {
    case 'container':
      validateChildren(value, path, errors)
      break

    case 'card':
      if (
        value.style !== undefined &&
        !(isString(value.style) && CARD_STYLES.includes(value.style))
      ) {
        errors.push(
          `${path}.style: must be one of ${CARD_STYLES.map((s) => `"${s}"`).join(', ')} when present`,
        )
      }
      validateChildren(value, path, errors)
      break

    case 'text':
      if (!isString(value.content)) {
        errors.push(`${path}.content: required string is missing`)
      }
      break

    case 'button':
      if (!isString(value.label)) {
        errors.push(`${path}.label: required string is missing`)
      }
      validateAction(value.action, `${path}.action`, errors)
      if (
        value.variant !== undefined &&
        !(isString(value.variant) && BUTTON_VARIANTS.includes(value.variant))
      ) {
        errors.push(
          `${path}.variant: must be one of ${BUTTON_VARIANTS.map((v) => `"${v}"`).join(', ')} when present`,
        )
      }
      break

    case 'text-field':
      if (!isString(value.label)) {
        errors.push(`${path}.label: required string is missing`)
      }
      if (!isString(value.fieldId)) {
        errors.push(`${path}.fieldId: required string is missing`)
      }
      if (value.placeholder !== undefined && !isString(value.placeholder)) {
        errors.push(`${path}.placeholder: must be a string when present`)
      }
      if (value.required !== undefined && typeof value.required !== 'boolean') {
        errors.push(`${path}.required: must be a boolean when present`)
      }
      break

    case 'select':
      if (!isString(value.label)) {
        errors.push(`${path}.label: required string is missing`)
      }
      if (!isString(value.fieldId)) {
        errors.push(`${path}.fieldId: required string is missing`)
      }
      if (!Array.isArray(value.options) || value.options.length === 0) {
        errors.push(`${path}.options: required non-empty array is missing`)
      } else {
        value.options.forEach((option, index) => {
          if (
            !isRecord(option) ||
            !isString(option.label) ||
            !isString(option.value)
          ) {
            errors.push(
              `${path}.options[${index}]: expected { label: string, value: string }`,
            )
          }
        })
      }
      if (value.required !== undefined && typeof value.required !== 'boolean') {
        errors.push(`${path}.required: must be a boolean when present`)
      }
      break

    case 'checkbox':
      if (!isString(value.label)) {
        errors.push(`${path}.label: required string is missing`)
      }
      if (!isString(value.fieldId)) {
        errors.push(`${path}.fieldId: required string is missing`)
      }
      if (value.required !== undefined && typeof value.required !== 'boolean') {
        errors.push(`${path}.required: must be a boolean when present`)
      }
      break

    case 'form':
      if (!Array.isArray(value.fieldIds) || !value.fieldIds.every(isString)) {
        errors.push(`${path}.fieldIds: required array of strings is missing`)
      }
      validateAction(value.submitAction, `${path}.submitAction`, errors)
      break

    default:
      assertUnreachable(type)
  }
}

/**
 * Validates a parsed but untrusted value against the A2UI schema: unknown
 * component types and missing/mistyped required fields are collected as
 * human-readable errors rather than thrown. Callers (e.g. `A2UIRenderer`)
 * are expected to show `errors` instead of crashing when `valid` is false.
 */
export function validateA2UI(input: unknown): A2UIValidationResult {
  if (!isRecord(input)) {
    return { valid: false, errors: ['payload: expected an object'] }
  }

  const errors: string[] = []
  validateComponent(input.root, 'root', errors)

  if (input.id !== undefined && !isString(input.id)) {
    errors.push('id: must be a string when present')
  }
  if (input.version !== undefined && !isString(input.version)) {
    errors.push('version: must be a string when present')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, payload: input as unknown as A2UIPayload }
}
