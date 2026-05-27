import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { apiFetch } from '../utils/api'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{
            background: '#22d3ee',
            animation: 'typing-dot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`
          }} />
      ))}
    </div>
  )
}

function ActivityLog({ lines }) {
  if (!lines.length) return null
  return (
    <div className="mt-2 rounded overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2d45' }}>
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-2 px-2 py-1"
          style={{ borderBottom: i < lines.length - 1 ? '1px solid rgba(30,45,69,0.5)' : 'none' }}>
          <span className="shrink-0 mt-0.5" style={{ color: line.type === 'success' ? '#10b981' : line.type === 'updating' ? '#f59e0b' : '#475569', lineHeight: 0 }}>
            {line.type === 'reading' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            )}
            {line.type === 'updating' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            )}
            {line.type === 'success' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            {line.type === 'info' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </span>
          <span className="text-xs font-mono break-all" style={{ color: '#64748b' }}>{line.text}</span>
        </div>
      ))}
    </div>
  )
}

const markdownComponents = {
  p: ({ children }) => <p style={{ margin: '0 0 0.5em 0', lineHeight: '1.65' }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: '#94a3b8' }}>{children}</em>,
  h1: ({ children }) => <h1 style={{ color: '#e2e8f0', fontSize: '1.1em', fontWeight: 700, margin: '0.75em 0 0.4em' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ color: '#e2e8f0', fontSize: '1em', fontWeight: 700, margin: '0.65em 0 0.35em' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ color: '#cbd5e1', fontSize: '0.95em', fontWeight: 600, margin: '0.5em 0 0.3em' }}>{children}</h3>,
  ul: ({ children }) => <ul style={{ margin: '0.4em 0', paddingLeft: '1.4em', listStyleType: 'disc' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0.4em 0', paddingLeft: '1.4em' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '0.2em 0', color: '#cbd5e1' }}>{children}</li>,
  code: ({ inline, children }) =>
    inline
      ? <code style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', padding: '0.1em 0.35em', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace' }}>{children}</code>
      : <code>{children}</code>,
  pre: ({ children }) => (
    <pre style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #1e2d45', borderRadius: '8px', padding: '0.75em 1em', overflowX: 'auto', margin: '0.5em 0', fontSize: '0.82em', fontFamily: 'monospace', color: '#94a3b8' }}>
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: '3px solid rgba(34,211,238,0.4)', paddingLeft: '0.75em', margin: '0.5em 0', color: '#64748b', fontStyle: 'italic' }}>
      {children}
    </blockquote>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #1e2d45', margin: '0.75em 0' }} />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'underline', textDecorationColor: 'rgba(34,211,238,0.4)' }}>{children}</a>,
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg shrink-0 mr-2 flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.1))', border: '1px solid rgba(34,211,238,0.3)', marginTop: '2px' }}>
          ✦
        </div>
      )}
      <div className="max-w-[85%]">
        <div className="px-3 py-2 rounded-xl text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(8,145,178,0.08))',
            border: '1px solid rgba(34,211,238,0.25)',
            color: '#e2e8f0',
            borderBottomRightRadius: '4px',
            whiteSpace: 'pre-wrap'
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid #1e2d45',
            color: '#cbd5e1',
            borderBottomLeftRadius: '4px'
          }}>
          {isUser
            ? msg.content
            : <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
          }
        </div>
        {msg.activity && msg.activity.length > 0 && (
          <ActivityLog lines={msg.activity} />
        )}
        <div className="text-xs mt-1 px-1" style={{ color: '#334155' }}>
          {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function parseActivityLine(line) {
  if (!line.trim()) return null
  if (line.startsWith('Reading files')) return { type: 'reading', text: line }
  if (line.startsWith('Updating files')) return { type: 'updating', text: line }
  if (line.toLowerCase().includes('success')) return { type: 'success', text: line }
  return { type: 'info', text: line }
}

export default function AiChat({ sandboxId, onFilesChanged, podReady }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can modify your sandbox project. Describe what you want to build or change, and I\'ll update the code for you.',
      activity: [],
      time: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming || !sandboxId) return

    setInput('')
    setStreaming(true)

    const userMsg = { role: 'user', content: text, activity: [], time: Date.now() }
    setMessages(prev => [...prev, userMsg])

    // Add placeholder AI message
    const aiMsgId = Date.now() + 1
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', activity: [], time: Date.now(), pending: true }])

    let aiContent = ''
    let activityLines = []

    try {
      // Use fetch with SSE manually
      const response = await apiFetch('/api/ai/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text, projectId: sandboxId })
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const updateMsg = () => {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: aiContent || '…', activity: [...activityLines], pending: !aiContent }
            : m
        ))
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.trim()) continue

          if (line.startsWith('act:')) {
            const actText = line.substring(4)
            const parsed = parseActivityLine(actText)
            if (parsed) {
              activityLines = [...activityLines, parsed]
            }
          } else if (line.startsWith('msg:')) {
            const msgLine = line.substring(4)
            aiContent = aiContent ? `${aiContent}\n${msgLine}` : msgLine
          } else {
            // Fallback for unexpected or legacy formats
            const parsed = parseActivityLine(line)
            if (parsed) {
              if (parsed.type !== 'info') {
                activityLines = [...activityLines, parsed]
              } else {
                aiContent = aiContent ? `${aiContent}\n${line}` : line
              }
            }
          }
          updateMsg()
        }
      }

      // If no textual content came through, construct a summary
      if (!aiContent) {
        const updates = activityLines.filter(l => l.type === 'success')
        aiContent = updates.length
          ? 'Done! Files have been updated successfully.'
          : 'Changes applied to your project.'
      }

      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: aiContent, activity: activityLines, pending: false }
          : m
      ))

      // Trigger file explorer refresh
      onFilesChanged?.()
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: `Error: ${err.message}`, activity: activityLines, pending: false }
          : m
      ))
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, sandboxId, onFilesChanged])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full"
      style={{ background: '#0d1424', borderLeft: '1px solid #1e2d45' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid #1e2d45' }}>
        <div className="w-6 h-6 rounded flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.1))', border: '1px solid rgba(34,211,238,0.3)' }}>
          ✦
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>AI Assistant</h2>
          <p className="text-xs" style={{ color: '#475569' }}>Powered by MistralAi</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full"
            style={{
              background: podReady ? '#10b981' : '#f59e0b',
              boxShadow: `0 0 6px ${podReady ? '#10b981' : '#f59e0b'}`,
              animation: podReady ? 'none' : 'pulse 1.5s infinite'
            }} />
          <span className="text-xs" style={{ color: podReady ? '#475569' : '#f59e0b' }}>
            {podReady ? 'Active' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        {!podReady && (
          <div className="rounded-lg p-3 text-xs leading-relaxed flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <span className="shrink-0 animate-spin mt-0.5">⚙️</span>
            <div>
              <p className="font-semibold">Development Pod Initializing</p>
              <p className="text-slate-400 mt-0.5">The AI assistant is waiting for the sandbox container to boot before accepting code modification requests.</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i}>
            {msg.pending && !msg.content ? (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg shrink-0 mr-2 flex items-center justify-center text-sm"
                  style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.1))', border: '1px solid rgba(34,211,238,0.3)', marginTop: '2px' }}>
                  ✦
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2d45' }}>
                  <TypingIndicator />
                  {msg.activity && msg.activity.length > 0 && <ActivityLog lines={msg.activity} />}
                </div>
              </div>
            ) : (
              <Message msg={msg} />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-2"
        style={{ borderTop: '1px solid #1e2d45' }}>
        <div className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: '#070b14',
            border: '1px solid #1e2d45',
            transition: 'border-color 0.2s'
          }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = '#1e2d45'}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!podReady ? 'Waiting for pod to start...' : sandboxId ? 'Describe what you want to build…' : 'Create a sandbox first…'}
            disabled={!sandboxId || !podReady || streaming}
            rows={1}
            className="flex-1 resize-none text-sm outline-none bg-transparent"
            style={{
              color: '#e2e8f0',
              caretColor: '#22d3ee',
              maxHeight: '120px',
              lineHeight: '1.5',
              fontFamily: 'inherit'
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !sandboxId || !podReady || streaming}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              background: input.trim() && sandboxId && podReady && !streaming
                ? 'linear-gradient(135deg, #22d3ee, #0891b2)'
                : 'rgba(255,255,255,0.06)',
              color: input.trim() && sandboxId && podReady && !streaming ? '#070b14' : '#334155',
              boxShadow: input.trim() && sandboxId && podReady && !streaming ? '0 0 15px rgba(34,211,238,0.3)' : 'none'
            }}>
            {streaming ? (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent"
                style={{ borderColor: '#22d3ee', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: '#334155' }}>
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}
