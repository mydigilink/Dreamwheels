'use client';
import { useSaved } from './SavedProvider';
import { HeartIcon } from '../Icons';

/** Heart toggle for vehicles and parts. `variant="overlay"` sits on a card image; "button" is a full button. */
export default function SaveButton({ type, id, title, variant = 'overlay' }) {
  const saved = useSaved();
  if (!saved) return null;
  const on = saved.has(type, id);
  const label = on ? `Remove ${title || 'item'} from saved` : `Save ${title || 'item'}`;

  if (variant === 'button')
    return (
      <button type="button" className={`btn block save-btn${on ? ' on' : ''}`} onClick={() => saved.toggle(type, id)} aria-pressed={on}>
        <HeartIcon /> {on ? 'Saved' : 'Save for later'}
      </button>
    );

  return (
    <button type="button" className={`save-fab${on ? ' on' : ''}`} onClick={() => saved.toggle(type, id)} aria-pressed={on} aria-label={label} title={on ? 'Saved' : 'Save'}>
      <HeartIcon />
    </button>
  );
}
