export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

export function isYesterday(dateKey: string): boolean {
  return daysBetween(dateKey, todayKey()) === 1
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey()
}
