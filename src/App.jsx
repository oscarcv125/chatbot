import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_KEY = import.meta.env.VITE_GEMINI_KEY
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: next.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      })
      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sin respuesta.'
      setMessages([...next, { role: 'bot', text: reply }])
    } catch {
      setMessages([...next, { role: 'bot', text: 'Error de conexión.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="msg bot">Escribiendo...</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" disabled={loading}>Enviar</button>
      </form>
    </div>
  )
}
