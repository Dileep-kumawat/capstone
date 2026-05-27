import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { io } from 'socket.io-client'

export default function Terminal({ sandboxId, podReady }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  const initTerminal = useCallback(() => {
    if (!containerRef.current || termRef.current) return

    const term = new XTerm({
      theme: {
        background: '#070b14',
        foreground: '#e2e8f0',
        cursor: '#22d3ee',
        cursorAccent: '#070b14',
        selectionBackground: 'rgba(34,211,238,0.2)',
        black: '#1e2d45',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#334155',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c4b5fd',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.writeln('\x1b[36m╔══════════════════════════════════════╗\x1b[0m')
    term.writeln('\x1b[36m║   \x1b[1mSandbox Terminal\x1b[0m\x1b[36m                  ║\x1b[0m')
    term.writeln('\x1b[36m╚══════════════════════════════════════╝\x1b[0m')
    term.writeln('')
    term.writeln('\x1b[33mConnecting to sandbox...\x1b[0m')

    return term
  }, [])

  const connectSocket = useCallback((term) => {
    if (!sandboxId || !term) return

    const agentHost = `http://${sandboxId}.agent.localhost`

    try {
      const socket = io(agentHost, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      })

      socketRef.current = socket

      socket.on('connect', () => {
        setConnected(true)
        setError(null)
        term.writeln('\x1b[32m✓ Connected to sandbox shell\x1b[0m')
        term.writeln('')
      })

      socket.on('disconnect', () => {
        setConnected(false)
        term.writeln('\r\n\x1b[33m⚠ Disconnected. Reconnecting...\x1b[0m')
      })

      socket.on('connect_error', (err) => {
        setConnected(false)
        setError('Connection failed')
        term.writeln(`\r\n\x1b[31m✗ Connection error: ${err.message}\x1b[0m`)
      })

      socket.on('terminal-output', (data) => {
        term.write(data)
      })

      term.onData((data) => {
        socket.emit('terminal-input', data)
      })

    } catch (err) {
      setTimeout(() => {
        setError(err.message)
      }, 0)
    }
  }, [sandboxId])

  useEffect(() => {
    if (!podReady) return

    const term = initTerminal()
    if (term) connectSocket(term)

    return () => {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null }
      if (termRef.current) { termRef.current.dispose(); termRef.current = null }
    }
  }, [podReady, initTerminal, connectSocket])

  // Handle resize
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        try { fitAddonRef.current.fit() } catch {
          // Ignore resize errors if terminal is not fully initialized or visible
        }
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col h-full"
      style={{ background: '#070b14' }}>

      {/* Terminal toolbar */}
      <div className="flex items-center justify-between px-3 shrink-0"
        style={{ height: '32px', background: '#0d1424', borderBottom: '1px solid #1e2d45' }}>
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          <span className="text-xs font-medium" style={{ color: '#475569' }}>Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs" style={{ color: '#ef4444' }}>{error}</span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ background: connected ? '#10b981' : '#ef4444', boxShadow: `0 0 6px ${connected ? '#10b981' : '#ef4444'}` }} />
            <span className="text-xs" style={{ color: '#475569' }}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Body */}
      {!podReady ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#070b14] text-center p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-slate-300">
                Connecting Terminal Shell
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                Waiting for the development environment pod...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 overflow-hidden p-1" />
      )}
    </div>
  )
}
