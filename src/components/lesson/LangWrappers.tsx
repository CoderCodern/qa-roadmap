import { ReactNode } from 'react'

export function En({ children }: { children: ReactNode }) {
  return <div className="lang-en">{children}</div>
}

export function Vi({ children }: { children: ReactNode }) {
  return <div className="lang-vi">{children}</div>
}
