import './globals.css'
import { Toaster } from 'react-hot-toast'
import RootProviders from '../components/providers/RootProviders'

export const metadata = {
  title: 'Raghhav Roadways - Command Center',
  description: 'Futuristic logistics management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100" suppressHydrationWarning>
        {/* Neon Backgrounds */}
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
        <div className="bg-glow2"></div>
        <div className="scan-line"></div>

        <RootProviders>
          {children}
        </RootProviders>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(4, 12, 24, 0.95)',
              color: '#00ff88',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(0,255,136,0.3)',
              boxShadow: '0 0 15px rgba(0,255,136,0.2)',
              fontWeight: '500',
              fontFamily: "'Space Grotesk', sans-serif"
            },
            success: {
              iconTheme: {
                primary: '#00ff88',
                secondary: '#030812',
              },
            },
            error: {
              style: {
                background: 'rgba(4, 12, 24, 0.95)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 0 15px rgba(239,68,68,0.2)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#030812',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
