import { ExternalLink } from 'lucide-react'

interface Resource {
  title: string
  url: string
  description?: string
}

interface ResourceListProps {
  resources: Resource[]
}

export function ResourceList({ resources }: ResourceListProps) {
  return (
    <ul className="my-6 space-y-3">
      {resources.map((r) => (
        <li key={r.url} className="flex items-start gap-3">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          <div>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              {r.title}
            </a>
            {r.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
