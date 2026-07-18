import { X } from 'lucide-react'
import './Toast.css'

/**
 * One entry in App.jsx's .toast-stack, which handles fixed positioning — this
 * only renders the chip itself, so several can stack (see deleteCard/undoDeleteCard
 * in App.jsx). Auto-dismisses on its own via the timeout that created it;
 * onDismiss here just closes it early.
 */
export default function Toast({ message, actionLabel, onAction, onDismiss }) {
  return (
    <div className="toast" role="status">
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__action" onClick={onAction}>
        {actionLabel}
      </button>
      <button type="button" className="toast__dismiss" onClick={onDismiss} aria-label="閉じる">
        <X size={14} strokeWidth={1.8} />
      </button>
    </div>
  )
}
