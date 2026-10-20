
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AIChat.css'
import { API_BASE_URL } from '../config'

function AIChat() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! 👋 Welcome to FoodConnect AI. Ask me about food donations, NGO requests, pickup, or completion.'
    }
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage(event) {
    event.preventDefault()

    const question = input.trim()

    if (!question || loading) return

    setMessages(previous => [
      ...previous,
      { sender: 'user', text: question }
    ])

    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: question })
      })

      if (!response.ok) {
        throw new Error('The assistant could not respond. Please try again.')
      }

      const data = await response.json()

      setMessages(previous => [
        ...previous,
        {
          sender: 'ai',
          text: data.reply || 'Sorry, I could not generate a response.'
        }
      ])
    } catch (err) {
      setError(
        'Could not connect to the assistant. Please check that your backend is running on port 8080.'
      )
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'How can I donate food?',
    'How can an NGO request food?',
    'How do I mark food as picked up?',
    'How do I complete a donation?'
  ]

  function askSuggestion(question) {
    setInput(question)
  }

  return (
    <div className="ai-chat-page">
      <header className="ai-chat-header">
        <Link to="/" className="ai-chat-logo">
          🍃 FoodConnect <span>AI</span>
        </Link>

        <Link to="/ngo/dashboard" className="ai-back-link">
          Back to Dashboard
        </Link>
      </header>

      <main className="ai-chat-container">
        <div className="ai-chat-intro">
          <div className="ai-big-icon">🤖</div>
          <h1>FoodConnect AI Assistant</h1>
          <p>
            Your friendly assistant for food donations and helping communities.
          </p>
        </div>

        <section className="ai-chat-box">
          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`ai-message-row ${message.sender}`}
                key={index}
              >
                <div className="ai-message-avatar">
                  {message.sender === 'ai' ? '🤖' : '👤'}
                </div>

                <div className="ai-message-bubble">
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-typing">FoodConnect AI is thinking...</div>
            )}
          </div>

          {error && (
            <p className="ai-chat-error" role="alert">
              {error}
            </p>
          )}

          <form className="ai-chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="Ask me anything about FoodConnect..."
              aria-label="Your message"
              disabled={loading}
            />

            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Sending...' : 'Send ➤'}
            </button>
          </form>

          <div className="ai-suggestions">
            <p>Try asking:</p>

            {suggestions.map(question => (
              <button
                type="button"
                key={question}
                onClick={() => askSuggestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AIChat