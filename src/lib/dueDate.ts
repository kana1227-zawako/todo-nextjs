import type { Todo } from "@/types/todo";

const DUE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "YYYY-MM-DD" 形式で、実在する日付かどうか（"2026-02-30" などは不可） */
export function isValidDueDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DUE_DATE_PATTERN.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// toISOString() は世界標準時の日付になり、日本では朝9時前に「昨日」になるため、
// パソコンの地域の時刻で今日の日付を作る
export function getTodayString() {
  return toDateString(new Date());
}

/** 未完了で、期限が今日より前のタスクだけを期限切れとする（今日が期限なら対象外） */
export function isOverdue(todo: Todo, today: string) {
  // "YYYY-MM-DD" 同士なら、文字列の大小がそのまま日付の前後になる
  return !todo.completed && todo.dueDate !== undefined && todo.dueDate < today;
}

/** "2026-10-20" → "10/20"。今年でなければ "2027/1/5" のように年も付ける */
export function formatDueDate(dueDate: string, today: string) {
  const [y, m, d] = dueDate.split("-").map(Number);
  const sameYear = dueDate.slice(0, 4) === today.slice(0, 4);
  return sameYear ? `${m}/${d}` : `${y}/${m}/${d}`;
}
