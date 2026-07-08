import { useEffect, useMemo, useState } from 'react'
import type { A2UIComponent, A2UIPayload } from '../types/a2ui'

export interface UseStreamedPayloadOptions {
  /** Milliseconds between each newly-revealed node. Defaults to 300. */
  intervalMs?: number
  /** When false, the full payload is returned immediately (no streaming). */
  enabled?: boolean
}

/** Number of descendant nodes under `component`, i.e. everything but itself. */
function countDescendants(component: A2UIComponent): number {
  if (component.type !== 'container' && component.type !== 'card') {
    return 0
  }
  let count = 0
  for (const child of component.children) {
    count += 1 + countDescendants(child)
  }
  return count
}

/**
 * Rebuilds `component` keeping only the first `budget.remaining` descendant
 * nodes, in pre-order (a revealed container's own children start arriving
 * before its next sibling does). `budget` is shared and mutated across the
 * whole recursive walk so it acts as a single spending limit for the tree.
 */
function buildPartial(
  component: A2UIComponent,
  budget: { remaining: number },
): A2UIComponent {
  if (component.type !== 'container' && component.type !== 'card') {
    return component
  }
  const children: A2UIComponent[] = []
  for (const child of component.children) {
    if (budget.remaining <= 0) break
    budget.remaining -= 1
    children.push(buildPartial(child, budget))
  }
  return { ...component, children }
}

/**
 * Simulates a streaming agent response: starting from just the root node,
 * one additional descendant node is revealed every `intervalMs` until the
 * full `payload` tree is showing. The returned value is an ordinary
 * `A2UIPayload` at every step, so `A2UIRenderer` (or anything else that
 * consumes a payload) needs no special handling for the partial case.
 */
export function useStreamedPayload(
  payload: A2UIPayload,
  { intervalMs = 300, enabled = true }: UseStreamedPayloadOptions = {},
): A2UIPayload {
  // Reset the reveal count when a new payload comes in. This runs during
  // render (React's documented pattern for state that depends on a changed
  // prop) rather than in the effect below, so the effect only ever calls
  // setState from its timer callback, not from the effect body itself.
  const [trackedPayload, setTrackedPayload] = useState(payload)
  const [revealedCount, setRevealedCount] = useState(0)
  if (payload !== trackedPayload) {
    setTrackedPayload(payload)
    setRevealedCount(0)
  }

  const totalNodes = useMemo(
    () => countDescendants(payload.root),
    [payload.root],
  )

  useEffect(() => {
    if (!enabled || totalNodes === 0) {
      return undefined
    }

    let revealed = 0
    const timer = setInterval(() => {
      revealed += 1
      setRevealedCount(revealed)
      if (revealed >= totalNodes) {
        clearInterval(timer)
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [payload, enabled, intervalMs, totalNodes])

  return useMemo(() => {
    if (!enabled) {
      return payload
    }
    return {
      ...payload,
      root: buildPartial(payload.root, { remaining: revealedCount }),
    }
  }, [payload, enabled, revealedCount])
}
