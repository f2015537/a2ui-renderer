import type { ReactNode } from 'react'
import type { A2UICardStyle } from '../types/a2ui'

export interface CardProps {
  children: ReactNode
  /** Visual weight of the surface. Defaults to 'elevated'. */
  style?: A2UICardStyle
}

/** Bordered/elevated surface for an `A2UICard` component's children. */
export function Card({ children, style = 'elevated' }: CardProps) {
  return (
    <div className={`a2ui-card a2ui-card--${style} a2ui-enter`}>{children}</div>
  )
}
