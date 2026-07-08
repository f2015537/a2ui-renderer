import { useState } from 'react'
import type {
  A2UIAction,
  A2UIButtonVariant,
  A2UIEvent,
  A2UITextField,
} from '../types/a2ui'
import { Button } from './Button'
import { TextField } from './TextField'

export interface FormProps {
  /** The text-fields this form collects values for, resolved by the renderer from `fieldIds`. */
  fields: A2UITextField[]
  /** Action fired, with the collected field values, once validation passes. */
  submitAction: A2UIAction
  /** Label for the generated submit button, resolved by the renderer from a matching sibling `button`. */
  submitLabel: string
  /** Visual emphasis for the generated submit button. */
  submitVariant?: A2UIButtonVariant
  /** Called with a `form-submit` event once validation passes. */
  onEvent: (event: A2UIEvent) => void
}

/**
 * Renders an `A2UIForm`'s fields and submit control, and owns the
 * controlled state for them.
 *
 * `Form` renders its `TextField`s directly as ordinary React children, so
 * there is only one level of nesting between them — plain `value`/`onChange`
 * props are enough to keep each field controlled. Context would only earn
 * its keep if fields were rendered further away (e.g. through an
 * intermediate layout component that Form doesn't control); that's not the
 * case here, so it would just be indirection with no benefit.
 */
export function Form({
  fields,
  submitAction,
  submitLabel,
  submitVariant,
  onEvent,
}: FormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      if (!(fieldId in prev)) return prev
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    for (const field of fields) {
      if (field.required && !(values[field.fieldId] ?? '').trim()) {
        nextErrors[field.fieldId] = `${field.label} is required.`
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const collected: Record<string, string> = {}
    for (const field of fields) {
      collected[field.fieldId] = values[field.fieldId] ?? ''
    }
    onEvent({
      type: 'form-submit',
      action: submitAction,
      fieldIds: fields.map((field) => field.fieldId),
      values: collected,
    })
  }

  return (
    <div className="a2ui-form a2ui-enter">
      {fields.map((field) => (
        <TextField
          key={field.fieldId}
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
          value={values[field.fieldId] ?? ''}
          onChange={(value) => handleFieldChange(field.fieldId, value)}
          error={errors[field.fieldId]}
        />
      ))}
      <Button
        label={submitLabel}
        variant={submitVariant}
        onClick={handleSubmit}
      />
    </div>
  )
}
