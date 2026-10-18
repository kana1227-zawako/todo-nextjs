import type { Todo } from "@/types/todo";

export type TodayProgress = {
  // 「今日やる」に選んだタスクの数
  total: number;
  done: number;
  remaining: number;
  // 達成率（0〜100の整数）
  percent: number;
};

/** 「今日やる」に選んだタスクだけを数える。期限の有無や期限切れかどうかは見ない */
export function getTodayProgress(todos: Todo[]): TodayProgress {
  const planned = todos.filter((todo) => todo.plannedForToday);
  const total = planned.length;
  const done = planned.filter((todo) => todo.completed).length;
  return {
    total,
    done,
    remaining: total - done,
    // 0件のときは割り算をしない。四捨五入だと199/200でも100%になるため切り捨てる
    percent: total === 0 ? 0 : Math.floor((done / total) * 100),
  };
}
