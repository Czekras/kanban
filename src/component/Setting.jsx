import { useState } from 'react';
import ReactModal from 'react-modal';
import moment from 'moment';
import 'moment/locale/ja';

const customStyles = {
  overlay: {
    zIndex: 110,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
};

ReactModal.setAppElement('#root');

export default function Setting({ func, data }) {
  const now = moment().locale('ja');
  const currentDate = now.format('ll (dd)');

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
            <h2 className="setting-modal__title">Setting</h2>
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
              <label htmlFor="coloredCards">Colored Cards</label>
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
