import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  A2UIButton,
  A2UIComponent,
  A2UIEvent,
  A2UITextField,
} from '../types/a2ui'
import type { A2UIValidationResult } from '../lib/validateA2UI'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { Form } from '../components/Form'
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

interface FormMeta {
  /** Every `text-field` in the tree, keyed by `fieldId`, so forms can resolve their `fieldIds`. */
  fieldsById: Map<string, A2UITextField>
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
  }
}

/**
 * Recursively renders an `A2UIComponent` tree, dispatching each node to its
 * presentational counterpart in `src/components`. The renderer stays thin:
 * its only job beyond dispatch is resolving each `form`'s `fieldIds` and
 * `submitAction` to the actual sibling `text-field`/`button` components (via
 * `FormMeta`) so `Form` can render and validate them directly, and owning
 * controlled state for `text-field`s that aren't part of any form.
 */
export function A2UIRenderer({ result, onEvent }: A2UIRendererProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

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

  const handleFieldChange = (fieldId: string, value: string) => {
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
            value={fieldValues[component.fieldId] ?? ''}
            onChange={(value) => handleFieldChange(component.fieldId, value)}
          />
        )
      case 'form': {
        const fields = component.fieldIds
          .map((fieldId) => formMeta.fieldsById.get(fieldId))
          .filter((field): field is A2UITextField => field !== undefined)
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
