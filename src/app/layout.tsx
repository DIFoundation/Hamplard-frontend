import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: { default: 'Hamplard', template: '%s | Hamplard' },
  description: 'Learn practical skills — tailoring, makeup, baking, photography and more. Africa\'s online vocational skills platform.',
  metadataBase: new URL('https://hamplard.app'),
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Skip navigation — first focusable element for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-hamplard-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
