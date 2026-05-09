import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Send, Bot, User, Zap } from 'lucide-react'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const WS_URL = BASE.replace(/^http/, 'ws') + '/chat/ws'

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m your AI Business Assistant. Ask me anything about your emails, invoices, or tasks.' }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [useWs, setUseWs] = useState(true)
  const wsRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }])
  }

  const appendToLast = (chunk) => {
    setMessages(prev => {
      const copy = [...prev]
      copy[copy.length - 1] = { ...copy[copy.length - 1], text: copy[copy.length - 1].text + chunk }
      return copy
    })
  }

  const sendViaWebSocket = (message) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      wsRef.current = new WebSocket(WS_URL)
    }

    const ws = wsRef.current

    const send = () => {
      addMessage('assistant', '')
      ws.send(JSON.stringify({ message }))
      setStreaming(true)

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.error) {
          appendToLast(`[Error: ${data.error}]`)
          setStreaming(false)
          return
        }
        if (data.done) {
          setStreaming(false)
          return
        }
        if (data.chunk) appendToLast(data.chunk)
      }

      ws.onerror = () => {
        appendToLast('[WebSocket error — falling back to REST]')
        setStreaming(false)
        setUseWs(false)
      }
    }

    if (ws.readyState === WebSocket.OPEN) send()
    else ws.onopen = send
  }

  const sendViaRest = async (message) => {
    addMessage('assistant', '')
    setStreaming(true)
    try {
      const res = await fetch(`${BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: {} }),
      })
      const data = await res.json()
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', text: data.response ?? '[No response]' }
        return copy
      })
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', text: '[Request failed]' }
        return copy
      })
    } finally { setStreaming(false) }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const msg = input.trim()
    if (!msg || streaming) return
    addMessage('user', msg)
    setInput('')
    if (useWs) sendViaWebSocket(msg)
    else sendViaRest(msg)
    inputRef.current?.focus()
  }

  const suggestions = [
    'Show me pending invoices',
    'List my high priority tasks',
    'How many unread emails do I have?',
    'Summarize today\'s tasks',
  ]

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="AI Chat" />
        <div className="page-content chat-page">
          <div className="chat-header">
            <div className="chat-mode-badge">
              <Zap size={13} />
              {useWs ? 'WebSocket Streaming' : 'REST Mode'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setUseWs(v => !v)}>
              Switch to {useWs ? 'REST' : 'WebSocket'}
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-wrap ${msg.role === 'user' ? 'chat-bubble-wrap--user' : ''}`}>
                <div className={`chat-avatar ${msg.role === 'user' ? 'chat-avatar--user' : 'chat-avatar--ai'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai'}`}>
                  {msg.text}
                  {i === messages.length - 1 && streaming && msg.role === 'assistant' && (
                    <span className="chat-cursor" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="chat-suggestions">
              {suggestions.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => { setInput(s); inputRef.current?.focus() }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="chat-input-bar">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              placeholder="Ask your AI assistant…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={streaming}
            />
            <button type="submit" className="chat-send-btn" disabled={!input.trim() || streaming} aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
