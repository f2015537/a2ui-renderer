export interface TextProps {
  content: string
}

/** Static, non-interactive text for an `A2UIText` component. */
export function Text({ content }: TextProps) {
  return <p className="a2ui-text">{content}</p>
}
