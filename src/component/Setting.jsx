import moment from 'moment';
import 'moment/locale/ja';

export default function Setting() {
  const now = moment().locale('ja');
  const currentDate = now.format('ll (dd)');

  return (
    <section className="setting">
      <div className="setting__wrapper">
        <h3 className="setting__time">{currentDate}</h3>
      </div>
    </section>
  );
}
