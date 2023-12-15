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
  }[data.name];

  const columnSubtitle = {
    todo: 'バックログ',
    prog: '進行中',
    done: '完了',
  }[data.name];

  /* ---------------------------------- Modal --------------------------------- */
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const addItemModal = (name) => {
    return (
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        className="add-modal"
        contentLabel="Output Modal"
      >
        <div className="add-modal__wrapper">
          <header className="add-modal__header">
            <h2 className="add-modal__title">Add {columnTitle}</h2>
            <small className="add-modal__subtitle">
              {columnSubtitle}を追加する
            </small>
          </header>
          <form
            className="form"
            id="add-item-form"
            onSubmit={(e) => {
              func.handleAddItem(e, name);
              closeModal();
            }}
          >
            <div className="form__item">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={`${columnSubtitle}タスク #${columnCount + 1}`}
              />
            </div>
            <div className="form__item">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="3"
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
              <button type="button" onClick={closeModal}>
                キャンセル
              </button>
              <button type="submit">追加する</button>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  };

  /* ---------------------------------- Items --------------------------------- */

  const addItem = (
    <button className="column__add" onClick={openModal}>
      <span className="material-symbols-outlined">add</span>
    </button>
  );

  if (userList.length) {
    const items = userList.map((item, index) => {
      const tags = item.tag.map((tag, index) => {
        return (
          <li className="card__tags" key={index}>
            <small className="card__tag">#{tag}</small>
          </li>
        );
      });

      return (
        <li className="card" key={index}>
          <header className="card__header">
            <small className="card__date">{item.date}</small>
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
          <h2 className="column-top__title">{columnTitle}</h2>
          <small className="column-top__subtitle">
            {/* {columnCount}コ・{columnSubtitle}リスト */}
            {columnSubtitle}リスト
          </small>
        </header>
        {addItem}
        {/* <div className="column-top__counter">
          <p className="column-top__count">{columnCount}</p>
        </div> */}
      </div>
      <ul className="column__list">{columnList}</ul>
    </div>
  );
}
