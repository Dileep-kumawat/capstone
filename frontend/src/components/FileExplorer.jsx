import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../utils/api'

const FILE_ICONS = {
  jsx: '⚛', tsx: '⚛', js: '🟡', ts: '🔷',
  css: '🎨', html: '🌐', json: '{}', md: '📝',
  png: '🖼', svg: '🔶', jpg: '🖼', jpeg: '🖼',
  env: '🔒', gitignore: '🙈', dockerfile: '🐳',
  default: '📄'
}

function getIcon(filename) {
  const parts = filename.split('.')
  if (parts.length === 1) return FILE_ICONS.default
  const ext = parts[parts.length - 1].toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}

function buildTree(files) {
  const root = {}
  files.forEach(path => {
    const parts = path.split('/')
    let node = root
    parts.forEach((part, i) => {
      if (!node[part]) node[part] = i === parts.length - 1 ? null : {}
      if (i < parts.length - 1) node = node[part]
    })
  })
  return root
}

function TreeNode({ name, node, depth, agentBase, activeFile, onFileSelect, path }) {
  const [open, setOpen] = useState(depth < 2)
  const isDir = node !== null && typeof node === 'object'
  const fullPath = path ? `${path}/${name}` : name
  const isActive = activeFile === fullPath

  if (isDir) {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-0.5 rounded transition-colors duration-100 cursor-pointer"
          style={{
            paddingLeft: `${8 + depth * 14}px`,
            color: '#94a3b8',
            fontSize: '13px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span className="text-xs transition-transform duration-150" style={{ transform: open ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
          <span className="mr-1">{open ? '📂' : '📁'}</span>
          <span className="truncate">{name}</span>
        </button>
        {open && (
          <div>
            {Object.entries(node).sort(([, a], [, b]) => {
              const aDir = a !== null && typeof a === 'object'
              const bDir = b !== null && typeof b === 'object'
              return bDir - aDir
            }).map(([childName, childNode]) => (
              <TreeNode key={childName} name={childName} node={childNode}
                depth={depth + 1} agentBase={agentBase} activeFile={activeFile}
                onFileSelect={onFileSelect} path={fullPath} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button onClick={() => onFileSelect(fullPath)}
      className="flex items-center gap-1.5 w-full text-left px-2 py-0.5 rounded transition-all duration-100 cursor-pointer"
      style={{
        paddingLeft: `${8 + depth * 14}px`,
        fontSize: '13px',
        color: isActive ? '#22d3ee' : '#94a3b8',
        background: isActive ? 'rgba(34,211,238,0.08)' : 'transparent',
        borderLeft: isActive ? '2px solid #22d3ee' : '2px solid transparent'
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0' } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}>
      <span>{getIcon(name)}</span>
      <span className="truncate">{name}</span>
    </button>
  )
}

export default function FileExplorer({ agentBase, activeFile, onFileSelect, refreshKey, podReady, setPodReady }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tree, setTree] = useState({})

  const fetchFiles = useCallback(async (isSilent = false) => {
    const silent = isSilent === true
    if (!agentBase) return false
    if (!silent) {
      setLoading(true)
    }
    setError(null)
    try {
      const res = await apiFetch(`${agentBase}/list-files`)
      if (!res.ok) {
        throw new Error('Failed to fetch')
      }
      const data = await res.json()
      const fileList = data.files || []
      setFiles(fileList)
      setTree(buildTree(fileList))
      setPodReady(true)
      return true
    } catch {
      setError('Failed to load files')
      return false
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [agentBase])

  useEffect(() => {
    setPodReady(false)
  }, [agentBase, refreshKey])

  useEffect(() => {
    if (!agentBase || podReady) return

    // Perform the initial non-silent load
    fetchFiles(false)

    // Poll every 3 seconds silently until the pod is ready and files are loaded
    const interval = setInterval(() => {
      fetchFiles(true)
    }, 3000)

    return () => clearInterval(interval)
  }, [agentBase, podReady, fetchFiles])

  return (
    <aside className="flex flex-col h-full"
      style={{ width: '220px', minWidth: '220px', background: '#0d1424', borderRight: '1px solid #1e2d45' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid #1e2d45' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
          Explorer
        </span>
        <button onClick={fetchFiles} className="p-1 rounded transition-colors cursor-pointer"
          style={{ color: '#475569' }}
          onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          title="Refresh">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
          </div>
        ) : error ? (
          <div className="px-3 py-4 text-xs" style={{ color: '#ef4444' }}>{error}</div>
        ) : (
          Object.entries(tree).sort(([, a], [, b]) => {
            const aDir = a !== null && typeof a === 'object'
            const bDir = b !== null && typeof b === 'object'
            return bDir - aDir
          }).map(([name, node]) => (
            <TreeNode key={name} name={name} node={node}
              depth={0} agentBase={agentBase} activeFile={activeFile}
              onFileSelect={onFileSelect} path="" />
          ))
        )}
      </div>

      {/* Footer — file count */}
      {!loading && files.length > 0 && (
        <div className="px-3 py-1.5 shrink-0" style={{ borderTop: '1px solid #1e2d45' }}>
          <span className="text-xs" style={{ color: '#334155' }}>{files.length} files</span>
        </div>
      )}
    </aside>
  )
}
