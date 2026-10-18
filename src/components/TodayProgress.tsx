import type { TodayProgress as Progress } from "@/lib/todayProgress";

type TodayProgressProps = {
  progress: Progress;
};

export default function TodayProgress({ progress }: TodayProgressProps) {
  const { total, done, remaining, percent } = progress;
  const allDone = total > 0 && remaining === 0;

  return (
    <section
      aria-labelledby="today-progress-heading"
      className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm sm:px-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="today-progress-heading"
          className="text-base font-semibold text-zinc-900"
        >
          今日やるタスク
        </h2>
        {total > 0 && (
          <p className="text-base text-zinc-700">
            達成率{" "}
            <span className="text-xl font-bold text-zinc-900">{percent}%</span>
          </p>
        )}
      </div>

      {total === 0 ? (
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-base font-medium text-zinc-800">
            今日のタスクはまだありません
          </p>
          <p className="text-sm text-zinc-600">
            タスクの「今日やる」にチェックすると、ここに進み具合が表示されます。
          </p>
        </div>
      ) : (
        <>
          <div
            role="progressbar"
            aria-labelledby="today-progress-heading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${total}件中${done}件完了（${percent}%）`}
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                allDone ? "bg-emerald-600" : "bg-zinc-900"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p
            aria-live="polite"
            className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-zinc-700"
          >
            <span>
              完了 <span className="font-semibold text-zinc-900">{done}件</span>
            </span>
            <span>
              残り{" "}
              <span className="font-semibold text-zinc-900">{remaining}件</span>
              （全{total}件）
            </span>
            {allDone && (
              <span className="font-medium text-emerald-700">
                すべて完了しました
              </span>
            )}
          </p>
        </>
      )}
    </section>
  );
}
