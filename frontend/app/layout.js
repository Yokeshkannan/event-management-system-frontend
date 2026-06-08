import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EventHub — Event Management Platform',
  description: 'Discover, create, and manage events. Book tickets for concerts, conferences, workshops, and more.',
  keywords: 'events, tickets, booking, concerts, conferences, workshops',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
