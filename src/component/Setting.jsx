import { useState } from 'react';
import ReactModal from 'react-modal';

const customStyles = {
  overlay: {
    zIndex: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    // backgroundColor: 'rgba(0, 0, 0, 0)',
  },
};

ReactModal.setAppElement('#root');

export default function Setting({ func, data }) {
  const now = new Date();
  const dateList = now.toString().split(' ');

  const currentDate = data.userOptions.localeTime
    ? now.toLocaleDateString('ja-JP', {
        weekday: 'narrow',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : `${dateList[1]} ${dateList[2]}, ${dateList[3]} (${dateList[0]})`;

  /* ---------------------------------- Modal --------------------------------- */
  const [settingModal, setSettingModal] = useState(false);

  const openSettingModal = () => {
    setSettingModal(true);
  };

  const closeSettingModal = () => {
    setSettingModal(false);
  };

  const userSettingModal = () => {
    return (
      <ReactModal
        isOpen={settingModal}
        onRequestClose={closeSettingModal}
        style={customStyles}
        className="setting-modal"
        contentLabel="Setting Modal"
      >
        <div className="setting-modal__wrapper">
          <header className="setting-modal__header">
            <h2 className="setting-modal__title">Settings</h2>
            <small className="setting-modal__subtitle">設定の変更</small>
          </header>
          <form className="form" id="add-item-form">
            <div className="form__item form__item--checkbox">
              <input
                type="checkbox"
                name="coloredCards"
                id="coloredCards"
                defaultChecked={data.userOptions.coloredCards}
                onChange={(e) => func.handleChangeOptions(e)}
              />
              <label htmlFor="coloredCards">カード・ボタン色</label>
            </div>
            <div className="form__item form__item--checkbox">
              <input
                type="checkbox"
                name="plusColumn"
                id="plusColumn"
                defaultChecked={data.userOptions.plusColumn}
                onChange={(e) => func.handleChangeOptions(e)}
              />
              <label htmlFor="plusColumn">メモカラムを追加</label>
            </div>
            <div className="form__item form__item--checkbox">
              <input
                type="checkbox"
                name="localeTime"
                id="localeTime"
                defaultChecked={data.userOptions.localeTime}
                onChange={(e) => func.handleChangeOptions(e)}
              />
              <label htmlFor="localeTime">JA-JPフォーマット</label>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  };

  /* -------------------------------------------------------------------------- */

  const activeSetting = settingModal ? 'active' : '';

  return (
    <section className="setting">
      <div className="setting__wrapper" onClick={openSettingModal}>
        <h3 className="setting__time">{currentDate}</h3>
        <span className={`material-symbols-outlined ${activeSetting}`}>
          settings
        </span>
      </div>
      {userSettingModal()}
    </section>
  );
}
