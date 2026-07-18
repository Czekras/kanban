import { Search, X } from 'lucide-react'
import './SearchPill.css'

/**
 * Floating search pill — fixed, centered, hovering above the sticky footer.
 * Filters cards live across all columns (title, body, #tags); see App.jsx.
 */
export default function SearchPill({ value, onChange }) {
  return (
    <label className="search-pill">
      <Search className="search-pill__icon" size={15} strokeWidth={1.8} />
      <input
        className="search-pill__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="タスクを検索"
      />
      {value.length > 0 && (
        <button className="search-pill__clear" title="クリア" onClick={() => onChange('')}>
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </label>
  )
}
