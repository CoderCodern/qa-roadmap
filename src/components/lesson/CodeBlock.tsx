'use client'

import { ReactNode, useRef, useState } from 'react'
import { Copy, Check, Code2, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: ReactNode
  className?: string
  [key: string]: unknown
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState(false)

  const isMarkdown = props['data-language'] === 'markdown'

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rawText = preRef.current?.textContent ?? ''

  return (
    <div className="group relative my-4">
      {isMarkdown && (
        <div className="flex items-center gap-1 rounded-t-xl border border-b-0 border-gray-700 bg-gray-800 px-3 py-1.5">
          <button
            onClick={() => setPreview(false)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
              !preview
                ? 'bg-gray-700 text-gray-100'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Code2 className="h-3 w-3" />
            Code
          </button>
          <button
            onClick={() => setPreview(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
              preview
                ? 'bg-gray-700 text-gray-100'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>

          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-md p-1.5 text-xs transition-all',
              'text-gray-400 hover:bg-gray-700 hover:text-gray-200',
              copied ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}

      {/* Always render pre so ref is populated; hide when in preview mode */}
      <pre
        ref={preRef}
        className={cn(
          'overflow-x-auto text-sm leading-relaxed',
          isMarkdown ? 'rounded-b-xl' : 'rounded-xl',
          'bg-gray-900',
          className,
          isMarkdown && preview && 'hidden'
        )}
        {...props}
      >
        {children}
      </pre>

      {isMarkdown && preview && (
        <div
          className={cn(
            'overflow-x-auto rounded-b-xl border border-gray-700 bg-white px-6 py-5',
            'prose prose-sm max-w-none',
            'dark:prose-invert dark:bg-gray-950'
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {rawText || (preRef.current?.textContent ?? '')}
          </ReactMarkdown>
        </div>
      )}

      {!isMarkdown && (
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className={cn(
            'absolute right-3 top-3 rounded-lg p-1.5 transition-all',
            'text-gray-500 hover:bg-gray-700 hover:text-gray-200',
            copied ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  )
}
