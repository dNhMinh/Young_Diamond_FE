export default function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen animate-pulse bg-[#0f0f0f] text-gray-200">
      <aside className="hidden w-64 border-r border-white/10 bg-[#0b0b0b] p-6 sm:block">
        <div className="h-6 w-36 rounded bg-white/10" />
        <div className="mt-2 h-3 w-24 rounded bg-white/5" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-10 rounded-lg bg-white/5" />
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-[65px] items-center justify-between border-b border-white/10 px-8">
          <div className="h-5 w-20 rounded bg-white/10" />
          <div className="h-9 w-20 rounded bg-white/5" />
        </header>
        <main className="flex-1 bg-[#121212] p-8">
          <div className="min-h-64 rounded-xl border border-white/10 bg-[#151515] p-6">
            <div className="h-6 w-48 rounded bg-white/10" />
            <div className="mt-6 h-28 rounded-lg bg-white/5" />
          </div>
        </main>
      </div>
    </div>
  );
}
