import { Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard.jsx'
import './Column.css'

/**
 * One board column. `column.cards` is already search-filtered by App.
 * Drag-and-drop is handled by @hello-pangea/dnd (DragDropContext lives in
 * App); editing/expanded ids live in App and are passed down via `ui`.
 */
export default function Column({ column, hasQuery, ui, actions }) {
  const isEmpty = column.cards.length === 0 && !hasQuery
  const noResults = column.cards.length === 0 && hasQuery

  return (
    <section className="board-col">
      <header className="board-col__head">
        <div className="board-col__titles">
          <h2 className="board-col__title">{column.title}</h2>
          <div className="board-col__meta">
            {column.sub && <span className="board-col__sub">{column.sub}</span>}
            <span className="board-col__count">{column.cards.length}</span>
          </div>
        </div>
        <button className="board-col__add" title="タスクを追加" onClick={() => actions.addCard(column.id)}>
          <Plus size={18} strokeWidth={1.8} />
        </button>
      </header>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div className="board-col__cards" ref={provided.innerRef} {...provided.droppableProps}>
            {column.cards.map((card, index) => (
              <Draggable
                key={card.id}
                draggableId={card.id}
                index={index}
                isDragDisabled={ui.editingCardId === card.id}
              >
                {(dragProvided, dragSnapshot) => (
                  <TaskCard
                    card={card}
                    colId={column.id}
                    editing={ui.editingCardId === card.id}
                    expanded={ui.expandedCardId === card.id}
                    dragging={dragSnapshot.isDragging}
                    dragProvided={dragProvided}
                    actions={actions}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {isEmpty && (
              <div className="board-col__empty">
                <span>ここにドラッグ</span>
                <button className="board-col__empty-add" onClick={() => actions.addCard(column.id)}>
                  または新しいタスクを作成
                </button>
              </div>
            )}
            {noResults && <div className="board-col__no-results">該当するタスクなし</div>}
          </div>
        )}
      </Droppable>
    </section>
  )
}
