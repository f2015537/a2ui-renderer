import type { A2UIButtonVariant } from '../types/a2ui'

export interface ButtonProps {
  label: string
  variant?: A2UIButtonVariant
  /** Called when the button is pressed; the renderer decides what event this becomes. */
  onClick: () => void
}

/** Clickable control for an `A2UIButton` component. */
export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      type="button"
      className={`a2ui-button a2ui-button--${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
