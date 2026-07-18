// Seed shown on first load (before any localStorage state exists).
export function seedBoard() {
  return {
    id: 'default',
    name: 'Default',
    columns: [
      {
        id: 'todo',
        title: 'To-Do',
        sub: 'やることリスト',
        cards: [
          {
            id: 'w1',
            title: 'Kanban Boardへようこそ！',
            tags: ['project', 'support-tools'],
            body: 'タスクやプロジェクトを管理するビジュアルToDoリスト。',
            time: '7月10日 08:02:00',
            checklist: [
              { id: 'k1', text: 'ボタンでタスクを追加してみる', done: true, icon: 'plus' },
              { id: 'k2', text: 'クリックして編集してみる', done: false, icon: 'pencil' },
              { id: 'k3', text: '隣のカラムにドラッグ＆ドロップしてみる', done: false, icon: 'grip' },
              { id: 'k4', text: 'ボタンでタスクを削除してみる', done: false, icon: 'trash' },
            ],
          },
        ],
      },
      { id: 'prog', title: 'In Progress', sub: '進行中リスト', cards: [] },
      { id: 'done', title: 'Completed', sub: '完了リスト', cards: [] },
    ],
  }
}
