import { useState } from 'react'
import type {
  A2UIAction,
  A2UIButtonVariant,
  A2UIEvent,
  A2UIFormField,
} from '../types/a2ui'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Select } from './Select'
import { TextField } from './TextField'

export interface FormProps {
  /** The fields this form collects values for, resolved by the renderer from `fieldIds`. */
  fields: A2UIFormField[]
  /** Action fired, with the collected field values, once validation passes. */
  submitAction: A2UIAction
  /** Label for the generated submit button, resolved by the renderer from a matching sibling `button`. */
  submitLabel: string
  /** Visual emphasis for the generated submit button. */
  submitVariant?: A2UIButtonVariant
  /** Called with a `form-submit` event once validation passes. */
  onEvent: (event: A2UIEvent) => void
}

type FieldValue = string | boolean

function isFieldFilled(
  field: A2UIFormField,
  value: FieldValue | undefined,
): boolean {
  if (field.type === 'checkbox') {
    return value === true
  }
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Renders an `A2UIForm`'s fields and submit control, and owns the
 * controlled state for them.
 *
 * `Form` renders its fields directly as ordinary React children, so there
 * is only one level of nesting between them — plain `value`/`onChange`
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
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
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
      if (field.required && !isFieldFilled(field, values[field.fieldId])) {
        nextErrors[field.fieldId] =
          field.type === 'checkbox'
            ? `${field.label} must be checked.`
            : `${field.label} is required.`
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const collected: Record<string, FieldValue> = {}
    for (const field of fields) {
      collected[field.fieldId] =
        values[field.fieldId] ?? (field.type === 'checkbox' ? false : '')
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
      {fields.map((field) => {
        const error = errors[field.fieldId]
        switch (field.type) {
          case 'text-field':
            return (
              <TextField
                key={field.fieldId}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                value={
                  typeof values[field.fieldId] === 'string'
                    ? (values[field.fieldId] as string)
                    : ''
                }
                onChange={(value) => handleFieldChange(field.fieldId, value)}
                error={error}
              />
            )
          case 'select':
            return (
              <Select
                key={field.fieldId}
                label={field.label}
                options={field.options}
                required={field.required}
                value={
                  typeof values[field.fieldId] === 'string'
                    ? (values[field.fieldId] as string)
                    : ''
                }
                onChange={(value) => handleFieldChange(field.fieldId, value)}
                error={error}
              />
            )
          case 'checkbox':
            return (
              <Checkbox
                key={field.fieldId}
                label={field.label}
                required={field.required}
                checked={values[field.fieldId] === true}
                onChange={(checked) =>
                  handleFieldChange(field.fieldId, checked)
                }
                error={error}
              />
            )
        }
      })}
      <Button
        label={submitLabel}
        variant={submitVariant}
        onClick={handleSubmit}
      />
    </div>
  )
}
