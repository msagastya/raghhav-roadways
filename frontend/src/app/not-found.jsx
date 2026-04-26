import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F1] via-[#EDF5EE] to-[#EEF3F0] dark:from-[#060D0A] dark:via-[#0A1510] dark:to-[#060D0A] p-6">
      <div className="max-w-md w-full rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/6 dark:border-white/8 p-8 text-center shadow-xl">
        <div className="text-7xl font-black text-primary-500 mb-4">404</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/60 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
