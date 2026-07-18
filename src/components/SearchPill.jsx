import { Search, X } from 'lucide-react'
import './SearchPill.css'

/**
 * Floating search pill — fixed, centered, hovering above the sticky footer.
 * Filters live across whichever view is active (board cards or notes); see
 * App.jsx. Placeholder text is passed in since what it searches changes.
 */
export default function SearchPill({ value, onChange, placeholder }) {
  const handleEscape = (e) => {
    if (e.key !== 'Escape' || e.nativeEvent.isComposing) return
    e.preventDefault()
    onChange('')
    e.target.blur()
  }

  return (
    <label className="search-pill">
      <Search className="search-pill__icon" size={15} strokeWidth={1.8} />
      <input
        className="search-pill__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleEscape}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <button className="search-pill__clear" title="クリア" onClick={() => onChange('')}>
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </label>
  )
}
