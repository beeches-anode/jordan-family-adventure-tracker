import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-indigo-900 text-white p-4 rounded-xl shadow-2xl z-[100] border border-indigo-700">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-700 p-2 rounded-lg flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">Update Available</h3>
          <p className="text-indigo-200 text-sm mt-1">
            A new version of Adventure Tracker is ready. Reload to get the latest features.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-100 transition-colors"
            >
              Reload Now
            </button>
            <button
              onClick={handleDismiss}
              className="text-indigo-300 hover:text-white px-3 py-2 text-sm transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
