import { useState } from 'react';
import ReactModal from 'react-modal';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const customStyles = {
  overlay: {
    zIndex: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
};

ReactModal.setAppElement('#root');

export default function Column({ func, data }) {
  const columnCount = data.userList ? data.userList.length : 0;

  const columnTitle = {
    todo: 'To-Do',
    prog: 'In Progress',
    done: 'Completed',
    plus: 'Note & Reference',
  };

  const columnSubtitle = {
    todo: 'バックログ',
    prog: '進行中',
    done: '完了',
    plus: 'メモ',
  };

  /* ---------------------------------- Modal --------------------------------- */
  const deleteButtonClass = data.userOptions.coloredCards ? 'delete' : '';
  const submitButtonClass = data.userOptions.coloredCards
    ? 'active--colored'
    : 'active';
  const cardColor = data.userOptions.coloredCards ? `card__${data.name}` : '';
  const cardClass = data.userOptions.coloredCards
    ? 'card'
    : 'card card--default';
  const columnWidth = data.userOptions.plusColumn ? '25%' : '33.33%';

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [activeEditModal, setActiveEditModal] = useState({
    item: data.defaultData,
    itemIndex: 0,
  });

  const openAddModal = () => {
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
  };

  const openEditModal = () => {
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
  };

  const addItemModal = (name) => {
    return (
      <ReactModal
        isOpen={addModal}
        onRequestClose={closeAddModal}
        style={customStyles}
        className="add-modal"
        contentLabel="Add Modal"
      >
        <div className="add-modal__wrapper">
          <header className="add-modal__header">
            <h2 className="add-modal__title">Add {columnTitle[data.name]}</h2>
            <small className="add-modal__subtitle">
              {columnSubtitle[data.name]}を追加する
            </small>
          </header>
          <form
            className="form form--main"
            id="add-item-form"
            onSubmit={(e) => {
              func.handleAddItem(e, name);
              closeAddModal();
            }}
          >
            <div className="form__item">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={`${columnSubtitle[data.name]}タスク #${
                  columnCount + 1
                }`}
                autoFocus
              />
            </div>
            <div className="form__item">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="3"
                placeholder={`タスク内容を入力してください`}
              ></textarea>
            </div>
            <div className="form__item">
              <label htmlFor="tags">Tags</label>
              <input type="text" name="tags" id="tags" />
              <small className="form__note">
                ※タグの間にはスペースを入力してください
              </small>
            </div>
            <div className="form__buttons">
              <button type="button" onClick={closeAddModal}>
                キャンセル
              </button>
              <button className={submitButtonClass} type="submit">
                追加する
              </button>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  };

  const editItemModal = ({ item, itemIndex }) => {
    // const itemId = item.id;
    const itemTitle = item.title;
    const itemDecription = item.description;
    const itemTag = item.tag ? item.tag.join(' ') : '';

    const datetime = {
      todo: [item.date.todo ? func.handleDateFormat(item.date.todo) : '--'],
      prog: [item.date.prog ? func.handleDateFormat(item.date.prog) : '--'],
      done: [item.date.done ? func.handleDateFormat(item.date.done) : '--'],
      // plus: [item.date.plus || '--'],
    };

    const itemDate = (
      <table className="table">
        <tbody className="table__body">
          {Object.entries(datetime).map((item, timeIndex) => {
            return (
              <tr className="table__row" key={timeIndex}>
                <th className="table__title">{columnTitle[item[0]]}</th>
                <td className="table__text">{item[1]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );

    return (
      <ReactModal
        isOpen={editModal}
        onRequestClose={closeEditModal}
        style={customStyles}
        className="add-modal"
        contentLabel="Edit Modal"
      >
        <div className="add-modal__wrapper">
          <header className="add-modal__header">
            <h2 className="add-modal__title">Edit {itemTitle}</h2>
            <small className="add-modal__subtitle">タスク内容を編集する</small>
          </header>
          {itemDate}
          <form
            className="form form--main"
            id="add-item-form"
            onSubmit={(e) => {
              func.handleEditItem(e, data.name, item, itemIndex);
              closeEditModal();
            }}
          >
            <ul className="form__cb-list">
              {item.status
                ? Object.entries(item.status).map((item, statIndex) => {
                    const stat = item[0];

                    if (stat)
                      return (
                        <li
                          className="form__cb-item"
                          key={`${data.name}-stat-${statIndex}`}
                        >
                          <input
                            type="checkbox"
                            name={stat}
                            id={stat}
                            defaultChecked={item[1]}
                          />
                          <label htmlFor={stat}>{stat}</label>
                        </li>
                      );
                  })
                : ''}
            </ul>
            <div className="form__item">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={itemTitle}
                autoFocus
              />
            </div>
            <div className="form__item">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="3"
                placeholder={`タスク内容を入力してください`}
                defaultValue={itemDecription}
              ></textarea>
            </div>
            <div className="form__item">
              <label htmlFor="tags">Tags</label>
              <input type="text" name="tags" id="tags" defaultValue={itemTag} />
              <small className="form__note">
                ※タグの間には半角スペースを入力してください
              </small>
            </div>
            <div className="form__buttons form__buttons--edit">
              <div className="form__button-box">
                <button type="button" onClick={closeEditModal}>
                  キャンセル
                </button>
                <button
                  className={deleteButtonClass}
                  type="button"
                  onClick={(e) => {
                    func.handleDeleteItem(e, data.name, itemIndex);
                    closeEditModal();
                  }}
                >
                  削除する
                </button>
              </div>
              <button className={submitButtonClass} type="submit">
                追加する
              </button>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  };

  /* --------------------------------- Others --------------------------------- */
  const addItem = (
    <button className="column__add" onClick={openAddModal}>
      <span className="material-symbols-outlined">add</span>
    </button>
  );

  /* --------------------------------- Status --------------------------------- */
  const addStatus = (status) => {
    const statsIcon = [];
    const statsList = [];

    if (status) {
      if (status.priority) statsIcon.push('error');
      if (status.waiting) statsIcon.push('timelapse');
    }

    statsIcon.map((item) => {
      statsList.push(<span className="material-symbols-outlined">{item}</span>);
    });

    return statsList;
  };

  /* ----------------------------------- DnD ---------------------------------- */
  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging ? '#f0f0f0' : '',
    ...draggableStyle,
  });

  /* -------------------------------------------------------------------------- */
  return (
    <div className="column" style={{ width: columnWidth }}>
      {addItemModal(data.name)}
      <div className="column-top">
        <header className="column-top__header">
          <h2 className="column-top__title">{columnTitle[data.name]}</h2>
          <small className="column-top__subtitle">
            {columnSubtitle[data.name]}リスト・{columnCount}
            {/* {columnSubtitle[data.name]}リスト */}
          </small>
        </header>
        {addItem}
        {/* <div className="column-top__counter">
          <p className="column-top__count">{columnCount}</p>
        </div> */}
      </div>
      <Droppable droppableId={`${data.name}`}>
        {(provided, snapshot) => (
          <ul
            className="column__list"
            {...provided.droppableProps}
            ref={provided.innerRef}
            // style={getListStyle(snapshot.isDraggingOver)}
          >
            {/* {data.userList */}
            {columnCount
              ? data.userList.map((item, index) => {
                  const tags = item.tag.map((tag, tagIndex) => {
                    return (
                      <li
                        className="card__tag"
                        key={`${data.name}-tag-${tagIndex}`}
                      >
                        <small>#{tag}</small>
                      </li>
                    );
                  });

                  return (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          className={`${cardClass} ${cardColor}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          // key={item.id}
                          onClick={() => {
                            setActiveEditModal({
                              item: item,
                              itemIndex: index,
                            });
                            openEditModal();
                          }}
                        >
                          <header className="card__header">
                            <div className="card__box">
                              <div className="card__stat">
                                {addStatus(item.status)}
                              </div>
                              <small className="card__date">
                                {func.handleDateFormat(item.date[data.name])}
                              </small>
                            </div>
                            <h3 className="card__title">{item.title}</h3>
                          </header>
                          <ul className="card__list">{tags}</ul>
                          <div className="card__description">
                            <p>{item.description}</p>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })
              : ''}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
      {editModal ? editItemModal(activeEditModal) : null}
    </div>
  );
}
