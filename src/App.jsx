import { useEffect, useMemo, useRef, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import SearchPill from './components/SearchPill.jsx'
import Column from './components/Column.jsx'
import Toast from './components/Toast.jsx'
import { loadBoard, saveBoard } from './lib/storage.js'
import { now } from './lib/time.js'

function isCardEmpty(card) {
  return (
    !(card.title || '').trim() &&
    !(card.body || '').trim() &&
    !(card.tags || []).length &&
    !(card.checklist || []).length
  )
}

// Deleting several cards in a row stacks one undo toast per delete instead of
// the newest silently replacing the last one's undo window — capped so it
// can't pile up indefinitely.
const MAX_UNDO_TOASTS = 3
const UNDO_TIMEOUT = 5000
const MAX_TOAST_TITLE = 30

function toastTitle(title) {
  const t = title || 'タスク'
  return t.length > MAX_TOAST_TITLE ? `${t.slice(0, MAX_TOAST_TITLE)}…` : t
}

/**
 * App owns all state (board columns/cards + search + editing/drag UI state)
 * and persists the board to localStorage on change.
 */
export default function App() {
  const [board, setBoard] = useState(loadBoard)
  const [query, setQuery] = useState('')
  const [editingCardId, setEditingCardId] = useState(null)
  const [expandedCardId, setExpandedCardId] = useState(null)
  const [pendingDeletes, setPendingDeletes] = useState([])
  const undoTimers = useRef(new Map())

  useEffect(() => { saveBoard(board) }, [board])

  // Clicking outside any card collapses the expanded body.
  useEffect(() => {
    const onMouseDown = (e) => {
      if (expandedCardId && !e.target.closest('.task-card')) setExpandedCardId(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [expandedCardId])

  const q = query.trim().toLowerCase()

  const columns = useMemo(() => {
    const matches = (card) =>
      !q ||
      (card.title || '').toLowerCase().includes(q) ||
      (card.body || '').toLowerCase().includes(q) ||
      (card.tags || []).some((t) => (t || '').toLowerCase().includes(q))
    return board.columns.map((col) => ({ ...col, cards: col.cards.filter(matches) }))
  }, [board, q])

  const updateColumn = (colId, fn) => {
    setBoard((b) => ({ ...b, columns: b.columns.map((c) => (c.id === colId ? fn(c) : c)) }))
  }

  const addCard = (colId) => {
    const id = crypto.randomUUID()
    updateColumn(colId, (c) => ({ ...c, cards: [...c.cards, { id, title: '', tags: [], body: '', time: now() }] }))
    setEditingCardId(id)
    setExpandedCardId(null)
    setQuery('')
  }

  const removeCard = (colId, cardId) => {
    updateColumn(colId, (c) => ({ ...c, cards: c.cards.filter((x) => x.id !== cardId) }))
    setEditingCardId((id) => (id === cardId ? null : id))
  }

  // Drops a toast's auto-dismiss timeout, if one is still pending for it.
  const clearUndoTimer = (cardId) => {
    const timer = undoTimers.current.get(cardId)
    if (timer) {
      clearTimeout(timer)
      undoTimers.current.delete(cardId)
    }
  }

  /**
   * The trash button's delete: removes for real, but keeps the card in
   * `pendingDeletes` for a few seconds so its toast's undo can put it back.
   * Deleting several cards in a row stacks one toast per delete, up to
   * MAX_UNDO_TOASTS — past that, the oldest toast's window closes early to
   * make room, same as if its timer had just run out.
   */
  const deleteCard = (colId, cardId) => {
    const col = board.columns.find((c) => c.id === colId)
    const card = col?.cards.find((x) => x.id === cardId)
    removeCard(colId, cardId)
    if (!card) return

    setPendingDeletes((prev) => {
      const next = [...prev, { id: cardId, card, colId }]
      if (next.length <= MAX_UNDO_TOASTS) return next
      clearUndoTimer(next[0].id)
      return next.slice(1)
    })
    clearUndoTimer(cardId)
    undoTimers.current.set(
      cardId,
      setTimeout(() => {
        undoTimers.current.delete(cardId)
        setPendingDeletes((prev) => prev.filter((p) => p.id !== cardId))
      }, UNDO_TIMEOUT),
    )
  }

  // A toast's "元に戻す": puts that toast's deleted card back at the front of its original column.
  const undoDeleteCard = (cardId) => {
    const entry = pendingDeletes.find((p) => p.id === cardId)
    if (!entry) return
    updateColumn(entry.colId, (c) => ({ ...c, cards: [entry.card, ...c.cards] }))
    setPendingDeletes((prev) => prev.filter((p) => p.id !== cardId))
    clearUndoTimer(cardId)
  }

  // A toast's own dismiss button: closes it early without restoring anything.
  const dismissUndo = (cardId) => {
    setPendingDeletes((prev) => prev.filter((p) => p.id !== cardId))
    clearUndoTimer(cardId)
  }

  const patchCard = (colId, cardId, patch) => {
    updateColumn(colId, (c) => ({
      ...c,
      cards: c.cards.map((x) => (x.id === cardId ? { ...x, ...patch } : x)),
    }))
  }

  const cancelEdit = (colId, card) => {
    if (isCardEmpty(card)) removeCard(colId, card.id)
    else setEditingCardId(null)
  }

  const moveCard = (targetColId, beforeId, cardId) => {
    setBoard((b) => {
      let moved = null
      const stripped = b.columns.map((c) => {
        const i = c.cards.findIndex((x) => x.id === cardId)
        if (i < 0) return c
        moved = c.cards[i]
        return { ...c, cards: c.cards.filter((x) => x.id !== cardId) }
      })
      if (!moved) return b

      const cols = stripped.map((c) => {
        if (c.id !== targetColId) return c
        const arr = c.cards.slice()
        if (beforeId == null) {
          arr.push(moved)
        } else {
          const bi = arr.findIndex((x) => x.id === beforeId)
          if (bi < 0) arr.push(moved)
          else arr.splice(bi, 0, moved)
        }
        return { ...c, cards: arr }
      })

      return { ...b, columns: cols }
    })
  }

  /**
   * @hello-pangea/dnd gives indices within each column's rendered (search-
   * filtered) card list, so translate to "insert before this card id" and
   * let moveCard look that id up in the real, unfiltered board data.
   */
  const handleDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const destCol = columns.find((c) => c.id === destination.droppableId)
    let destCards = destCol.cards
    if (source.droppableId === destination.droppableId) {
      destCards = destCards.filter((c) => c.id !== draggableId)
    }
    const beforeId = destination.index < destCards.length ? destCards[destination.index].id : null

    moveCard(destination.droppableId, beforeId, draggableId)
  }

  const actions = {
    addCard,
    deleteCard,
    patchCard,
    cancelEdit,
    setEditingCardId,
    setExpandedCardId,
  }

  const ui = { editingCardId, expandedCardId }

  return (
    <div className="app">
      <Header title="Kanban" />
      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="app__main">
          {columns.map((col) => (
            <Column key={col.id} column={col} hasQuery={!!q} ui={ui} actions={actions} />
          ))}
        </main>
      </DragDropContext>
      <SearchPill value={query} onChange={setQuery} />
      <Footer />

      {pendingDeletes.length > 0 && (
        <div className="toast-stack">
          {pendingDeletes.map(({ id, card }) => (
            <Toast
              key={id}
              message={`${toastTitle(card.title)} を削除しました`}
              actionLabel="元に戻す"
              onAction={() => undoDeleteCard(id)}
              onDismiss={() => dismissUndo(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
