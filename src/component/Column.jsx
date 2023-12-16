import { useState } from 'react';
import ReactModal from 'react-modal';

const customStyles = {
  overlay: {
    zIndex: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
};

ReactModal.setAppElement('#root');

export default function Column({ func, data }) {
  const columnList = [];
  const userList = data.userList ? data.userList : [];
  const columnCount = userList ? userList.length : 0;

  const columnTitle = {
    todo: 'To-Do',
    prog: 'In Progress',
    done: 'Completed',
  };

  const columnSubtitle = {
    todo: 'バックログ',
    prog: '進行中',
    done: '完了',
  };

  /* ---------------------------------- Modal --------------------------------- */
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
            className="form"
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
              <button type="submit">追加する</button>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  };

  const editItemModal = ({ item, itemIndex }) => {
    const itemId = item.id;
    const itemTitle = item.title;
    const itemDecription = item.description;
    const itemTag = item.tag ? item.tag.join(' ') : '';
    const datetime = {
      todo: [item.date.todo || '--'],
      prog: [item.date.prog || '--'],
      done: [item.date.done || '--'],
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
            <small className="add-modal__subtitle">タスク内容を変更する</small>
          </header>
          {itemDate}
          <form
            className="form"
            id="add-item-form"
            onSubmit={(e) => {
              func.handleEditItem(e, data.name, item, itemIndex);
              closeEditModal();
            }}
          >
            <div className="form__item">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={itemTitle}
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
                  type="button"
                  onClick={(e) => {
                    func.handleDeleteItem(e, data.name, itemIndex);
                    closeEditModal();
                  }}
                >
                  削除する
                </button>
              </div>
              <button type="submit">追加する</button>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  };

  /* ---------------------------------- Items --------------------------------- */

  const addItem = (
    <button className="column__add" onClick={openAddModal}>
      <span className="material-symbols-outlined">add</span>
    </button>
  );

  if (userList.length) {
    const items = userList.map((item, index) => {
      const tags = item.tag.map((tag, tagIndex) => {
        return (
          <li className="card__tags" key={`${data.name}-tag-${tagIndex}`}>
            <small className="card__tag">#{tag}</small>
          </li>
        );
      });

      return (
        <li
          className="card"
          key={item.id}
          onClick={() => {
            setActiveEditModal({ item: item, itemIndex: index });
            openEditModal();
          }}
        >
          <header className="card__header">
            <small className="card__date">{item.date[data.name]}</small>
            <h3 className="card__title">{item.title}</h3>
          </header>
          <ul className="card__list">{tags}</ul>
          <div className="card__description">
            <p>{item.description}</p>
          </div>
        </li>
      );
    });

    columnList.push(items);
  }

  return (
    <div className="column">
      {addItemModal(data.name)}
      <div className="column-top">
        <header className="column-top__header">
          <h2 className="column-top__title">{columnTitle[data.name]}</h2>
          <small className="column-top__subtitle">
            {/* {columnCount}コ・{columnSubtitle}リスト */}
            {columnSubtitle[data.name]}リスト
          </small>
        </header>
        {addItem}
        {/* <div className="column-top__counter">
          <p className="column-top__count">{columnCount}</p>
        </div> */}
      </div>
      <ul className="column__list">{columnList}</ul>
      {editModal ? editItemModal(activeEditModal) : null}
    </div>
  );
}
