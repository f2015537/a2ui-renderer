export interface CheckboxProps {
  label: string
  required?: boolean
  /** Current value; owned by whichever component renders this field directly (`Form`, for fields inside one, or `A2UIRenderer`, for standalone fields). */
  checked: boolean
  onChange: (checked: boolean) => void
  /** Inline validation message to display below the field, if any. */
  error?: string
}

/** Boolean toggle for an `A2UICheckbox` component. */
export function Checkbox({
  label,
  required,
  checked,
  onChange,
  error,
}: CheckboxProps) {
  return (
    <label className="a2ui-checkbox a2ui-enter">
      <span className="a2ui-checkbox__row">
        <input
          className="a2ui-checkbox__input"
          type="checkbox"
          required={required}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
        />
        <span className="a2ui-checkbox__label">
          {label}
          {required ? (
            <span className="a2ui-checkbox__required" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </span>
      </span>
      {error ? (
        <span className="a2ui-checkbox__error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
