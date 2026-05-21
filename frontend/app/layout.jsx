import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'MediCare — Medicine Reminder System',
  description: 'Medicine reminder and verification system for patients and caregivers.',
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
              duration: 3500,
              style: {
                fontSize: '0.95rem',
                borderRadius: '6px',
                padding: '12px 16px',
                fontFamily: 'var(--font-inter)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
