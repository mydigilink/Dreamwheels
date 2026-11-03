const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const WhatsAppIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.97L2 22l5.17-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.07.9.92-3-.2-.31a8.17 8.17 0 1 1 6.85 3.74Zm4.5-6.12c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43l-.75-1.82c-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03 4.74 4.74 0 0 0 1 2.52 10.85 10.85 0 0 0 4.16 3.67c1.55.67 2.15.73 2.93.61a2.5 2.5 0 0 0 1.64-1.16 2.03 2.03 0 0 0 .14-1.16c-.06-.1-.22-.16-.47-.28Z" />
  </svg>
);
export const CartIcon = (p) => (
  <svg {...base} {...p}><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>
);
export const MenuIcon = (p) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h10" /></svg>);
export const CloseIcon = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const SearchIcon = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const FilterIcon = (p) => (<svg {...base} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>);
export const MailIcon = (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const ChevronIcon = (p) => (<svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>);
export const EngineIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>);
export const WheelIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 3v7M12 14v7M3 12h7M14 12h7" /></svg>);
export const BodyIcon = (p) => (<svg {...base} {...p}><path d="M3 16v-3l2.5-5h13L21 13v3z" /><path d="M3 13h18" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>);
export const BoltIcon = (p) => (<svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>);
export const BrushIcon = (p) => (<svg {...base} {...p}><path d="m14 4 6 6-8.5 8.5-6-6z" /><path d="M5.5 12.5 3 21l8.5-2.5" /></svg>);
export const SeatIcon = (p) => (<svg {...base} {...p}><path d="M7 4h8a3 3 0 0 1 3 3v6H7z" /><path d="M4 13h16v3H4zM7 16v4M17 16v4" /></svg>);
export const TruckIcon = (p) => (<svg {...base} {...p}><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></svg>);
export const CashIcon = (p) => (<svg {...base} {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></svg>);
export const ReturnIcon = (p) => (<svg {...base} {...p}><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /></svg>);
export const ShieldIcon = (p) => (<svg {...base} {...p}><path d="M12 3 4 6v6c0 4.6 3.4 8 8 9 4.6-1 8-4.4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>);
export const ChatIcon = (p) => (<svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.7A8 8 0 1 1 21 12z" /></svg>);
export const WrenchIcon = (p) => (<svg {...base} {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z" /></svg>);
export const ClipboardIcon = (p) => (<svg {...base} {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 13l2 2 4-4" /></svg>);
export const HeartIcon = (p) => (<svg {...base} {...p}><path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.2 3.9 4 7.3 4c2 0 3.5 1.1 4.7 2.7C13.2 5.1 14.7 4 16.7 4c3.4 0 5.7 3.2 4.5 6.6C19.5 15.4 12 20 12 20z" /></svg>);
export const BoxIcon = (p) => (<svg {...base} {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>);
export const PinIcon = (p) => (<svg {...base} {...p}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const LockIcon = (p) => (<svg {...base} {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>);
export const InboxIcon = (p) => (<svg {...base} {...p}><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5 5h14l2 8v6H3v-6z" /></svg>);
export const GridIcon = (p) => (<svg {...base} {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
export const LogoutIcon = (p) => (<svg {...base} {...p}><path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3" /></svg>);
export const BikeIcon =(p) => (<svg {...base} {...p}><circle cx="5.5" cy="16.5" r="3.5" /><circle cx="18.5" cy="16.5" r="3.5" /><path d="M5.5 16.5 9 10h5l4.5 6.5M9 10 8 7H6M14 10l1-3h3" /></svg>);
export const ScooterIcon = (p) => (<svg {...base} {...p}><circle cx="6" cy="17.5" r="2.5" /><circle cx="18" cy="17.5" r="2.5" /><path d="M8.5 17.5h7M15 5h3l1 10M3.5 15V12h8l3 5.5" /></svg>);
export const CarIcon = (p) => (<svg {...base} {...p}><path d="M5 17H3v-5l2.5-5h13L21 12v5h-2M9 17h6M3 12h18" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>);
export const CameraIcon = (p) => (<svg {...base} {...p}><path d="M3 8h4l2-3h6l2 3h4v11H3z" /><circle cx="12" cy="13" r="3.5" /></svg>);
export const UserIcon =(p) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const ArrowIcon =(p) => (<svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
