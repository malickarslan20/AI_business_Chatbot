import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Send, Bot, User, Zap, Sparkles, Command } from 'lucide-react'

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
    <div className="flex h-screen bg-darkBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar title="AI Assistant" />
        
        {/* Chat Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-[0.03] pointer-events-none">
          <Bot size={400} className="w-full" />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-8">
            {/* Mode Switcher */}
            <div className="flex items-center justify-center">
              <div className="glass p-1 rounded-full flex items-center gap-1">
                <button 
                  onClick={() => setUseWs(true)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${useWs ? 'bg-brandPurple text-white shadow-lg shadow-brandPurple/20' : 'text-textMuted hover:text-textSecondary'}`}
                >
                  WebSocket
                </button>
                <button 
                  onClick={() => setUseWs(false)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!useWs ? 'bg-brandPurple text-white shadow-lg shadow-brandPurple/20' : 'text-textMuted hover:text-textSecondary'}`}
                >
                  REST
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg
                      ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-gradient-brand text-white'}
                    `}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`
                      p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-sm leading-relaxed
                      ${msg.role === 'user' 
                        ? 'bg-brandPurple text-white rounded-tr-none shadow-xl shadow-brandPurple/10' 
                        : 'glass text-textMain rounded-tl-none border-white/5'}
                    `}>
                      {msg.text}
                      {i === messages.length - 1 && streaming && msg.role === 'assistant' && (
                        <span className="inline-block w-1.5 h-4 bg-brandPurple-light ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </main>

        {/* Input Area */}
        <div className="px-4 pb-6 sm:px-10 sm:pb-10 pt-4 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            {messages.length === 1 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {suggestions.map((s) => (
                  <button 
                    key={s} 
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-textSecondary hover:text-brandPurple-light hover:bg-brandPurple/10 hover:border-brandPurple/20 transition-all active:scale-95"
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form 
              onSubmit={handleSubmit} 
              className="relative group glass p-2 rounded-[24px] sm:rounded-[32px] border-white/10 focus-within:border-brandPurple/30 transition-all shadow-2xl"
            >
              <div className="flex items-center">
                <div className="hidden sm:flex w-12 h-12 items-center justify-center text-textMuted group-focus-within:text-brandPurple transition-colors">
                  <Command size={20} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Describe what you need..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base py-3 px-2 sm:px-0 text-textMain placeholder:text-textMuted outline-none"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={streaming}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || streaming}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all active:scale-90
                    ${input.trim() && !streaming ? 'bg-gradient-brand text-white shadow-lg shadow-brandPurple/30' : 'bg-white/5 text-textMuted cursor-not-allowed'}
                  `}
                >
                  {streaming ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-textMuted mt-4 uppercase tracking-[0.2em] font-black opacity-50">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
