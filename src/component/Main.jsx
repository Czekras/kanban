import { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/ja';

import settings from '../data/settings.json';
import Column from './Column';

export default function Main() {
  const [userList, setUserList] = useState([]);

  const defaultDate = {
    todo: '',
    prog: '',
    done: '',
  };

  const defaultData = {
    id: '',
    title: '',
    description: '',
    tag: [],
    date: {
      ...defaultDate,
    },
  };

  useEffect(() => {
    const localList = localStorage.getItem('kanbanArrays');
    loadSetting(localList, settings);
  }, []);

  const newDate = () => {
    const now = moment().locale('ja');
    return now.format('MMMDo H:mm');
  };

  const validate = (item, name) => {
    const date = newDate();

    return {
      ...item,
      id: crypto.randomUUID(),
      date: {
        ...defaultDate,
        ...item.date,
        [name]: date,
      },
    };
  };

  const loadSetting = (list, setting) => {
    if (!list) {
      const updatedList = {
        todo: setting.initialList.todo.map((item) => validate(item, 'todo')),
        prog: setting.initialList.prog.map((item) => validate(item, 'prog')),
        done: setting.initialList.done.map((item) => validate(item, 'done')),
      };

      localStorage.setItem('kanbanArrays', JSON.stringify(updatedList));
    }

    const localList = JSON.parse(localStorage.getItem('kanbanArrays'));

    setUserList(localList);
  };

  /* ----------------------------- Update Storage ----------------------------- */
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

    const item = validate(
      {
        title: title.value,
        description: description.value,
        tag: tagList,
        date: {
          ...defaultDate,
        },
      },
      name
    );

    const newItem = {
      ...userList,
      [name]: [...userList[name], item],
    };

    handleUpdateList(newItem);
  };

  const handleEditItem = (event, name, newArray, index) => {
    event.preventDefault();

    const { title, description, tags } = event.target;
    const tagList = tags.value
      ? tags.value.split(' ').filter((tag) => tag)
      : [];

    const item = {
      ...newArray,
      title: title.value,
      description: description.value,
      tag: tagList,
      date: {
        ...newArray.date,
        [name]: newDate(),
      },
    };

    const newItem = {
      ...userList,
      [name]: [
        ...userList[name].slice(0, index),
        item,
        ...userList[name].slice(index + 1),
      ],
    };

    handleUpdateList(newItem);
  };

  const handleDeleteItem = (event, name, index) => {
    event.preventDefault();

    const newItem = {
      ...userList,
      [name]: [
        ...userList[name].slice(0, index),
        ...userList[name].slice(index + 1),
      ],
    };

    handleUpdateList(newItem);
  };

  /* -------------------------------------------------------------------------- */

  const columnFunctions = {
    handleAddItem: handleAddItem,
    handleEditItem: handleEditItem,
    handleDeleteItem: handleDeleteItem,
  };

  const columnData = (name) => {
    return {
      name: name,
      userList: userList[name],
      defaultData: defaultData,
    };
  };

  return (
    <main className="main">
      <section className="main__wrapper">
        <Column func={columnFunctions} data={columnData('todo')} />
        <Column func={columnFunctions} data={columnData('prog')} />
        <Column func={columnFunctions} data={columnData('done')} />
      </section>
    </main>
  );
}
