import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RippleOne — Mobile App Splash Screen & Launch Motion Studio',
  description: 'Visual studio for creating authentic animated mobile app launch screens, branded splash progressions, and kinetic logo reveals. Powered by AI.',
  keywords: ['RippleOne', 'mobile splash screen', 'app intro', 'animated logo', 'launch reveal', 'motion design'],
  authors: [{ name: 'RippleOne' }],
  openGraph: {
    title: 'RippleOne',
    description: 'Design authentic mobile app splash screens and launch animations with AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
