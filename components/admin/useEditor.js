'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useSaveShortcut } from './ui';
import { useShell } from './AdminShell';

/** Load / edit / save / delete one record. `id === 'new'` starts from `blank`. */
export function useEditor(collection, id, blank, basePath) {
  const router = useRouter();
  const shell = useShell();
  const isNew = id === 'new';
  const [form, setForm] = useState(isNew ? blank : null);
  const [saved, setSaved] = useState(isNew ? null : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api(`/api/admin/${collection}/${id}/`)
      .then((r) => {
        setForm(r);
        setSaved(JSON.stringify(r));
      })
      .catch((e) => shell.notify(e.message, 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, id, isNew]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v && v.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v }));
  const dirty = form && JSON.stringify(form) !== saved;

  async function save(extra = {}) {
    if (!form || saving) return;
    setSaving(true);
    try {
      const body = { ...form, ...extra };
      const r = isNew ? await api(`/api/admin/${collection}/`, { method: 'POST', body }) : await api(`/api/admin/${collection}/${id}/`, { method: 'PUT', body });
      setForm(r);
      setSaved(JSON.stringify(r));
      shell.notify('Saved');
      if (isNew) router.replace(`${basePath}${r.id}/`);
      router.refresh();
    } catch (e) {
      shell.notify(e.message, 'err');
    }
    setSaving(false);
  }

  async function remove(label = 'this item') {
    if (!(await shell.confirm({ title: `Delete ${label}?`, message: 'This cannot be undone. Its public URL will stop working.', confirm: 'Delete', danger: true, icon: '🗑' }))) return;
    try {
      await api(`/api/admin/${collection}/${id}/`, { method: 'DELETE' });
      shell.notify('Deleted');
      router.replace(basePath);
      router.refresh();
    } catch (e) {
      shell.notify(e.message, 'err');
    }
  }

  useSaveShortcut(() => save());
  return { form, setForm, set, save, remove, saving, dirty, isNew };
}
