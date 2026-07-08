import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
}

/** Bordered/elevated surface for an `A2UICard` component's children. */
export function Card({ children }: CardProps) {
  return <div className="a2ui-card">{children}</div>
}
