'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { Play, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic import avoids SSR crash (CodeMirror uses browser APIs)
const CodeMirrorEditor = dynamic(
  async () => {
    const { default: CodeMirror } = await import('@uiw/react-codemirror')
    const { python } = await import('@codemirror/lang-python')

    function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
      return (
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[python()]}
          theme="dark"
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLineGutter: false }}
          style={{ fontSize: 13 }}
        />
      )
    }
    return Editor
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center bg-[#282c34] text-xs text-gray-500">
        Loading editor…
      </div>
    ),
  }
)

interface CodePlaygroundProps {
  code: string
}

type PyodideInterface = {
  runPython: (code: string) => unknown
}

declare global {
  interface Window {
    loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>
    _pyodideInstance?: PyodideInterface
    _pyodideLoading?: Promise<PyodideInterface>
  }
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'

async function getPyodide(): Promise<PyodideInterface> {
  if (window._pyodideInstance) return window._pyodideInstance
  if (window._pyodideLoading) return window._pyodideLoading

  if (!document.querySelector(`script[src="${PYODIDE_CDN}pyodide.js"]`)) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = `${PYODIDE_CDN}pyodide.js`
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load Pyodide script'))
      document.head.appendChild(s)
    })
  }

  window._pyodideLoading = window
    .loadPyodide({ indexURL: PYODIDE_CDN })
    .then((py) => {
      window._pyodideInstance = py
      return py
    })

  return window._pyodideLoading
}

export function CodePlayground({ code: initialCode }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode.trim())
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [pyodideLoading, setPyodideLoading] = useState(false)

  const run = useCallback(async () => {
    if (running) return
    setRunning(true)
    setOutput(null)
    setError(null)

    let py: PyodideInterface
    try {
      if (!window._pyodideInstance) setPyodideLoading(true)
      py = await getPyodide()
      setPyodideLoading(false)
    } catch {
      setError('Could not load Python runtime. Check your internet connection.')
      setRunning(false)
      setPyodideLoading(false)
      return
    }

    try {
      // Redirect stdout before running user code
      py.runPython(`
import sys, io
__buf = io.StringIO()
__old_stdout = sys.stdout
sys.stdout = __buf
`)
      py.runPython(code)
      const out = py.runPython(`
sys.stdout = __old_stdout
__buf.getvalue()
`)
      setOutput(String(out) || '(no output)')
    } catch (err) {
      try { py.runPython(`sys.stdout = __old_stdout`) } catch { /* ignore */ }
      setError(String(err))
    } finally {
      setRunning(false)
    }
  }, [code, running])

  const reset = useCallback(() => {
    setCode(initialCode.trim())
    setOutput(null)
    setError(null)
  }, [initialCode])

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-gray-700 bg-[#282c34]">
      {/* Editor */}
      <CodeMirrorEditor value={code} onChange={setCode} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-t border-gray-700 bg-gray-900/80 px-4 py-2">
        <button
          onClick={run}
          disabled={running}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            'bg-emerald-600 text-white hover:bg-emerald-500',
            running && 'cursor-wait opacity-60'
          )}
        >
          {running
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Play className="h-3.5 w-3.5" />
          }
          {pyodideLoading ? 'Loading Python…' : running ? 'Running…' : 'Run'}
        </button>

        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>

        {pyodideLoading && (
          <span className="text-xs text-yellow-400">
            First run downloads ~6 MB Python runtime…
          </span>
        )}

        <span className="ml-auto text-xs text-gray-600">Python 3.11 · Pyodide</span>
      </div>

      {/* Output panel */}
      {(output !== null || error) && (
        <div
          className={cn(
            'border-t px-4 py-3 font-mono text-xs',
            error
              ? 'border-red-900 bg-red-950/40 text-red-400'
              : 'border-gray-700 bg-black/60 text-green-400'
          )}
        >
          <div className="mb-1 text-xs font-semibold text-gray-500">
            {error ? '✗ Error' : '▸ Output'}
          </div>
          <pre className="whitespace-pre-wrap break-words">{error || output}</pre>
        </div>
      )}
    </div>
  )
}
