import { useEffect, useState } from 'react';
import { adminApi, authApi } from '../services/api';
import { useNavigation } from '../App';
import UniversitiesTab from '../components/admin/UniversitiesTab';

const TABS = ['Students', 'Landlords', 'Listings', 'Universities', 'Support', 'Audit log'];

// Admin panel at /admin. Sign in with an admin account; every change is audited.
export default function AdminPanel() {
  const { navigate } = useNavigation();
  const [me, setMe] = useState(undefined); // undefined = still checking
  const [tab, setTab] = useState('Students');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) return setMe(null);
    authApi.me().then((d) => setMe(d.user)).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <div className="p-10 text-center text-text-secondary">Checking your access…</div>;
  if (!me || me.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="font-display mb-2 text-2xl font-extrabold text-text-primary">Admin panel</h1>
        <p className="mb-4 text-sm text-text-secondary">Sign in with an admin account to continue.</p>
        <button onClick={() => navigate('auth')} className="rounded-xl bg-brand-primaryDark px-5 py-2.5 text-sm font-bold text-white">
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="font-display mb-4 text-2xl font-extrabold text-text-primary">Admin panel</h1>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === t ? 'bg-brand-primaryDark text-white' : 'border border-border text-text-secondary'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {error && <p className="mb-3 text-sm text-error dark:text-red-400">{error}</p>}
      {tab === 'Students' && <UsersTab key="student" role="student" setError={setError} />}
      {tab === 'Landlords' && <UsersTab key="landlord" role="landlord" setError={setError} />}
      {tab === 'Listings' && <ListingsTab setError={setError} />}
      {tab === 'Universities' && <UniversitiesTab setError={setError} />}
      {tab === 'Support' && <SupportTab setError={setError} />}
      {tab === 'Audit log' && <AuditTab />}
    </div>
  );
}

const cell = 'border-b border-border px-3 py-2 text-sm text-text-primary align-top';
const btn = 'rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-secondary';
const danger = 'rounded-lg border border-error/40 px-2.5 py-1 text-xs font-bold text-error';

