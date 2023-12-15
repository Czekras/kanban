import { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/ja';

import settings from '../data/settings.json';
import Column from './Column';

export default function Main() {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const localList = localStorage.getItem('kanbanArrays');
    loadSetting(localList, settings);
  }, []);

  const validate = (item) => {
    const now = moment().locale('ja');
    const date = now.format('MMMDo H:mm');

    return {
      id: crypto.randomUUID(),
      date: date,
      ...item,
    };
  };

  const loadSetting = (list, setting) => {
    if (!list) {
      const updatedList = {
        todo: setting.initialList.todo.map((item) => validate(item)),
        prog: setting.initialList.prog.map((item) => validate(item)),
        done: setting.initialList.done.map((item) => validate(item)),
      };

      localStorage.setItem('kanbanArrays', JSON.stringify(updatedList));
    }

    const localList = JSON.parse(localStorage.getItem('kanbanArrays'));

    setUserList(localList);
  };

  /* ------------------------------- Update List ------------------------------ */
  const handleUpdateList = (list) => {
    console.log('Update: List');
    setUserList(list);
    const newList = JSON.stringify(list);
    localStorage.setItem('kanbanArrays', newList);
  };

  /* ------------------------------- Item Column ------------------------------ */
  const handleAddItem = (event, name) => {
    event.preventDefault();

    const { title, description, tags } = event.target;
    const tagList = tags.value
      ? tags.value.split(' ').filter((tag) => tag)
      : [];

    const item = validate({
      title: title.value,
      description: description.value,
      tag: tagList,
    });

    const newItem = {
      ...userList,
      [name]: [...userList[name], item],
    };

    handleUpdateList(newItem);
  };

  /* -------------------------------------------------------------------------- */

  const columnFunctions = {
    handleAddItem: handleAddItem,
  };

  return (
    <main className="main">
      <section className="main__wrapper">
        <Column
          func={columnFunctions}
          data={{ name: 'todo', userList: userList.todo }}
        />
        <Column
          func={columnFunctions}
          data={{ name: 'prog', userList: userList.prog }}
        />
        <Column
          func={columnFunctions}
          data={{ name: 'done', userList: userList.done }}
        />
      </section>
    </main>
  );
}
