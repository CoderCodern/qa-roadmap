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
          'overflow-x-auto rounded-xl bg-gray-900 text-sm leading-relaxed',
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
          'absolute right-3 top-3 rounded-lg p-1.5 transition-all',
          'text-gray-500 hover:bg-gray-700 hover:text-gray-200',
          copied ? 'opacity-100' : 'opacity-50 hover:opacity-100'
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
