import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'MediCare – Medicine Reminder & Verification',
  description:
    'AI-powered medicine reminder system for elderly patients. Get reminders, verify medicines with camera, and keep family informed.',
  keywords: 'medicine reminder, elderly care, medication tracker, AI verification',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '1rem',
                borderRadius: '8px',
                padding: '14px 18px',
                fontFamily: 'var(--font-inter)',
              },
              success: { style: { background: '#1a3a2a', color: '#fff', border: '1px solid #2d6a4f' } },
              error: { style: { background: '#3a1a1a', color: '#fff', border: '1px solid #9b2226' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
