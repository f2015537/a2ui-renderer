export interface TextFieldProps {
  label: string
  placeholder?: string
  required?: boolean
  /** Current value, owned by `A2UIRenderer` and keyed there by `fieldId`. */
  value: string
  onChange: (value: string) => void
}

/** Single-line text input for an `A2UITextField` component. */
export function TextField({
  label,
  placeholder,
  required,
  value,
  onChange,
}: TextFieldProps) {
  return (
    <label className="a2ui-text-field">
      <span className="a2ui-text-field__label">
        {label}
        {required ? (
          <span className="a2ui-text-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </span>
      <input
        className="a2ui-text-field__input"
        type="text"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
