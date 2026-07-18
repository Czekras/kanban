// Seed shown on first load (before any localStorage state exists).
export function seedBoard() {
  return {
    id: 'default',
    name: 'Default',
    columns: [
      {
        id: 'todo',
        title: 'To-Do',
        sub: 'バックログリスト',
        cards: [
          {
            id: 'w1',
            title: 'Kanban へようこそ！',
            tags: ['react', 'project', 'task-manager'],
            body: 'タスクやプロジェクトを管理するビジュアル todo リスト。クリックで編集、「＋」ボタンでタスク追加、隣のカラムにドラッグ＆ドロップ',
            time: '7月1日 17:09:44',
            checklist: [
              { id: 'k1', text: 'カードをドラッグしてみる', done: true },
              { id: 'k2', text: 'ラベルと期限を追加する', done: false },
            ],
          },
        ],
      },
      { id: 'prog', title: 'In Progress', sub: '進行中リスト', cards: [] },
      { id: 'done', title: 'Completed', sub: '完了リスト', cards: [] },
    ],
  }
}
