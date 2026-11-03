import './admin.css';

export const metadata = {
  title: { default: 'DreamWheels Admin', template: '%s — DreamWheels Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="mac-root">{children}</div>;
}
