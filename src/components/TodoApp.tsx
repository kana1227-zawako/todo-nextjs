"use client";

import { useCallback, useState, type FormEvent, type KeyboardEvent } from "react";
import TodayProgress from "@/components/TodayProgress";
import TodoItem from "@/components/TodoItem";
import UndoToast from "@/components/UndoToast";
import { getTodayString, isOverdue } from "@/lib/dueDate";
import { MAX_MEMO_LENGTH, normalizeMemo } from "@/lib/memo";
import { getTodayProgress } from "@/lib/todayProgress";
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
  // 期限の入力値（"YYYY-MM-DD"）。空文字は「期限なし」
  const [dueDate, setDueDate] = useState("");
  // 続けて削除しても失われないよう、削除した順に積み重ねる
  const [deletedStack, setDeletedStack] = useState<DeletedTodo[]>([]);
  const lastDeleted = deletedStack.at(-1);

  const trimmed = input.trim();
  const remaining = todos.filter((todo) => !todo.completed).length;
  // サーバーでの事前描画中は現在時刻を読めない（読むとビルドエラー）ため、
  // localStorageの読み込み後（ブラウザ上）でだけ今日の日付を取得する。
  // 日付が変わっても自動では更新せず、再読み込みや操作で描き直したときに反映する
  const today = isLoaded ? getTodayString() : "";
  const overdueCount = todos.filter((todo) => isOverdue(todo, today)).length;
  const todayProgress = getTodayProgress(todos);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trimmed) return;

    const newTodo: Todo = { id: createId(), title: trimmed, completed: false };
    if (dueDate) newTodo.dueDate = dueDate;

    setTodos((prev) => [...prev, newTodo]);
    setInput("");
    setDueDate("");
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

  // 「今日やる」の付け外し。完了状態や期限には触れない
  function togglePlanned(id: string) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, plannedForToday: !todo.plannedForToday }
          : todo,
      ),
    );
  }

  // メモの保存。空白だけなら項目ごと消して「メモなし」に戻す。完了状態や期限には触れない
  function updateMemo(id: string, memo: string) {
    if (memo.length > MAX_MEMO_LENGTH) return;
    const normalized = normalizeMemo(memo);

    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo;
        if (normalized !== undefined) return { ...todo, memo: normalized };
        const next = { ...todo };
        delete next.memo;
        return next;
      }),
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
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
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <label htmlFor="new-todo-due" className="text-base text-zinc-700">
            期限（任意）
          </label>
          <input
            id="new-todo-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11 rounded-xl border border-zinc-400 bg-white px-3 text-base text-zinc-900 shadow-sm transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:outline-none"
          />
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="h-11 cursor-pointer rounded-lg px-3 text-base text-zinc-600 underline-offset-2 transition-colors hover:bg-zinc-100 hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              期限を外す
            </button>
          )}
        </div>
      </form>

      {/* 読み込み前に「まだありません」が一瞬出ないよう、読み込み後にだけ表示する */}
      {isLoaded && <TodayProgress progress={todayProgress} />}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-3 sm:px-5">
          <p
            aria-live="polite"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-zinc-700"
          >
            <span>
              未完了{" "}
              <span className="font-semibold text-zinc-900">{remaining}件</span>
              （全{todos.length}件）
            </span>
            <span className={overdueCount > 0 ? "text-red-700" : undefined}>
              期限切れ{" "}
              <span
                className={`font-semibold ${overdueCount > 0 ? "text-red-700" : "text-zinc-900"}`}
              >
                {overdueCount}件
              </span>
            </span>
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
                today={today}
                onToggle={toggleTodo}
                onTogglePlanned={togglePlanned}
                onUpdateMemo={updateMemo}
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
