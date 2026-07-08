import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  A2UIButton,
  A2UIComponent,
  A2UIEvent,
  A2UIFormField,
} from '../types/a2ui'
import type { A2UIValidationResult } from '../lib/validateA2UI'
import { assertUnreachable } from '../lib/assertUnreachable'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Checkbox } from '../components/Checkbox'
import { Container } from '../components/Container'
import { Form } from '../components/Form'
import { Select } from '../components/Select'
import { Text } from '../components/Text'
import { TextField } from '../components/TextField'
import { ErrorBoundary } from './ErrorBoundary'
import { ValidationErrorFallback } from './ValidationErrorFallback'
import './A2UIRenderer.css'

export interface A2UIRendererProps {
  /**
   * The result of validating an incoming payload with `validateA2UI`. When
   * `valid` is false, the renderer shows `errors` instead of attempting to
   * render anything.
   */
  result: A2UIValidationResult
  /** Called whenever an interactive component fires an event. */
  onEvent: (event: A2UIEvent) => void
}

type FieldValue = string | boolean

interface FormMeta {
  /** Every field-capable component in the tree (`text-field`, `select`, `checkbox`), keyed by `fieldId`, so forms can resolve their `fieldIds`. */
  fieldsById: Map<string, A2UIFormField>
  /** Every `button` in the tree, keyed by `action.name`, so forms can borrow a matching button's label/variant. */
  buttonsByActionName: Map<string, A2UIButton>
  /** `fieldId`s claimed by some form; the renderer skips these when it encounters them as standalone siblings, since the form renders them itself. */
  claimedFieldIds: Set<string>
  /** `action.name`s claimed by some form's `submitAction`; skipped for the same reason. */
  claimedActionNames: Set<string>
}

/** Walks the tree once to build the lookups `FormMeta` needs. */
function collectFormMeta(component: A2UIComponent, meta: FormMeta): void {
  switch (component.type) {
    case 'text-field':
    case 'select':
    case 'checkbox':
      meta.fieldsById.set(component.fieldId, component)
      return
    case 'button':
      meta.buttonsByActionName.set(component.action.name, component)
      return
    case 'form':
      meta.claimedActionNames.add(component.submitAction.name)
      for (const fieldId of component.fieldIds) {
        meta.claimedFieldIds.add(fieldId)
      }
      return
    case 'container':
    case 'card':
      for (const child of component.children) {
        collectFormMeta(child, meta)
      }
      return
    case 'text':
      return
    default:
      assertUnreachable(component)
  }
}

/**
 * Recursively renders an `A2UIComponent` tree, dispatching each node to its
 * presentational counterpart in `src/components`. The renderer stays thin:
 * its only job beyond dispatch is resolving each `form`'s `fieldIds` and
 * `submitAction` to the actual sibling field/`button` components (via
 * `FormMeta`) so `Form` can render and validate them directly, and owning
 * controlled state for fields that aren't part of any form.
 */
export function A2UIRenderer({ result, onEvent }: A2UIRendererProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({})

  const formMeta = useMemo(() => {
    const meta: FormMeta = {
      fieldsById: new Map(),
      buttonsByActionName: new Map(),
      claimedFieldIds: new Set(),
      claimedActionNames: new Set(),
    }
    if (result.valid) {
      collectFormMeta(result.payload.root, meta)
    }
    return meta
  }, [result])

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const renderComponent = (
    component: A2UIComponent,
    key: string | number,
  ): ReactNode => {
    switch (component.type) {
      case 'container':
        return (
          <Container key={key}>
            {component.children.map((child, index) =>
              renderComponent(child, index),
            )}
          </Container>
        )
      case 'card':
        return (
          <Card key={key} style={component.style}>
            {component.children.map((child, index) =>
              renderComponent(child, index),
            )}
          </Card>
        )
      case 'text':
        return <Text key={key} content={component.content} />
      case 'button':
        if (formMeta.claimedActionNames.has(component.action.name)) {
          return null
        }
        return (
          <Button
            key={key}
            label={component.label}
            variant={component.variant}
            onClick={() =>
              onEvent({ type: 'button-click', action: component.action })
            }
          />
        )
      case 'text-field':
        if (formMeta.claimedFieldIds.has(component.fieldId)) {
          return null
        }
        return (
          <TextField
            key={key}
            label={component.label}
            placeholder={component.placeholder}
            required={component.required}
            value={
              typeof fieldValues[component.fieldId] === 'string'
                ? (fieldValues[component.fieldId] as string)
                : ''
            }
            onChange={(value) => handleFieldChange(component.fieldId, value)}
          />
        )
      case 'select':
        if (formMeta.claimedFieldIds.has(component.fieldId)) {
          return null
        }
        return (
          <Select
            key={key}
            label={component.label}
            options={component.options}
            required={component.required}
            value={
              typeof fieldValues[component.fieldId] === 'string'
                ? (fieldValues[component.fieldId] as string)
                : ''
            }
            onChange={(value) => handleFieldChange(component.fieldId, value)}
          />
        )
      case 'checkbox':
        if (formMeta.claimedFieldIds.has(component.fieldId)) {
          return null
        }
        return (
          <Checkbox
            key={key}
            label={component.label}
            required={component.required}
            checked={fieldValues[component.fieldId] === true}
            onChange={(checked) =>
              handleFieldChange(component.fieldId, checked)
            }
          />
        )
      case 'form': {
        const fields = component.fieldIds
          .map((fieldId) => formMeta.fieldsById.get(fieldId))
          .filter((field): field is A2UIFormField => field !== undefined)
        const matchingButton = formMeta.buttonsByActionName.get(
          component.submitAction.name,
        )
        return (
          <Form
            key={key}
            fields={fields}
            submitAction={component.submitAction}
            submitLabel={matchingButton?.label ?? 'Submit'}
            submitVariant={matchingButton?.variant}
            onEvent={onEvent}
          />
        )
      }
      default:
        return assertUnreachable(component)
    }
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="a2ui-renderer">
          <ValidationErrorFallback
            errors={['An unexpected error occurred while rendering this UI.']}
          />
        </div>
      }
    >
      <div className="a2ui-renderer">
        {result.valid ? (
          renderComponent(result.payload.root, 'root')
        ) : (
          <ValidationErrorFallback errors={result.errors} />
        )}
      </div>
    </ErrorBoundary>
  )
}
