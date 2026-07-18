import { NotebookPen, Columns3 } from 'lucide-react'
import './NotesToggle.css'

/**
 * Sits beside SearchPill in the bottom bar. Toggles App's board/notes view —
 * icon and tooltip flip to point back at whichever view isn't showing.
 */
export default function NotesToggle({ active, onToggle }) {
  return (
    <button className="notes-toggle" title={active ? 'ボードに戻る' : 'メモ'} onClick={onToggle}>
      {active ? <Columns3 size={16} strokeWidth={1.8} /> : <NotebookPen size={16} strokeWidth={1.8} />}
      <span>{active ? 'Kanban' : 'Notes'}</span>
    </button>
  )
}
