'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#060D0A] via-[#0A1510] to-[#060D0A]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)',
            top: '15%',
            left: '20%',
            animationDuration: '3s',
          }}
        />
        <div
          className="absolute rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, #16A34A 0%, transparent 70%)',
            bottom: '20%',
            right: '25%',
            animationDuration: '4s',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Logo + name */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Truck SVG logo */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
            style={{ background: '#22C55E', animationDuration: '2s' }}
          />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <svg width="64" height="64" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="30" width="44" height="28" rx="3" fill="#22C55E" />
              <rect x="49" y="37" width="26" height="21" rx="3" fill="#16A34A" />
              <rect x="52" y="39" width="12" height="9" rx="1" fill="#bbf7d0" />
              <circle cx="18" cy="61" r="7" fill="#111827" />
              <circle cx="18" cy="61" r="3.5" fill="#6b7280" />
              <circle cx="57" cy="61" r="7" fill="#111827" />
              <circle cx="57" cy="61" r="3.5" fill="#6b7280" />
              <rect x="0" y="67" width="80" height="2.5" rx="1.25" fill="#22C55E" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Company name */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-widest text-white">
            RAGHHAV
          </h1>
          <h1 className="text-3xl font-black tracking-widest text-[#22C55E] -mt-1">
            ROADWAYS
          </h1>
          <p className="text-xs text-white/40 tracking-[0.3em] mt-2 uppercase">
            Transport Management
          </p>
        </div>

        {/* Animated loader bar */}
        <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full"
            style={{
              animation: 'loadbar 1.6s ease-in-out infinite',
            }}
          />
        </div>

        <p className="text-white/30 text-xs tracking-widest uppercase">Loading…</p>
      </div>

      <style jsx>{`
        @keyframes loadbar {
          0%   { width: 0%; margin-left: 0%; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
