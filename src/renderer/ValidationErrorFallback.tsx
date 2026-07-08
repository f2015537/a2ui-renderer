export interface ValidationErrorFallbackProps {
  errors: string[]
}

/** Shown instead of a broken/invalid A2UI payload, listing what's wrong. */
export function ValidationErrorFallback({
  errors,
}: ValidationErrorFallbackProps) {
  return (
    <div className="a2ui-error a2ui-enter" role="alert">
      <p className="a2ui-error__heading">This UI couldn&apos;t be displayed.</p>
      <ul className="a2ui-error__list">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
