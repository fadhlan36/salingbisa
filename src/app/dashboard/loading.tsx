export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 w-full mt-6 pb-28 sm:pb-8">
      <div className="space-y-10 animate-pulse">
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900/60" />
        <div className="space-y-4 pt-4">
          <div className="h-6 w-64 rounded bg-slate-100 dark:bg-slate-900/60" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-900/60"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
