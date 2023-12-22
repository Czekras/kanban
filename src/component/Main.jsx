import { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

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
    plus: '',
  };

  const defaultStatus = {
    waiting: false,
    priority: false,
  };

  const defaultData = {
    id: '',
    title: '',
    description: '',
    tag: [],
    status: {
      ...defaultStatus,
    },
    date: {
      ...defaultDate,
    },
  };

  useEffect(() => {
    const localList = localStorage.getItem('kanbanArrays');
    loadSetting(localList, settings);
  }, []);

  const newDate = () => {
    return new Date().toString();
  };

  const validate = (item, name) => {
    return {
      ...item,
      id: crypto.randomUUID(),
      date: {
        ...defaultDate,
        ...item.date,
        [name]: newDate(),
      },
    };
  };

  const loadSetting = (list, setting) => {
    if (!list) {
      const updatedList = {
        todo: setting.initialList.todo.map((item) => validate(item, 'todo')),
        prog: setting.initialList.prog.map((item) => validate(item, 'prog')),
        done: setting.initialList.done.map((item) => validate(item, 'done')),
        plus: setting.initialList.plus.map((item) => validate(item, 'plus')),
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

  /* --------------------------- Date Option Format --------------------------- */
  const handleDateFormat = (datetime) => {
    const now = new Date(datetime);
    const dateList = datetime.split(' ');

    return userOptions.localeTime
      ? `${now.getMonth() + 1}月${now.getDate()}日 ${
          now.toTimeString().split(' ')[0]
        }`
      : `${dateList[1]} ${dateList[2]}, ${dateList[4]}`;
  };

  /* ----------------------------- Update Storage ----------------------------- */
  const handleUpdateStorage = (item, target) => {
    const stringyItem = JSON.stringify(item);

    if (target === 'array') {
      // console.log('Update: List');
      setUserList(item);
      localStorage.setItem('kanbanArrays', stringyItem);
    }

    if (target === 'options') {
      // console.log('Update: Options');
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
        status: {
          ...defaultStatus,
        },
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

    const { title, description, tags, waiting, priority } = event.target;
    const tagList = tags.value
      ? tags.value.split(' ').filter((tag) => tag)
      : [];

    const item = {
      ...newArray,
      title: title.value,
      description: description.value,
      tag: tagList,
      status: {
        waiting: waiting.checked,
        priority: priority.checked,
      },
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
  const handleOnDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    if (sourceId === destinationId) {
      handleReorderDnD(
        sourceId,
        userList[sourceId],
        source.index,
        destination.index
      );
    } else {
      handleChangeListDnD(source, destination);
    }
  };

  const handleReorderDnD = (name, list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const newItem = {
      ...userList,
      [name]: result,
    };

    handleUpdateStorage(newItem, 'array');
  };

  const handleChangeListDnD = (source, destination) => {
    const sourceCopy = [...userList[source.droppableId]];
    const sourceItem = sourceCopy.splice(source.index, 1);
    const sourceItemUpdated = [
      {
        ...sourceItem[0],
        date: {
          ...sourceItem[0].date,
          [destination.droppableId]: newDate(),
        },
      },
    ];
    const newSource = sourceCopy;

    const destinationCopy = [...userList[destination.droppableId]];
    destinationCopy.splice(destination.index, 0, ...sourceItemUpdated);
    const newDestination = destinationCopy;

    const newItem = {
      ...userList,
      [source.droppableId]: newSource,
      [destination.droppableId]: newDestination,
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

  const handleResetAll = () => {
    loadSetting(null, settings);
  };

  /* -------------------------------------------------------------------------- */

  const columnFunctions = {
    handleDateFormat: handleDateFormat,
    handleAddItem: handleAddItem,
    handleEditItem: handleEditItem,
    handleDeleteItem: handleDeleteItem,
    handleOnDragEnd: handleOnDragEnd,
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
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Column func={columnFunctions} data={columnData('todo')} />
            <Column func={columnFunctions} data={columnData('prog')} />
            <Column func={columnFunctions} data={columnData('done')} />
            {userOptions.plusColumn ? (
              <Column func={columnFunctions} data={columnData('plus')} />
            ) : (
              ''
            )}
          </DragDropContext>
        </section>
      </main>
      <Setting
        func={{
          handleChangeOptions: handleChangeOptions,
          handleResetAll: handleResetAll,
        }}
        data={{ userOptions: userOptions }}
      />
    </>
  );
}
