import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6 sm:py-20">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          My Tasks
        </h1>
        <p className="mt-3 text-base text-zinc-600">今日やることを整理しよう。</p>
      </header>
      <TodoApp />
    </main>
  );
}
