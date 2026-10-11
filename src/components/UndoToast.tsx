"use client";

import { useEffect, useState, type FocusEvent } from "react";

// 利用者が読んで判断できるよう、余裕を持った表示時間にする
const DISPLAY_MS = 10_000;

type UndoToastProps = {
  taskTitle: string;
  /** この値が変わると表示時間を数え直す */
  resetKey: string;
  onUndo: () => void;
  onDismiss: () => void;
};

export default function UndoToast({
  taskTitle,
  resetKey,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  // マウスを乗せている間・ボタンにフォーカスがある間は自動で消さない
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPaused = isHovered || isFocused;

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(onDismiss, DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [isPaused, resetKey, onDismiss]);

  function handleBlur(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsFocused(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        role="status"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className="flex w-full max-w-xl items-center gap-2 rounded-2xl bg-zinc-900 py-2 pr-2 pl-4 text-white shadow-lg sm:pl-5"
      >
        {/* 長いタスク名だけを省略し、「を削除しました」は必ず見えるようにする */}
        <p className="min-w-0 flex-1 text-base leading-snug sm:flex">
          <span className="block truncate">「{taskTitle}」</span>
          <span className="block shrink-0">を削除しました</span>
        </p>
        <button
          type="button"
          onClick={onUndo}
          className="min-h-11 shrink-0 cursor-pointer rounded-lg px-3 text-base font-semibold text-white underline underline-offset-4 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          元に戻す
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="通知を閉じる"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="size-5"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
