import { useEffect, useRef, useState } from 'react'
import { Pencil, PencilOff, Trash2, Calendar, ChevronDown, X, Check, GripVertical } from 'lucide-react'
import './TaskCard.css'
import { timeShort, dueInfo } from '../lib/time.js'

/**
 * One card, view or edit mode. Same root element in both modes (matches the
 * design prototype's single .kb-card block) so the hover tools row doesn't
 * have to be duplicated across two components. `dragProvided` comes from
 * @hello-pangea/dnd's Draggable render prop (see Column.jsx).
 */
export default function TaskCard({ card, colId, editing, expanded, dragging, dragProvided, actions }) {
  const tags = card.tags || []
  const checklist = card.checklist || []
  const doneCount = checklist.filter((item) => item.done).length
  const due = dueInfo(card.due)

  const checkInputRefs = useRef({})
  const focusCheckId = useRef(null)
  const bodyRef = useRef(null)
  const [bodyLong, setBodyLong] = useState(false)

  useEffect(() => {
    const id = focusCheckId.current
    if (id && checkInputRefs.current[id]) {
      checkInputRefs.current[id].focus()
      focusCheckId.current = null
    }
  }, [card.checklist])

  // -webkit-line-clamp hides overflow visually without removing it from the
  // DOM, so scrollHeight still reflects the full (unclamped) content height —
  // comparing it to clientHeight is how we detect actual truncation instead
  // of guessing from character count (which blank lines throw off badly).
  useEffect(() => {
    if (expanded) return
    const el = bodyRef.current
    setBodyLong(!!el && el.scrollHeight > el.clientHeight + 1)
  }, [card.body, expanded])

  const startEdit = () => {
    actions.setEditingCardId(card.id)
    actions.setExpandedCardId(null)
  }
  const stripBlankChecks = () => {
    const cleaned = checklist.filter((item) => item.text.trim())
    if (cleaned.length !== checklist.length) patch({ checklist: cleaned })
    return cleaned
  }
  const cancelEdit = () => actions.cancelEdit(colId, { ...card, checklist: stripBlankChecks() })
  const saveEdit = () => {
    stripBlankChecks()
    actions.setEditingCardId(null)
  }

  const handleEscape = (e) => {
    if (e.key === 'Escape' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      cancelEdit()
    }
  }

  const toggleExpand = (e) => {
    e.stopPropagation()
    actions.setExpandedCardId((id) => (id === card.id ? null : card.id))
  }

  const patch = (fields) => actions.patchCard(colId, card.id, fields)

  const addLabel = (e) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    e.preventDefault()
    const value = e.target.value.trim()
    if (value && !tags.includes(value)) patch({ tags: [...tags, value] })
    e.target.value = ''
  }
  const removeLabel = (index) => patch({ tags: tags.filter((_, i) => i !== index) })

  const toggleCheck = (id) =>
    patch({ checklist: checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)) })
  const changeCheckText = (id, text) =>
    patch({ checklist: checklist.map((item) => (item.id === id ? { ...item, text } : item)) })
  const removeCheck = (id) => patch({ checklist: checklist.filter((item) => item.id !== id) })
  const addCheck = () => patch({ checklist: [...checklist, { id: crypto.randomUUID(), text: '', done: false }] })

  const handleCheckEnter = (e, id) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    e.preventDefault()
    const value = e.target.value.trim()
    if (!value) return
    const newId = crypto.randomUUID()
    focusCheckId.current = newId
    patch({
      checklist: [
        ...checklist.map((item) => (item.id === id ? { ...item, text: value } : item)),
        { id: newId, text: '', done: false },
      ],
    })
  }

  return (
    // dragProvided.innerRef/draggableProps/dragHandleProps come from
    // @hello-pangea/dnd's Draggable render prop, not a real React ref —
    // the "innerRef" name trips eslint-plugin-react-hooks' ref-shape
    // heuristic once this object crosses a component boundary as a prop.
    <div
      // eslint-disable-next-line react-hooks/refs
      ref={dragProvided.innerRef}
      // eslint-disable-next-line react-hooks/refs
      {...dragProvided.draggableProps}
      className={`task-card${editing ? ' task-card--editing' : ''}${dragging ? ' task-card--dragging' : ''}`}
    >
      {!editing && tags.length > 0 && (
        <div className="task-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="task-card__tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className={`task-card__tools${editing ? ' task-card__tools--show' : ''}`}>
        {!editing && (
          <button
            className="task-card__tool task-card__tool--grip"
            title="ドラッグして移動"
            // eslint-disable-next-line react-hooks/refs
            {...dragProvided.dragHandleProps}
          >
            <GripVertical size={15} strokeWidth={1.8} />
          </button>
        )}
        <button
          className="task-card__tool"
          title={editing ? '編集をやめる' : '編集'}
          onClick={editing ? cancelEdit : startEdit}
        >
          {editing ? <PencilOff size={13} strokeWidth={1.8} /> : <Pencil size={15} strokeWidth={1.8} />}
        </button>
        <button
          className="task-card__tool task-card__tool--trash"
          title="削除"
          onClick={() => actions.deleteCard(colId, card.id)}
        >
          <Trash2 size={15} strokeWidth={1.8} />
        </button>
      </div>

      {!editing ? (
        <>
          <span className="task-card__title">{card.title}</span>

          {card.body && (
            <span ref={bodyRef} className={`task-card__body${expanded ? ' task-card__body--expanded' : ''}`}>
              {card.body}
            </span>
          )}
          {bodyLong && (
            <button className="task-card__toggle" onClick={toggleExpand} aria-label={expanded ? '閉じる' : 'もっと見る'}>
              <span className="task-card__toggle-line" />
              <span className={`task-card__toggle-icon${expanded ? ' task-card__toggle-icon--open' : ''}`}>
                <ChevronDown size={13} strokeWidth={1.8} />
              </span>
              <span className="task-card__toggle-line" />
            </button>
          )}

          {checklist.length > 0 && (
            <div className="task-card__checks">
              {checklist.map((item) => (
                <button key={item.id} className="task-card__check" onClick={() => toggleCheck(item.id)}>
                  <span className={`task-card__check-box${item.done ? ' task-card__check-box--done' : ''}`}>
                    {item.done && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={`task-card__check-text${item.done ? ' task-card__check-text--done' : ''}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="task-card__meta">
            <span className="task-card__pill task-card__pill--created">
              <Calendar size={12} strokeWidth={1.8} />
              {timeShort(card.time)}
            </span>
            {due && <span className={`task-card__pill task-card__pill--due-${due.kind}`}>{due.label}</span>}
            {checklist.length > 0 && (
              <span className="task-card__progress">
                <span className="task-card__progress-bar">
                  <span
                    className={`task-card__progress-fill${doneCount === checklist.length ? ' task-card__progress-fill--done' : ''}`}
                    style={{ width: `${Math.round((doneCount / checklist.length) * 100)}%` }}
                  />
                </span>
                <span className="task-card__progress-text">{doneCount}/{checklist.length}</span>
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="task-card__edit-labels">
            {tags.map((tag, i) => (
              <span key={tag} className="task-card__edit-label">
                #{tag}
                <button className="task-card__edit-label-remove" title="ラベルを削除" onClick={() => removeLabel(i)}>
                  <X size={12} strokeWidth={1.8} />
                </button>
              </span>
            ))}
            <input className="task-card__edit-label-input" placeholder="＋ ラベル" onKeyDown={addLabel} />
          </div>

          <input
            className="task-card__input"
            autoFocus
            value={card.title}
            placeholder="タイトル"
            onChange={(e) => patch({ title: e.target.value })}
            onKeyDown={handleEscape}
          />
          <div className="task-card__textarea-wrap" data-replicated-value={card.body}>
            <textarea
              className="task-card__textarea"
              value={card.body}
              placeholder="内容"
              onChange={(e) => patch({ body: e.target.value })}
              onKeyDown={handleEscape}
            />
          </div>

          <div className="task-card__edit-checks">
            {checklist.map((item) => (
              <div key={item.id} className="task-card__edit-check">
                <button
                  className={`task-card__check-box${item.done ? ' task-card__check-box--done' : ''}`}
                  onClick={() => toggleCheck(item.id)}
                >
                  {item.done && <Check size={11} strokeWidth={3} />}
                </button>
                <input
                  ref={(el) => { checkInputRefs.current[item.id] = el }}
                  className="task-card__edit-check-input"
                  value={item.text}
                  placeholder="チェック項目"
                  onChange={(e) => changeCheckText(item.id, e.target.value)}
                  onKeyDown={(e) => handleCheckEnter(e, item.id)}
                />
                <button className="task-card__edit-check-remove" title="削除" onClick={() => removeCheck(item.id)}>
                  <X size={14} strokeWidth={1.8} />
                </button>
              </div>
            ))}
            <button className="task-card__edit-check-add" onClick={addCheck}>＋ チェック項目</button>
          </div>

          <div className="task-card__edit-footer">
            <div className="task-card__edit-due">
              <span className="task-card__edit-due-label">期限</span>
              <input
                type="datetime-local"
                className="task-card__edit-due-input"
                value={card.due || ''}
                onChange={(e) => patch({ due: e.target.value })}
              />
            </div>
            <div className="task-card__edit-buttons">
              <button className="task-card__btn task-card__btn--ghost" onClick={cancelEdit}>キャンセル</button>
              <button className="task-card__btn task-card__btn--primary" onClick={saveEdit}>保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
