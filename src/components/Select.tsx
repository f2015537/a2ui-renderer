import type { A2UISelectOption } from '../types/a2ui'

export interface SelectProps {
  label: string
  options: A2UISelectOption[]
  required?: boolean
  /** Current value; owned by whichever component renders this field directly (`Form`, for fields inside one, or `A2UIRenderer`, for standalone fields). */
  value: string
  onChange: (value: string) => void
  /** Inline validation message to display below the field, if any. */
  error?: string
}

/** Dropdown input for an `A2UISelect` component. */
export function Select({
  label,
  options,
  required,
  value,
  onChange,
  error,
}: SelectProps) {
  return (
    <label className="a2ui-select a2ui-enter">
      <span className="a2ui-select__label">
        {label}
        {required ? (
          <span className="a2ui-select__required" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </span>
      <select
        className="a2ui-select__input"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
      >
        <option value="" disabled hidden>
          Select…
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="a2ui-select__error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
