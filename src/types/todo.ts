export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  // 期限（例: "2026-10-20"）。期限を設定しないタスクにはこの項目がない
  dueDate?: string;
};
