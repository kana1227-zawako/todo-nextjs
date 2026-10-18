import { useSyncExternalStore } from "react";
import { isValidDueDate } from "@/lib/dueDate";
import type { Todo } from "@/types/todo";

const STORAGE_KEY = "todo-nextjs:todos";

// メモリ上のタスク一覧。null は「まだlocalStorageから読み込んでいない」状態
let todos: Todo[] | null = null;
const listeners = new Set<() => void>();

// 正しい形のタスクなら Todo に整えて返し、そうでなければ null を返す。
// 期限がない・壊れている場合は、タスクは残して期限なしとして扱う。
// 「今日やる」も同じく、項目がない古いデータやおかしな値は「選んでいない」とする
function toTodo(value: unknown): Todo | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    typeof v.title !== "string" ||
    typeof v.completed !== "boolean"
  ) {
    return null;
  }
  const todo: Todo = { id: v.id, title: v.title, completed: v.completed };
  if (isValidDueDate(v.dueDate)) todo.dueDate = v.dueDate;
  if (v.plannedForToday === true) todo.plannedForToday = true;
  return todo;
}

// 保存データが壊れていても落ちないよう、正しい形のタスクだけを取り出す
function parseTodos(raw: string | null): Todo[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(toTodo).filter((todo) => todo !== null);
  } catch {
    return [];
  }
}

function load(): Todo[] {
  try {
    return parseTodos(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // プライベートモードなどでlocalStorageが使えない場合
    return [];
  }
}

function save(next: Todo[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 保存できなくても、画面上の操作は続けられるようにする
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

// 別のタブで変更されたときに同期する
function handleStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY && e.key !== null) return;
  todos = load();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

// ブラウザでのみ呼ばれる
function getSnapshot() {
  todos ??= load();
  return todos;
}

// サーバー側ではlocalStorageに触れず、「未読み込み」として扱う
function getServerSnapshot() {
  return null;
}

export function setTodos(update: (prev: Todo[]) => Todo[]) {
  todos = update(getSnapshot());
  save(todos);
  emit();
}

/** 保存済みのタスク一覧を返す。読み込み前（サーバー側・初回描画時）は null */
export function useTodos() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
