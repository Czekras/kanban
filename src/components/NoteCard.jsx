import { Trash2 } from 'lucide-react'
import './NoteCard.css'
import { timeShort } from '../lib/time.js'

/**
 * One note: a single always-editable textarea, no separate view/edit mode.
 * Every keystroke patches App's notes state, which autosaves to localStorage.
 * The <legend> notching the border is a plain <fieldset>/<legend> pair —
 * that native pairing is what cuts the label into the border, no absolute-
 * position/background trick needed.
 */
export default function NoteCard({ note, autoFocus, actions }) {
  return (
    <fieldset className="note-card">
      <legend className="note-card__legend">{timeShort(note.time)}</legend>
      <button className="note-card__delete" title="削除" onClick={() => actions.deleteNote(note.id)}>
        <Trash2 size={15} strokeWidth={1.8} />
      </button>
      <div className="note-card__textarea-wrap" data-replicated-value={note.body}>
        <textarea
          className="note-card__textarea"
          autoFocus={autoFocus}
          value={note.body}
          onChange={(e) => actions.patchNote(note.id, e.target.value)}
        />
      </div>
    </fieldset>
  )
}
