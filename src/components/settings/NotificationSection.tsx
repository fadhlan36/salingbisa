function NotificationSection() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Notification Preferences
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Control which notifications you want to receive.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-colors">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              Email Notifications
            </p>
            <p className="text-xs text-slate-500">
              Receive updates and important information via email.
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-colors">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              Community Activity
            </p>
            <p className="text-xs text-slate-500">
              Get notified when there are new interactions or responses.
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

export default NotificationSection;
