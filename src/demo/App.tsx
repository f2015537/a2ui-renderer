import { useState } from 'react'
import type { FormEvent } from 'react'
import { A2UIRenderer } from '../renderer/A2UIRenderer'
import type { A2UIEvent, A2UIPayload } from '../types/a2ui'
import { getMockAgentResponse } from './mockAgent'
import './App.css'

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'agent'; payload: A2UIPayload }
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
        Try a message containing &quot;signup&quot; or &quot;book&quot;.
      </p>
      <div className="chat__thread">
        {messages.map((message) => {
          if (message.role === 'agent') {
            return (
              <div
                key={message.id}
                className="chat__message chat__message--agent"
              >
                <A2UIRenderer
                  payload={message.payload}
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
