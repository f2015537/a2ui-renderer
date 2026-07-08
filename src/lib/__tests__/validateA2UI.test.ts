import { describe, expect, it } from 'vitest'
import { validateA2UI } from '../validateA2UI'
import { brokenPayloadFixture, simpleCardFixture } from '../../types/fixtures'

describe('validateA2UI', () => {
  it('accepts a well-formed payload', () => {
    const result = validateA2UI(simpleCardFixture)
    expect(result).toEqual({ valid: true, payload: simpleCardFixture })
  })

  it('rejects an unknown component type', () => {
    const result = validateA2UI(brokenPayloadFixture)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(
        result.errors.some((error) =>
          error.includes('unknown component type "not-a-real-type"'),
        ),
      ).toBe(true)
    }
  })

  it('rejects a component missing a required field', () => {
    const result = validateA2UI(brokenPayloadFixture)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(
        result.errors.some((error) =>
          error.includes('label: required string is missing'),
        ),
      ).toBe(true)
    }
  })

  it('rejects a non-object input', () => {
    const result = validateA2UI('not an object')
    expect(result).toEqual({
      valid: false,
      errors: ['payload: expected an object'],
    })
  })

  it('rejects a form with a malformed submitAction', () => {
    const result = validateA2UI({
      root: {
        type: 'form',
        fieldIds: ['email'],
        submitAction: { payload: {} },
      },
    })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(
        result.errors.some((error) =>
          error.includes('submitAction.name: required string is missing'),
        ),
      ).toBe(true)
    }
  })
})
