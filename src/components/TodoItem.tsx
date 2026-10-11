import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-1 py-1 pr-2 pl-1 transition-colors hover:bg-zinc-50 sm:pr-3 sm:pl-2">
      {/* チェックボックスとタスク名をまとめて包み、行全体を押せるようにする */}
      <label className="flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-3 py-2">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="size-6 shrink-0 cursor-pointer accent-zinc-900"
        />
        <span
          className={`min-w-0 flex-1 break-words text-base leading-6 transition-colors ${
            todo.completed ? "text-zinc-500 line-through" : "text-zinc-900"
          }`}
        >
          {todo.title}
        </span>
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
