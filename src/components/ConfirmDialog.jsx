import './ConfirmDialog.css'

/**
 * Generic modal confirm, ported from Contact's ConfirmDialog. Renders nothing
 * when closed; clicking the overlay (not the window itself) cancels.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="confirm-dialog" onClick={onCancel}>
      <div className="confirm-dialog__window" onClick={(e) => e.stopPropagation()}>
        <span className="confirm-dialog__title">{title}</span>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-dialog__confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
