"use client";

import { useCallback, useState, type FormEvent, type KeyboardEvent } from "react";
import TodoItem from "@/components/TodoItem";
import UndoToast from "@/components/UndoToast";
import { setTodos, useTodos } from "@/lib/todoStorage";
import type { Todo } from "@/types/todo";

const MAX_TITLE_LENGTH = 100;

// 元に戻すために、削除したタスクと元の位置を覚えておく
type DeletedTodo = {
  todo: Todo;
  index: number;
};

// crypto.randomUUID() は https / localhost でしか使えないため、簡易的なIDを作る
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TodoApp() {
  const storedTodos = useTodos();
  const isLoaded = storedTodos !== null;
  const todos = storedTodos ?? [];
  const [input, setInput] = useState("");
  // 続けて削除しても失われないよう、削除した順に積み重ねる
  const [deletedStack, setDeletedStack] = useState<DeletedTodo[]>([]);
  const lastDeleted = deletedStack.at(-1);

  const trimmed = input.trim();
  const remaining = todos.filter((todo) => !todo.completed).length;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trimmed) return;

    setTodos((prev) => [
      ...prev,
      { id: createId(), title: trimmed, completed: false },
    ]);
    setInput("");
  }

  // 日本語入力の変換確定のEnterで、タスクが追加されないようにする
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) {
      e.preventDefault();
    }
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return;

    setDeletedStack((prev) => [...prev, { todo: todos[index], index }]);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  // 最後に削除したタスクから順に、完了状態も含めて元の位置へ戻す
  function undoDelete() {
    if (!lastDeleted) return;
    const { todo, index } = lastDeleted;

    setDeletedStack((prev) => prev.slice(0, -1));
    setTodos((prev) => {
      if (prev.some((t) => t.id === todo.id)) return prev;
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, todo);
      return next;
    });
  }

  const dismissUndo = useCallback(() => setDeletedStack([]), []);

  return (
    // 通知が出ている間は、一番下のタスクが通知に隠れないよう余白を足す
    <section className={`flex flex-col gap-6 ${lastDeleted ? "pb-24" : ""}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="new-todo" className="sr-only">
          新しいタスク
        </label>
        <input
          id="new-todo"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="新しいタスクを入力"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-400 bg-white px-4 text-base text-zinc-900 shadow-sm transition placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!trimmed}
          className="h-12 shrink-0 cursor-pointer rounded-xl bg-zinc-900 px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-600"
        >
          追加
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-3 sm:px-5">
          <p aria-live="polite" className="text-base text-zinc-700">
            未完了{" "}
            <span className="font-semibold text-zinc-900">{remaining}件</span>
            （全{todos.length}件）
          </p>
        </div>

        {!isLoaded ? (
          <div className="px-6 py-14 text-center text-base text-zinc-600">
            読み込み中…
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <p className="text-base font-medium text-zinc-800">
              タスクはまだありません
            </p>
            <p className="text-base text-zinc-600">
              上の入力欄から、今日やることを追加しましょう。
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </ul>
        )}
      </div>

      {lastDeleted && (
        <UndoToast
          taskTitle={lastDeleted.todo.title}
          resetKey={`${deletedStack.length}-${lastDeleted.todo.id}`}
          onUndo={undoDelete}
          onDismiss={dismissUndo}
        />
      )}
    </section>
  );
}
