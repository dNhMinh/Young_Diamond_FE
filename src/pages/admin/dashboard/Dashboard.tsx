export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-wide text-white">
        Dashboard
      </h2>

      <p className="mt-2 text-sm text-gray-400">Welcome back, Admin</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Products" value="128" />
        <StatCard title="Orders" value="56" />
        <StatCard title="Revenue" value="₫128,000,000" />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
      <p className="text-sm tracking-wide text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
