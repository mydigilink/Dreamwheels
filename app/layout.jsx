import './globals.css';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DreamWheels — Vintage Bikes, Vintage Scooters, Vintage Cars & Super Bikes for Sale',
    template: '%s | DreamWheels',
  },
  description:
    'Classic and vintage bikes, vintage scooters, vintage cars for sale and super bikes for sale — plus genuine vintage spare parts and expert restoration from DreamWheels.',
  applicationName: 'DreamWheels',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
