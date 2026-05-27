import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../utils/api'
import Editor from '@monaco-editor/react'

const LANGUAGE_MAP = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  css: 'css', html: 'html', json: 'json', md: 'markdown',
  py: 'python', sh: 'bash', yml: 'yaml', yaml: 'yaml',
}

function getLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return LANGUAGE_MAP[ext] || 'plaintext'
}

export default function FileViewer({ agentBase, filePath, onFileSaved }) {
  const [content, setContent] = useState(null)
  const [editorContent, setEditorContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'

  const saveRef = useRef()

  useEffect(() => {
    if (!agentBase || !filePath) return
    const fetchFile = async () => {
      setLoading(true)
      setError(null)
      setContent(null)
      setEditorContent(null)
      setSaveStatus('idle')
      try {
        const res = await apiFetch(`${agentBase}/read-files?files=${encodeURIComponent(filePath)}`)
        const data = await res.json()
        const fileData = data.files?.[0]
        if (fileData) {
          const fileContent = Object.values(fileData)[0]
          setContent(fileContent)
          setEditorContent(fileContent)
        } else {
          setError('File not found or empty')
        }
      } catch {
        setError('Failed to load file')
      } finally {
        setLoading(false)
      }
    }
    fetchFile()
  }, [agentBase, filePath])

  const isDirty = content !== null && editorContent !== null && content !== editorContent

  const handleSave = async () => {
    if (!agentBase || !filePath || isSaving || !isDirty) return
    setIsSaving(true)
    setSaveStatus('saving')
    try {
      const res = await apiFetch(`${agentBase}/update-files`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: [
            {
              file: filePath,
              content: editorContent,
            }
          ]
        })
      })
      if (!res.ok) throw new Error('Save failed')
      setContent(editorContent)
      setSaveStatus('saved')
      if (onFileSaved) {
        onFileSaved()
      }
    } catch (err) {
      setSaveStatus('error')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Update the save ref whenever handleSave or dependencies change
  useEffect(() => {
    saveRef.current = handleSave
  }, [handleSave])

  // Clear "Saved" status after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  const handleEditorMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveRef.current?.()
    })
  }

  if (!filePath) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3"
        style={{ color: '#334155' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p className="text-sm">Select a file from the explorer</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* File tab bar */}
      <div className="flex items-center justify-between px-3 shrink-0"
        style={{ height: '36px', background: '#070b14', borderBottom: '1px solid #1e2d45' }}>
        
        {/* Left side: tab name & dirty indicator */}
        <div className="flex items-center gap-2 h-full">
          <div className="flex items-center gap-2 px-3 py-1 rounded-t h-full mt-2"
            style={{ background: '#0d1424', border: '1px solid #1e2d45', borderBottom: 'none' }}>
            <span className="text-xs" style={{ color: '#e2e8f0' }}>
              {filePath.split('/').pop()}
            </span>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22d3ee' }} title="Unsaved changes" />
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
              style={{ background: 'rgba(34,211,238,0.06)', color: '#0ea5e9' }}>
              {getLanguage(filePath)}
            </span>
          </div>
        </div>

        {/* Right side: Save button & status */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-xs flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
              <div className="w-3 h-3 rounded-full border border-t-transparent"
                style={{ borderColor: '#22d3ee', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs" style={{ color: '#10b981' }}>✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs" style={{ color: '#ef4444' }}>⚠ Save failed</span>
          )}
          
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            style={{
              background: isDirty && !isSaving ? '#22d3ee' : '#1e293b',
              color: isDirty && !isSaving ? '#0f172a' : '#64748b',
              border: 'none',
            }}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-all duration-200 cursor-pointer ${
              isDirty && !isSaving
                ? 'hover:bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative" style={{ background: '#070b14' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent"
              style={{ borderColor: '#22d3ee', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        {error && (
          <div className="p-6 text-sm" style={{ color: '#ef4444' }}>{error}</div>
        )}
        {content !== null && !loading && (
          <Editor
            height="100%"
            language={getLanguage(filePath)}
            theme="vs-dark"
            value={editorContent}
            onChange={(val) => setEditorContent(val || '')}
            onMount={handleEditorMount}
            loading={
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#070b14' }}>
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: '#22d3ee', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
              lineNumbers: 'on',
              automaticLayout: true,
              tabSize: 2,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              fontLigatures: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
