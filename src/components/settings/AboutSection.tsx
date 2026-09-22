function AboutSection() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          About Salingbisa
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Platform information and application status.
        </p>
      </div>

      <div className="p-5 bg-indigo-50/60 dark:bg-slate-800/50 rounded-2xl border border-indigo-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            App Version
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            v1.0.0
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Developer
          </span>
          <span className="font-semibold text-slate-800 dark:text-white">
            Salingbisa Team
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        Salingbisa is a collaborative platform designed to share knowledge,
        skills, and grow together positively.
      </p>
    </div>
  );
}

export default AboutSection;
