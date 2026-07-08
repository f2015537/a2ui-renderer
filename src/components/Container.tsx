import type { ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
}

/** Generic layout wrapper for an `A2UIContainer` component's children. */
export function Container({ children }: ContainerProps) {
  return <div className="a2ui-container a2ui-enter">{children}</div>
}
