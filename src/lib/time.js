// Shared time helpers for TaskCard: created-time stamp + due-date pill logic.

export function now() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export function timeShort(time) {
  return (time || '').replace(/(\d{1,2}:\d{2}):\d{2}$/, '$1')
}

// kind: 'overdue' | 'soon' (today/tomorrow) | 'later' — TaskCard.css maps each to a color.
export function dueInfo(due) {
  if (!due) return null
  const hasTime = due.includes('T')
  const d = new Date(hasTime ? due : `${due}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null

  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(d)
  dueDay.setHours(0, 0, 0, 0)
  const diffDays = Math.round((dueDay - today) / 86400000)
  const overdue = hasTime ? d.getTime() < now.getTime() : diffDays < 0

  const p = (n) => String(n).padStart(2, '0')
  const md = `${d.getMonth() + 1}月${d.getDate()}日`
  const hm = hasTime ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : ''

  if (overdue) return { label: `期限切れ ${md}${hm}`, kind: 'overdue' }
  if (diffDays === 0) return { label: `今日${hm}まで`, kind: 'soon' }
  if (diffDays === 1) return { label: `明日${hm}まで`, kind: 'soon' }
  return { label: `${md}${hm}まで`, kind: 'later' }
}
