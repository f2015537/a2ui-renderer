export interface TextFieldProps {
  label: string
  placeholder?: string
  required?: boolean
  /** Current value; owned by whichever component renders this field directly (`Form`, for fields inside one, or `A2UIRenderer`, for standalone fields). */
  value: string
  onChange: (value: string) => void
  /** Inline validation message to display below the field, if any. */
  error?: string
}

/** Single-line text input for an `A2UITextField` component. */
export function TextField({
  label,
  placeholder,
  required,
  value,
  onChange,
  error,
}: TextFieldProps) {
  return (
    <label className="a2ui-text-field a2ui-enter">
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
        aria-invalid={error ? true : undefined}
      />
      {error ? (
        <span className="a2ui-text-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
