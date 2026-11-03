'use client';
import { usePathname } from 'next/navigation';
import WhatsAppButton from '../WhatsAppButton';
import { generalMessage } from '@/lib/whatsapp';
import { absUrl } from '@/lib/site';

/** Site-wide floating WhatsApp button. Detail pages render their own contextual sticky bar instead. */
export default function WaFloat({ number }) {
  const pathname = usePathname();
  const url = absUrl(pathname);
  return (
    <WhatsAppButton
      number={number}
      className="wa-float"
      iconOnly
      message={generalMessage({ url, source: 'Website' })}
      lead={{ module: 'Website', itemName: 'General enquiry', category: '', pageUrl: url }}
    />
  );
}
