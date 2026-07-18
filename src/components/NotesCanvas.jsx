import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import NoteCard from './NoteCard.jsx'
import './NotesCanvas.css'

const MAX_COLUMNS = 3
const GAP = 16
// SP (smartphone) breakpoint — matches the 1000px cutoff used across the
// other apps in this project (basic-auth/contact/navigation).
const SP_QUERY = '(max-width: 1000px)'

/**
 * Fills app__main in notes view. Notes are packed into columns (3, or 1 on
 * SP) via a small masonry layout instead of a CSS grid, so a tall note
 * doesn't stretch its row-mates (grid's default align-items: stretch) and
 * short notes don't leave a tall empty gap under it (grid rows share one
 * height per row).
 *
 * Each note is assigned a column once (kept in columnOf, a ref so it survives
 * re-renders without re-triggering them) and never reassigned afterward — only
 * its Y offset within that column moves as heights change. That's what stops
 * a note you're actively typing in from jumping to a different column.
 *
 * `notes` is already search-filtered by App; `hasNotes` is the true unfiltered
 * count, kept separate so "すべて削除" doesn't hide just because a search term
 * happens to match nothing.
 */
export default function NotesCanvas({ notes, hasNotes, newNoteId, actions }) {
  const gridRef = useRef(null)
  const cardRefs = useRef(new Map()) // note id -> wrapper element
  const columnOf = useRef(new Map()) // note id -> assigned column, stable once set
  const [layout, setLayout] = useState({ positions: new Map(), height: 0 })
  const [columns, setColumns] = useState(() => (window.matchMedia(SP_QUERY).matches ? 1 : MAX_COLUMNS))

  useEffect(() => {
    const mql = window.matchMedia(SP_QUERY)
    const handleChange = () => setColumns(mql.matches ? 1 : MAX_COLUMNS)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  // A column assignment made under one column count (e.g. everything forced
  // into col 0 while at the 1-column SP width) is still a "valid" index once
  // the count changes back up, so recompute alone would never redistribute
  // it — hence the explicit clear whenever `columns` itself changes.
  useLayoutEffect(() => {
    columnOf.current.clear()
  }, [columns])

  const recompute = () => {
    for (const id of columnOf.current.keys()) {
      if (!cardRefs.current.has(id)) columnOf.current.delete(id)
    }

    const colHeights = Array(columns).fill(0)
    const positions = new Map()

    for (const note of notes) {
      const el = cardRefs.current.get(note.id)
      const height = el ? el.offsetHeight : 0

      let col = columnOf.current.get(note.id)
      if (col === undefined) {
        col = colHeights.indexOf(Math.min(...colHeights))
        columnOf.current.set(note.id, col)
      }

      positions.set(note.id, { col, y: colHeights[col] })
      colHeights[col] += height + GAP
    }

    setLayout({ positions, height: Math.max(0, Math.max(...colHeights) - GAP) })
  }

  // recompute is redefined every render (it closes over the current `notes`),
  // so the ResizeObserver below — set up once — calls this ref instead of the
  // stale closure it would otherwise capture at mount time. Refreshed inside
  // an effect, not render, since refs shouldn't be written during render.
  const recomputeRef = useRef(recompute)
  useLayoutEffect(() => {
    recomputeRef.current = recompute
  })

  // Positions require each card's committed DOM height, which only exists
  // post-render, so this can't be plain derived state computed during render.
  // Covers add/delete/edit: patchNote/addNote/deleteNote all give `notes` a
  // new array reference, so this fires on every one of those.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(recompute, [notes, columns])

  // Covers pure width-driven reflow (e.g. window resize rewrapping a
  // textarea's text) — a height change with no accompanying `notes` change.
  // Filtered to width deltas only: this element's own height is set by us via
  // layout.height, so an unfiltered observer would see our own writes as a
  // resize and re-trigger itself every keystroke.
  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    let lastWidth = el.getBoundingClientRect().width
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (width === lastWidth) return
      lastWidth = width
      recomputeRef.current()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="notes-canvas">
      <div className="notes-canvas__toolbar">
        <button className="notes-canvas__toolbar-btn notes-canvas__toolbar-btn--add" onClick={actions.addNote}>
          <Plus size={15} strokeWidth={1.8} />
          メモを追加
        </button>
        {hasNotes && (
          <button
            className="notes-canvas__toolbar-btn notes-canvas__toolbar-btn--delete-all"
            onClick={actions.deleteAllNotes}
          >
            <Trash2 size={15} strokeWidth={1.8} />
            すべて削除
          </button>
        )}
      </div>

      <div className="notes-canvas__grid" ref={gridRef} style={{ height: layout.height }}>
        {notes.map((note) => {
          const pos = layout.positions.get(note.id) || { col: 0, y: 0 }
          return (
            <div
              key={note.id}
              ref={(el) => {
                if (el) cardRefs.current.set(note.id, el)
                else cardRefs.current.delete(note.id)
              }}
              className="notes-canvas__cell"
              style={{
                width: `calc((100% - ${GAP * (columns - 1)}px) / ${columns})`,
                left: `calc(${pos.col} * (100% + ${GAP}px) / ${columns})`,
                transform: `translateY(${pos.y}px)`,
              }}
            >
              <NoteCard note={note} autoFocus={note.id === newNoteId} actions={actions} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
