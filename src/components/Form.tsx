export interface FormProps {
  /** Ids of the `text-field` components this form's submit action collects. */
  fieldIds: string[]
}

/**
 * `form` is a behavioral node, not a visual one: the fields it references
 * and the button that submits it are ordinary sibling components elsewhere
 * in the tree. `A2UIRenderer` wires them together by matching `fieldId`s
 * and `action` names, so this component intentionally renders nothing.
 */
export function Form({ fieldIds }: FormProps) {
  void fieldIds
  return null
}
