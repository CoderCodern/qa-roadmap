export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4">
      {/* Concentric spinning rings with matcha emoji */}
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/10" />
        <span className="absolute inset-0 rounded-full border border-emerald-200/30 dark:border-emerald-800/30" />
        <span
          className="absolute inset-[6px] animate-spin rounded-full border-2 border-transparent border-t-emerald-500 border-r-teal-400"
          style={{ animationDuration: '0.85s' }}
        />
        <span
          className="absolute inset-[14px] animate-spin rounded-full border-2 border-transparent border-b-teal-400 border-l-cyan-400"
          style={{ animationDuration: '1.3s', animationDirection: 'reverse' }}
        />
        <span className="absolute inset-0 flex items-center justify-center select-none text-2xl">
          🍵
        </span>
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