// One table for students or landlords: search, create, edit, delete.
function UsersTab({ role, setError }) {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const label = role === 'landlord' ? 'landlord' : 'student';
  const load = () => adminApi.users(q, role).then((d) => setUsers(d.users)).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault();
    await adminApi
      .createUser({ ...form, role })
      .then(() => {
        setForm({ fullName: '', email: '', password: '', phone: '' });
        load();
      })
      .catch((err) => setError(err.message));
  };

  const edit = async (u) => {
    const name = window.prompt('Full name', u.full_name);
    if (name === null) return;
    const role = window.prompt('Role: student, landlord or admin', u.role);
    if (role === null) return;
    await adminApi.updateUser(u.id, { full_name: name, role }).then(load).catch((e) => setError(e.message));
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.email}? Their listings and payments are removed too.`)) return;
    await adminApi.deleteUser(u.id).then(load).catch((e) => setError(e.message));
  };

  return (
    <div>
      <form onSubmit={create} className="mb-4 grid gap-2 rounded-xl border border-border bg-bg-surface p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-bold text-text-primary">Add a {label}</div>
        <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary" />
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary" />
        <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary password (8+ characters)" className="rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary" />
        <button type="submit" className="sm:col-span-2 rounded-lg bg-brand-primaryDark py-2 text-sm font-bold text-white">Create {label}</button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-3 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email"
          className="flex-1 rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary"
        />
        <button className={btn}>Search</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className={cell}>Name</th>
              <th className={cell}>Email</th>
              <th className={cell}>Role</th>
              <th className={cell}>Verified</th>
              <th className={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className={cell}>{u.full_name}</td>
                <td className={cell}>{u.email}</td>
                <td className={cell}>{u.role}</td>
                <td className={cell}>{u.is_verified ? 'Yes' : 'No'}</td>
                <td className={cell}>
                  <div className="flex gap-2">
                    <button className={btn} onClick={() => edit(u)}>Edit</button>
                    <button className={danger} onClick={() => remove(u)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListingsTab({ setError }) {
  const { navigate } = useNavigation();
  const [items, setItems] = useState([]);
  const load = () => adminApi.listings().then((d) => setItems(d.listings)).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = async (a) => {
    const price = window.prompt('Price per month (USD)', a.price_per_month);
    if (price === null) return;
    const status = window.prompt('Status: draft, pending, active, rented or rejected', a.status);
    if (status === null) return;
    await adminApi.updateListing(a.id, { price_per_month: Number(price), status }).then(load).catch((e) => setError(e.message));
  };
  const clearFlag = async (a) => {
    await adminApi.updateListing(a.id, { needs_review: false }).then(load).catch((e) => setError(e.message));
  };
  const remove = async (a) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    await adminApi.deleteListing(a.id).then(load).catch((e) => setError(e.message));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className={cell}>Title</th>
            <th className={cell}>Landlord</th>
            <th className={cell}>Campus</th>
            <th className={cell}>Price</th>
            <th className={cell}>Status</th>
            <th className={cell}>Flagged</th>
            <th className={cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td className={cell}>{a.title}</td>
              <td className={cell}>{a.landlord_email}</td>
              <td className={cell}>{a.campus || '—'}</td>
              <td className={cell}>${a.price_per_month}</td>
              <td className={cell}>{a.status}</td>
              <td className={cell}>{a.needs_review ? 'Yes' : 'No'}</td>
              <td className={cell}>
                <div className="flex flex-wrap gap-2">
                  <button className={btn} onClick={() => navigate('property-details', { id: a.id })}>View</button>
                  <button className={btn} onClick={() => edit(a)}>Edit</button>
                  {a.needs_review && <button className={btn} onClick={() => clearFlag(a)}>Clear flag</button>}
                  <button className={danger} onClick={() => remove(a)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupportTab({ setError }) {
  const [items, setItems] = useState([]);
  const [replies, setReplies] = useState({});
  const load = () => adminApi.support().then((d) => setItems(d.messages)).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (id) => {
    const text = replies[id];
    if (!text) return;
    await adminApi
      .reply(id, text)
      .then(() => {
        setReplies((r) => ({ ...r, [id]: '' }));
        load();
      })
      .catch((e) => setError(e.message));
  };

  if (items.length === 0) return <p className="text-sm text-text-secondary">No help messages yet.</p>;
  return (
    <div className="grid gap-3">
      {items.map((m) => (
        <div key={m.id} className="rounded-xl border border-border bg-bg-surface p-4">
          <div className="mb-1 text-xs text-text-secondary">
            {new Date(m.created_at).toLocaleString()} · {m.contact || 'no contact given'} · {m.status}
          </div>
          <p className="mb-3 text-sm text-text-primary">{m.body}</p>
          {m.admin_reply && <p className="mb-3 rounded-lg bg-bg-surface-alt p-3 text-sm text-text-secondary">Reply: {m.admin_reply}</p>}
          <div className="flex gap-2">
            <input
              value={replies[m.id] || ''}
              onChange={(e) => setReplies((r) => ({ ...r, [m.id]: e.target.value }))}
              placeholder="Write a reply"
              className="flex-1 rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary"
            />
            <button className={btn} onClick={() => send(m.id)}>Reply</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditTab() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    adminApi.audit().then((d) => setEntries(d.entries)).catch(() => {});
  }, []);
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className={cell}>When</th>
            <th className={cell}>Admin</th>
            <th className={cell}>Action</th>
            <th className={cell}>Target</th>
            <th className={cell}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td className={cell}>{new Date(e.created_at).toLocaleString()}</td>
              <td className={cell}>{e.admin_email}</td>
              <td className={cell}>{e.action}</td>
              <td className={cell}>{e.target}</td>
              <td className={cell}>{e.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
