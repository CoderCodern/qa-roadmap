export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-6 h-3.5 w-28 rounded-full bg-gray-200 dark:bg-gray-800" />

      {/* Title */}
      <div className="mb-2 h-8 w-2/3 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="mb-8 h-5 w-2/5 rounded-lg bg-gray-200 dark:bg-gray-800" />

      {/* Phase badge + tags */}
      <div className="mb-8 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30" />
        <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>

      {/* Content lines */}
      <div className="space-y-3">
        {[100, 90, 95, 75, 85, 70, 88, 60].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded-full bg-gray-100 dark:bg-gray-800/70"
            style={{ width: `${w}%`, animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>

      {/* Code block skeleton */}
      <div className="mt-8 rounded-xl bg-gray-100 p-5 dark:bg-gray-800/50">
        <div className="mb-3 h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        {[80, 60, 70, 50].map((w, i) => (
          <div
            key={i}
            className="mt-2 h-3 rounded-full bg-gray-200 dark:bg-gray-700"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  )
}
