import { formatDueDate, isOverdue } from "@/lib/dueDate";
import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  // 今日の日付（"YYYY-MM-DD"）。期限切れの判定に使う
  today: string;
  onToggle: (id: string) => void;
  onTogglePlanned: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({
  todo,
  today,
  onToggle,
  onTogglePlanned,
  onDelete,
}: TodoItemProps) {
  const overdue = isOverdue(todo, today);

  return (
    // 期限切れの行は、左端の赤い線と薄い赤の背景で目立たせる（内側の影なので幅は変わらない）
    <li
      className={`flex items-center gap-1 py-1 pr-2 pl-1 transition-colors sm:pr-3 sm:pl-2 ${
        overdue
          ? "bg-red-50 shadow-[inset_4px_0_0_var(--color-red-600)] hover:bg-red-100/70"
          : "hover:bg-zinc-50"
      }`}
    >
      {/* チェックボックスとタスク名をまとめて包み、行全体を押せるようにする */}
      <label className="flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-3 py-2">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="size-6 shrink-0 cursor-pointer accent-zinc-900"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={`break-words text-base leading-6 transition-colors ${
              todo.completed ? "text-zinc-500 line-through" : "text-zinc-900"
            }`}
          >
            {todo.title}
          </span>
          {todo.dueDate && (
            <span className="flex flex-wrap items-center gap-2 text-sm leading-5">
              <span
                className={
                  overdue ? "font-medium text-red-700" : "text-zinc-600"
                }
              >
                期限: {formatDueDate(todo.dueDate, today)}
              </span>
              {overdue && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                  期限切れ
                </span>
              )}
            </span>
          )}
        </span>
      </label>
      {/* 「今日やる」は完了用のlabelの外に置き、専用のlabelで包む。
          同じlabelの中に入れると、押したときに完了の方が切り替わってしまう */}
      <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-300 px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 has-checked:border-amber-500 has-checked:bg-amber-50 has-checked:font-semibold has-checked:text-amber-900 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-zinc-900">
        <input
          type="checkbox"
          checked={todo.plannedForToday === true}
          onChange={() => onTogglePlanned(todo.id)}
          aria-label={`「${todo.title}」を今日やる`}
          className="size-4 shrink-0 cursor-pointer accent-amber-600"
        />
        <span aria-hidden="true">今日やる</span>
      </label>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`「${todo.title}」を削除`}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M6 6l1 14h10l1-14" />
        </svg>
      </button>
    </li>
  );
}
