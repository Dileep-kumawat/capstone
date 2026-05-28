import { useState } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '../utils/api'

export default function TopBar({ sandboxId, agentBase, activeTab, onTabChange, status }) {
  const { user, logout } = useAuth()
  const shortId = sandboxId ? sandboxId.slice(0, 8) + '…' : ''
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (downloading || !agentBase) return
    setDownloading(true)
    try {
      const res = await apiFetch(`${agentBase}/download?name=codespace-${sandboxId.slice(0, 8)}`)
      if (!res.ok) throw new Error('Download failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `codespace-${sandboxId.slice(0, 8)}.zip`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading project:', err)
      alert('Failed to bundle project code. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const statusConfig = {
    ready: { color: '#10b981', label: 'Ready', dot: true },
    loading: { color: '#f59e0b', label: 'Working…', dot: false },
    error: { color: '#ef4444', label: 'Error', dot: true },
  }
  const s = statusConfig[status] || statusConfig.ready

  return (
    <header className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: '48px',
        background: 'rgba(13,20,36,0.95)',
        borderBottom: '1px solid #1e2d45',
        backdropFilter: 'blur(12px)'
      }}>

      {/* Left — Logo + sandbox ID */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.1))', border: '1px solid rgba(34,211,238,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="#22d3ee">
              <rect x="1" y="1" width="6" height="6" rx="1"/>
              <rect x="9" y="1" width="6" height="6" rx="1" opacity="0.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" opacity="0.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Sandbox IDE</span>
        </div>

        {sandboxId && (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            <span className="text-xs font-mono" style={{ color: '#64748b' }}>
              {shortId}
            </span>
          </div>
        )}
      </div>

      {/* Center — Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg"
        style={{ background: '#0a0f1e', border: '1px solid #1e2d45' }}>
        {[
          { id: 'preview', icon: '⬛', label: 'Preview' },
          { id: 'files', icon: '📄', label: 'Files' }
        ].map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className="px-4 py-1 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer"
            style={activeTab === tab.id ? {
              background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(8,145,178,0.08))',
              color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.3)'
            } : {
              color: '#475569',
              border: '1px solid transparent'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right — status & profile */}
      <div className="flex items-center gap-4">
        {/* Home / Refresh button */}
        <button
          onClick={() => window.location.href = '/'}
          title="Go to Home"
          className="flex items-center justify-center w-7 h-7 rounded transition-all duration-200 cursor-pointer"
          style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', color: '#64748b' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(34,211,238,0.12)';
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)';
            e.currentTarget.style.color = '#22d3ee';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(34,211,238,0.06)';
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.15)';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
        {/* Download Code button */}
        {sandboxId && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download Project (ZIP)"
            className="flex items-center justify-center gap-1.5 px-3 h-7 rounded text-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(8,145,178,0.05))',
              border: '1px solid rgba(34,211,238,0.2)',
              color: '#22d3ee',
              fontWeight: 500
            }}
            onMouseEnter={e => {
              if (!downloading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.1))';
                e.currentTarget.style.borderColor = 'rgba(34,211,238,0.45)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(34,211,238,0.25)';
              }
            }}
            onMouseLeave={e => {
              if (!downloading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(8,145,178,0.05))';
                e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {downloading ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
                <span style={{ color: '#22d3ee' }}>Zipping…</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download Code</span>
              </>
            )}
          </button>
        )}
        {/* Status */}
        <div className="flex items-center gap-1.5">
          {s.dot ? (
            <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent"
              style={{ borderColor: s.color, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          )}
          <span className="text-xs" style={{ color: s.color }}>{s.label}</span>
        </div>

        {/* Vertical divider */}
        {user && <div className="w-px h-4 bg-[#1e2d45]" />}

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 animate-fadeIn">
            {/* User Profile Info */}
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-cyan-400/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-cyan-400/30"
                     style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold" style={{ color: '#cbd5e1', lineHeight: '1.2' }}>{user.name}</span>
                <span className="text-[10px]" style={{ color: '#475569', lineHeight: '1.2' }}>{user.email}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-2.5 py-1 text-xs rounded border transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(239,68,68,0.06)',
                borderColor: 'rgba(239,68,68,0.2)',
                color: '#fca5a5'
              }}
              onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
              }}
              onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
