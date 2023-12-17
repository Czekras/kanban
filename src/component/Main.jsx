import { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/ja';

import settings from '../data/settings.json';
import Column from './Column';
import Setting from './Setting';

export default function Main() {
  const [userList, setUserList] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

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
      localStorage.setItem(
        'kanbanOptions',
        JSON.stringify(setting.initialOption)
      );
    }

    const localList = JSON.parse(localStorage.getItem('kanbanArrays'));
    const localOptions = JSON.parse(localStorage.getItem('kanbanOptions'));

    setUserList(localList);
    setUserOptions(localOptions);
  };

  /* ----------------------------- Update Storage ----------------------------- */
  const handleUpdateStorage = (item, target) => {
    const stringyItem = JSON.stringify(item);

    if (target == 'array') {
      console.log('Update: List');
      setUserList(item);
      localStorage.setItem('kanbanArrays', stringyItem);
    }

    if (target == 'options') {
      console.log('Update: Options');
      setUserOptions(item);
      localStorage.setItem('kanbanOptions', stringyItem);
    }
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

    handleUpdateStorage(newItem, 'array');
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

    handleUpdateStorage(newItem, 'array');
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

    handleUpdateStorage(newItem, 'array');
  };

  /* ----------------------------------- DnD ---------------------------------- */
  const handleReorderDnD = (item, name) => {
    const newItem = {
      ...userList,
      [name]: item,
    };

    handleUpdateStorage(newItem, 'array');
  };

  /* --------------------------------- Options -------------------------------- */
  const handleChangeOptions = (event) => {
    const { id, checked } = event.target;

    const item = {
      ...userOptions,
      [id]: checked,
    };

    handleUpdateStorage(item, 'options');
  };

  /* -------------------------------------------------------------------------- */

  const columnFunctions = {
    handleAddItem: handleAddItem,
    handleEditItem: handleEditItem,
    handleDeleteItem: handleDeleteItem,
    handleReorderDnD: handleReorderDnD,
  };

  const columnData = (name) => {
    return {
      name: name,
      userList: userList[name],
      userOptions: userOptions,
      defaultData: defaultData,
    };
  };

  return (
    <>
      <main className="main">
        <section className="main__wrapper">
          <Column func={columnFunctions} data={columnData('todo')} />
          <Column func={columnFunctions} data={columnData('prog')} />
          <Column func={columnFunctions} data={columnData('done')} />
        </section>
      </main>
      <Setting
        func={{ handleChangeOptions: handleChangeOptions }}
        data={{ userOptions: userOptions }}
      />
    </>
  );
}
