/**
 * A2UI JSON Schema.
 *
 * A simplified schema describing a tree of UI components that a server can
 * send to a client for rendering, without the client needing prior
 * knowledge of the specific screen being displayed.
 */

/**
 * An action a component can trigger, such as a button press or a form
 * submission. Kept generic so a renderer can dispatch it to whatever
 * handler the host application registers under `name`.
 */
export interface A2UIAction {
  /** Identifier the host application uses to look up a handler. */
  name: string
  /** Optional data to pass to the handler when the action fires. */
  payload?: Record<string, unknown>
}

/**
 * A generic layout container. Renders its children in document order and
 * carries no inherent visual styling of its own.
 */
export interface A2UIContainer {
  type: 'container'
  /** Child components to render inside this container. */
  children: A2UIComponent[]
}

/**
 * A visually distinct surface (e.g. border/elevation) that groups related
 * components, such as a form or a summary block.
 */
export interface A2UICard {
  type: 'card'
  /** Child components to render inside this card. */
  children: A2UIComponent[]
}

/** A block of static, non-interactive text. */
export interface A2UIText {
  type: 'text'
  /** The text to display. */
  content: string
}

/** Visual emphasis of a button. */
export type A2UIButtonVariant = 'primary' | 'secondary' | 'danger'

/** A clickable button that triggers an action. */
export interface A2UIButton {
  type: 'button'
  /** Text shown on the button. */
  label: string
  /** Action dispatched when the button is pressed. */
  action: A2UIAction
  /** Visual emphasis; renderers should treat a missing value as 'primary'. */
  variant?: A2UIButtonVariant
}

/** A single-line input field for collecting user text. */
export interface A2UITextField {
  type: 'text-field'
  /** Label displayed alongside the field. */
  label: string
  /** Hint text shown when the field is empty. */
  placeholder?: string
  /** Identifier used to associate this field's value with a form. */
  fieldId: string
  /** Whether the field must be filled in before its form can submit. */
  required?: boolean
}

/**
 * A form that groups a set of fields (referenced by id, not nested as
 * children) and submits their combined values via a single action.
 */
export interface A2UIForm {
  type: 'form'
  /** Ids of the `text-field` components whose values this form collects. */
  fieldIds: string[]
  /** Action dispatched with the collected field values on submit. */
  submitAction: A2UIAction
}

/**
 * Discriminated union of every renderable A2UI component. Consumers should
 * switch on `type` to narrow to the specific variant.
 */
export type A2UIComponent =
  A2UIContainer | A2UICard | A2UIText | A2UIButton | A2UITextField | A2UIForm

/** Fired when a `button` component is pressed and is not wired to a form. */
export interface A2UIButtonClickEvent {
  type: 'button-click'
  /** The action from the button that was pressed. */
  action: A2UIAction
}

/**
 * Fired when a `button` whose `action.name` matches a `form`'s
 * `submitAction.name` is pressed. Carries the collected values for that
 * form's fields.
 */
export interface A2UIFormSubmitEvent {
  type: 'form-submit'
  /** The form's submit action. */
  action: A2UIAction
  /** Ids of the fields the form collects, in the order the form declares. */
  fieldIds: string[]
  /** Current value of each field, keyed by `fieldId`. */
  values: Record<string, string>
}

/**
 * Discriminated union of every event an `A2UIRenderer` can emit back to its
 * host via `onEvent`. Consumers should switch on `type` to narrow.
 */
export type A2UIEvent = A2UIButtonClickEvent | A2UIFormSubmitEvent

/**
 * The top-level message sent from server to client describing a screen (or
 * screen fragment) to render.
 */
export interface A2UIPayload {
  /** Root component of the tree to render. */
  root: A2UIComponent
  /** Unique identifier for this payload, e.g. for diffing/reconciliation. */
  id?: string
  /** Schema/payload version, for forward compatibility. */
  version?: string
}
