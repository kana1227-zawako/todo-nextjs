"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatDueDate, isOverdue } from "@/lib/dueDate";
import { MAX_MEMO_LENGTH } from "@/lib/memo";
import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  // 今日の日付（"YYYY-MM-DD"）。期限切れの判定に使う
  today: string;
  onToggle: (id: string) => void;
  onTogglePlanned: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({
  todo,
  today,
  onToggle,
  onTogglePlanned,
  onUpdateMemo,
  onDelete,
}: TodoItemProps) {
  const overdue = isOverdue(todo, today);
  // 保存済みのメモは todo.memo、編集中の下書きは draft に分けて持つ。
  // 保存するまで todo.memo は変わらないので、キャンセルは下書きを捨てるだけでよい
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [draft, setDraft] = useState("");
  const memoButtonRef = useRef<HTMLButtonElement>(null);
  const memoInputRef = useRef<HTMLTextAreaElement>(null);
  const memoEditorId = useId();
  const memoInputId = useId();
  const memoCountId = useId();
  // 保存データに1000文字を超えるメモがあった場合は、減らすまで保存できない
  const draftTooLong = draft.length > MAX_MEMO_LENGTH;

  // 編集欄を開いたら、入力欄の末尾にカーソルを置いてすぐ書き足せるようにする
  useEffect(() => {
    if (!isEditingMemo) return;
    const input = memoInputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [isEditingMemo]);

  function openMemoEditor() {
    setDraft(todo.memo ?? "");
    setIsEditingMemo(true);
  }

  // 閉じたあとは「メモを編集」ボタンにフォーカスを戻し、キーボード操作の位置を見失わないようにする
  function closeMemoEditor() {
    setIsEditingMemo(false);
    memoButtonRef.current?.focus();
  }

  function saveMemo() {
    if (draftTooLong) return;
    onUpdateMemo(todo.id, draft);
    closeMemoEditor();
  }

  return (
    // 期限切れの行は、左端の赤い線と薄い赤の背景で目立たせる（内側の影なので幅は変わらない）
    <li
      className={`flex flex-col py-1 pr-2 pl-1 transition-colors sm:pr-3 sm:pl-2 ${
        overdue
          ? "bg-red-50 shadow-[inset_4px_0_0_var(--color-red-600)] hover:bg-red-100/70"
          : "hover:bg-zinc-50"
      }`}
    >
      <div className="flex items-center gap-1">
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
      </div>

      {/* メモは完了用のlabelの外に置く。中に入れると、押したときに完了が切り替わってしまう。
          左の余白はチェックボックスの幅に合わせ、タスク名の書き出しと揃える */}
      <div className="flex flex-col items-start gap-2 pr-2 pb-2 pl-12">
        {todo.memo !== undefined && !isEditingMemo && (
          // 改行はそのまま見せ、長い英数字やURLも枠からはみ出さないよう折り返す
          <p
            className={`w-full text-sm leading-6 break-words whitespace-pre-wrap ${
              todo.completed ? "text-zinc-500" : "text-zinc-700"
            }`}
          >
            {todo.memo}
          </p>
        )}

        <button
          ref={memoButtonRef}
          type="button"
          onClick={isEditingMemo ? closeMemoEditor : openMemoEditor}
          aria-expanded={isEditingMemo}
          aria-controls={isEditingMemo ? memoEditorId : undefined}
          aria-label={`「${todo.title}」のメモを編集`}
          className="-ml-2 min-h-11 cursor-pointer rounded-lg px-2 text-sm text-zinc-600 underline-offset-2 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          メモを編集
        </button>

        {isEditingMemo && (
          <div id={memoEditorId} className="flex w-full flex-col gap-2">
            <label
              htmlFor={memoInputId}
              className="text-sm font-medium text-zinc-800"
            >
              メモ
            </label>
            {/* Enterは改行として使い、保存はボタンだけで行う */}
            <textarea
              ref={memoInputRef}
              id={memoInputId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_MEMO_LENGTH}
              rows={4}
              aria-describedby={memoCountId}
              aria-invalid={draftTooLong || undefined}
              className="w-full resize-y rounded-xl border border-zinc-400 bg-white px-3 py-2 text-base leading-6 text-zinc-900 shadow-sm transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p
                id={memoCountId}
                className={`text-sm ${draftTooLong ? "font-medium text-red-700" : "text-zinc-600"}`}
              >
                {draft.length} / {MAX_MEMO_LENGTH}文字
                {draftTooLong && "（文字数を減らすと保存できます）"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeMemoEditor}
                  className="h-11 cursor-pointer rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={saveMemo}
                  disabled={draftTooLong}
                  className="h-11 cursor-pointer rounded-xl bg-zinc-900 px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
