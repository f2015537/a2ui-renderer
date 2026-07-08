import { useState } from 'react'
import type { FormEvent } from 'react'
import { A2UIRenderer } from '../renderer/A2UIRenderer'
import { useStreamedPayload } from '../renderer/useStreamedPayload'
import type { A2UIEvent, A2UIPayload } from '../types/a2ui'
import { getMockAgentResponse } from './mockAgent'
import './App.css'

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'agent'; payload: A2UIPayload; streaming: boolean }
  | { id: string; role: 'system'; text: string }

let messageCounter = 0

function nextMessageId(): string {
  messageCounter += 1
  return `msg-${messageCounter}`
}

/** Renders the interaction a form/button fired as a plain-language system message. */
function describeEvent(event: A2UIEvent): string {
  if (event.type === 'form-submit') {
    const values = Object.entries(event.values)
      .map(([fieldId, value]) => `${fieldId}: "${value}"`)
      .join(', ')
    return `Sent "${event.action.name}" to the agent with ${values || 'no values'}.`
  }
  return `Sent "${event.action.name}" to the agent.`
}

interface AgentMessageProps {
  payload: A2UIPayload
  streaming: boolean
  onEvent: (event: A2UIEvent) => void
}

/**
 * Wraps a single agent payload in `useStreamedPayload`. This has to be its
 * own component (rather than calling the hook inline in a `.map`) so each
 * message gets one consistent hook call tied to its own mount, regardless
 * of how many other messages are in the thread.
 */
function AgentMessage({ payload, streaming, onEvent }: AgentMessageProps) {
  const streamedPayload = useStreamedPayload(payload, { enabled: streaming })
  return (
    <A2UIRenderer
      result={{ valid: true, payload: streamedPayload }}
      onEvent={onEvent}
    />
  )
}

/**
 * Minimal chat interface demonstrating `A2UIRenderer`: the user types a
 * message, a mock agent (`mockAgent.ts`) returns an `A2UIPayload` based on
 * keyword matching, and that payload renders live in the thread. Any
 * interaction with the rendered UI (a button click or form submit) is
 * reported back as a "system" message, simulating the round trip to a real
 * agent.
 */
export function DemoApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [streamingEnabled, setStreamingEnabled] = useState(false)

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
  }

  const handleSend = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    appendMessage({ id: nextMessageId(), role: 'user', text })
    setDraft('')
    appendMessage({
      id: nextMessageId(),
      role: 'agent',
      payload: getMockAgentResponse(text),
      streaming: streamingEnabled,
    })
  }

  const handleAgentEvent = (event: A2UIEvent) => {
    appendMessage({
      id: nextMessageId(),
      role: 'system',
      text: describeEvent(event),
    })
  }

  return (
    <div className="chat">
      <h1>a2ui-renderer demo</h1>
      <p className="chat__hint">
        Try a message containing &quot;signup&quot;, &quot;book&quot;, or
        &quot;preferences&quot;.
      </p>
      <label className="chat__streaming-toggle">
        <input
          type="checkbox"
          checked={streamingEnabled}
          onChange={(event) => setStreamingEnabled(event.target.checked)}
        />
        Simulate streaming
      </label>
      <div className="chat__thread">
        {messages.map((message) => {
          if (message.role === 'agent') {
            return (
              <div
                key={message.id}
                className="chat__message chat__message--agent"
              >
                <AgentMessage
                  payload={message.payload}
                  streaming={message.streaming}
                  onEvent={handleAgentEvent}
                />
              </div>
            )
          }
          return (
            <div
              key={message.id}
              className={`chat__message chat__message--${message.role}`}
            >
              {message.text}
            </div>
          )
        })}
      </div>
      <form className="chat__composer" onSubmit={handleSend}>
        <input
          className="chat__input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
        />
        <button type="submit" className="chat__send">
          Send
        </button>
      </form>
    </div>
  )
}

export default DemoApp
