'use client'

import { ReactNode, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: ReactNode
  className?: string
  [key: string]: unknown
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4">
      <pre
        ref={preRef}
        className={cn(
          'overflow-x-auto rounded-xl bg-gray-950 text-sm leading-relaxed dark:bg-gray-900',
          className
        )}
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className={cn(
          'absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-all',
          'opacity-0 group-hover:opacity-100',
          'hover:bg-gray-800 hover:text-gray-200'
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
