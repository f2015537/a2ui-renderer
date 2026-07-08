import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  A2UIAction,
  A2UIComponent,
  A2UIEvent,
  A2UIForm,
  A2UIPayload,
} from '../types/a2ui'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { Form } from '../components/Form'
import { Text } from '../components/Text'
import { TextField } from '../components/TextField'
import './A2UIRenderer.css'

export interface A2UIRendererProps {
  /** The payload describing the component tree to render. */
  payload: A2UIPayload
  /** Called whenever an interactive component fires an event. */
  onEvent: (event: A2UIEvent) => void
}

/** Walks the tree and indexes every `form` by its submit action name. */
function collectForms(
  component: A2UIComponent,
  byActionName: Map<string, A2UIForm>,
): void {
  if (component.type === 'form') {
    byActionName.set(component.submitAction.name, component)
    return
  }
  if (component.type === 'container' || component.type === 'card') {
    for (const child of component.children) {
      collectForms(child, byActionName)
    }
  }
}

/**
 * Recursively renders an `A2UIComponent` tree, dispatching each node to its
 * presentational counterpart in `src/components`. The renderer itself only
 * handles dispatch and the small amount of cross-component wiring the
 * schema requires: tracking field values by `fieldId`, and turning a
 * button press into a `form-submit` event (with collected values) when its
 * action matches a form's `submitAction`, or a plain `button-click`
 * otherwise.
 */
export function A2UIRenderer({ payload, onEvent }: A2UIRendererProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const formsByActionName = useMemo(() => {
    const map = new Map<string, A2UIForm>()
    collectForms(payload.root, map)
    return map
  }, [payload.root])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleButtonClick = (action: A2UIAction) => {
    const form = formsByActionName.get(action.name)
    if (form) {
      const values: Record<string, string> = {}
      for (const fieldId of form.fieldIds) {
        values[fieldId] = fieldValues[fieldId] ?? ''
      }
      onEvent({ type: 'form-submit', action, fieldIds: form.fieldIds, values })
      return
    }
    onEvent({ type: 'button-click', action })
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
          <Card key={key}>
            {component.children.map((child, index) =>
              renderComponent(child, index),
            )}
          </Card>
        )
      case 'text':
        return <Text key={key} content={component.content} />
      case 'button':
        return (
          <Button
            key={key}
            label={component.label}
            variant={component.variant}
            onClick={() => handleButtonClick(component.action)}
          />
        )
      case 'text-field':
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
      case 'form':
        return <Form key={key} fieldIds={component.fieldIds} />
    }
  }

  return (
    <div className="a2ui-renderer">{renderComponent(payload.root, 'root')}</div>
  )
}
