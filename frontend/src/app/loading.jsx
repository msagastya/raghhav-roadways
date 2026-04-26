export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F1] via-[#EDF5EE] to-[#EEF3F0] dark:from-[#060D0A] dark:via-[#0A1510] dark:to-[#060D0A]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500 dark:text-white/60">Loading...</p>
      </div>
    </div>
  );
}
