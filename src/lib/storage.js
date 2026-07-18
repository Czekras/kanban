import { seedBoard } from './defaults.js'

const KEY_PREFIX = 'project_kanban:'

/**
 * Bumped only when the stored data's shape changes in a breaking way. The pre-Vite
 * CRA build's data (kanbanArrays/kanbanOptions) is too different from this board shape
 * to be worth transforming, so v2.0.0 starts clean like contact does — see LEGACY_KEYS.
 */
const SCHEMA_VERSION = 1
const KEY = `${KEY_PREFIX}schema-${SCHEMA_VERSION}`

/**
 * Every key Kanban (or its pre-Vite CRA predecessor) has ever saved data under,
 * besides KEY. Wiped on load, never read — the CRA shape (todo/prog/done/plus
 * arrays with status/date fields) has no clean mapping to the current board shape,
 * and kanbandc:v1 was only ever dev/test seed data.
 */
const LEGACY_KEYS = ['kanbanArrays', 'kanbanOptions', 'kanbandc:v1']

function removeStaleKeys() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (!key || key === KEY) continue
      const isStale = LEGACY_KEYS.includes(key) || key.startsWith(KEY_PREFIX)
      if (isStale) localStorage.removeItem(key)
    }
  } catch (_) {
    /* ignore quota / privacy-mode errors */
  }
}

export function loadBoard() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && Array.isArray(saved.columns) && saved.columns.length) return saved
  } catch (_) {
    /* fall through to seed */
  } finally {
    removeStaleKeys()
  }
  return seedBoard()
}

export function saveBoard(board) {
  try {
    localStorage.setItem(KEY, JSON.stringify(board))
  } catch (_) {
    /* ignore quota / privacy-mode errors */
  }
}
