export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  // 期限（例: "2026-10-20"）。期限を設定しないタスクにはこの項目がない
  dueDate?: string;
  // 「今日やる」に選んだかどうか。期限とは関係なく、自分で選んで付け外しする。
  // この機能より前に保存したタスクにはこの項目がない（選んでいない扱い）
  plannedForToday?: boolean;
};
