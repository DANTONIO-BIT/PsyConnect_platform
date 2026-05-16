"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Estoy aquí para ayudarte con cualquier pregunta sobre nuestros servicios de psicología. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Disculpa, estoy teniendo problemas de conexión. Inténtalo de nuevo en un momento o reserva una sesión directamente.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    setIsLoading(true)
    setMessages((prev) => [...prev, { role: "user", content: action }])

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: action,
        history: messages.slice(-10),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.response) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
        }
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Disculpa, estoy teniendo problemas de conexión.",
          },
        ])
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] h-[500px] bg-card rounded-3xl shadow-xl flex flex-col overflow-hidden border border-border">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <h3 className="text-primary-foreground font-semibold text-lg">Asistente PsyConnect</h3>
            <p className="text-primary-foreground/70 text-sm">¿En qué puedo ayudarte?</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary px-4 py-2 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction("¿Qué servicios ofrecen?")}
                className="text-xs bg-secondary px-3 py-1 rounded-full text-foreground hover:bg-primary/10 transition-colors"
              >
                Servicios
              </button>
              <button
                onClick={() => handleQuickAction("¿Cómo reservo una cita?")}
                className="text-xs bg-secondary px-3 py-1 rounded-full text-foreground hover:bg-primary/10 transition-colors"
              >
                Reservar cita
              </button>
              <button
                onClick={() => handleQuickAction("¿Cómo es una sesión de terapia?")}
                className="text-xs bg-secondary px-3 py-1 rounded-full text-foreground hover:bg-primary/10 transition-colors"
              >
                ¿Cómo es la terapia?
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
