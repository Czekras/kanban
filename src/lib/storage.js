import { seedBoard } from './defaults.js'

const KEY_PREFIX = 'project_kanban:'

/**
 * Bumped only when the stored data's shape changes in a breaking way. The pre-Vite
 * CRA build's data (kanbanArrays/kanbanOptions) is too different from this board shape
 * to be worth transforming, so v2.0.0 starts clean like contact does — see LEGACY_KEYS.
 */
const SCHEMA_VERSION = 1
const KEY = `${KEY_PREFIX}schema-${SCHEMA_VERSION}`

const NOTES_SCHEMA_VERSION = 1
const NOTES_KEY = `${KEY_PREFIX}notes-schema-${NOTES_SCHEMA_VERSION}`

const SETTINGS_SCHEMA_VERSION = 1
const SETTINGS_KEY = `${KEY_PREFIX}settings-schema-${SETTINGS_SCHEMA_VERSION}`

/**
 * Every key Kanban (or its pre-Vite CRA predecessor) has ever saved data under,
 * besides KEY/NOTES_KEY/SETTINGS_KEY. Wiped on load, never read — the CRA shape
 * (todo/prog/done/plus arrays with status/date fields) has no clean mapping to
 * the current board shape, and kanbandc:v1 was only ever dev/test seed data.
 */
const LEGACY_KEYS = ['kanbanArrays', 'kanbanOptions', 'kanbandc:v1']
const ACTIVE_KEYS = [KEY, NOTES_KEY, SETTINGS_KEY]

function removeStaleKeys() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (!key || ACTIVE_KEYS.includes(key)) continue
      const isStale = LEGACY_KEYS.includes(key) || key.startsWith(KEY_PREFIX)
      if (isStale) localStorage.removeItem(key)
    }
  } catch (_) {
    // ignore quota / privacy-mode errors
  }
}

export function loadBoard() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && Array.isArray(saved.columns) && saved.columns.length) return saved
  } catch (_) {
    // fall through to seed
  } finally {
    removeStaleKeys()
  }
  return seedBoard()
}

export function saveBoard(board) {
  try {
    localStorage.setItem(KEY, JSON.stringify(board))
  } catch (_) {
    // ignore quota / privacy-mode errors
  }
}

export function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTES_KEY))
    if (Array.isArray(saved)) return saved
  } catch (_) {
    // fall through to empty
  }
  return []
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  } catch (_) {
    // ignore quota / privacy-mode errors
  }
}

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY))
    if (saved && typeof saved === 'object') return { view: 'board', ...saved }
  } catch (_) {
    // fall through to default
  }
  return { view: 'board' }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (_) {
    // ignore quota / privacy-mode errors
  }
}
