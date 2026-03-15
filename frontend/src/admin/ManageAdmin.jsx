import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getInitial = (u = '') => u.charAt(0).toUpperCase();

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════════════════════ */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-6 py-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="h-7 w-14 bg-gray-200 rounded-lg" />
        <div className="h-7 w-14 bg-gray-200 rounded-lg" />
      </div>
    </td>
  </tr>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL — shared for Create + Edit + Change Password
═══════════════════════════════════════════════════════════════════════════ */
const Modal = ({ mode, target, onClose, onSave, saving }) => {
  /* mode: 'create' | 'edit' | 'password' */
  const [username, setUsername]   = useState(target?.username ?? '');
  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPw,   setShowPw]     = useState(false);
  const [formErr,  setFormErr]    = useState('');

  const inputCls = `w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400
    transition-colors bg-white`;

  const titles = {
    create:   'Create Admin',
    edit:     'Edit Admin',
    password: 'Change Password',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErr('');

    if (mode === 'create') {
      if (!username.trim())    { setFormErr('Username is required.'); return; }
      if (username.trim().length < 3) { setFormErr('Username must be at least 3 characters.'); return; }
      if (!password)           { setFormErr('Password is required.'); return; }
      if (password.length < 6) { setFormErr('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setFormErr('Passwords do not match.'); return; }
      onSave({ username: username.trim(), password });
    }

    if (mode === 'edit') {
      if (!username.trim())    { setFormErr('Username is required.'); return; }
      if (username.trim().length < 3) { setFormErr('Username must be at least 3 characters.'); return; }
      onSave({ username: username.trim() });
    }

    if (mode === 'password') {
      if (!password)           { setFormErr('New password is required.'); return; }
      if (password.length < 6) { setFormErr('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setFormErr('Passwords do not match.'); return; }
      onSave({ password });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{titles[mode]}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors"
          >×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {formErr && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {formErr}
            </p>
          )}

          {/* Username — shown in create + edit */}
          {(mode === 'create' || mode === 'edit') && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john_doe"
                autoComplete="off"
                className={inputCls}
              />
            </div>
          )}

          {/* Password — shown in create + password */}
          {(mode === 'create' || mode === 'password') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  {mode === 'password' ? 'New Password' : 'Password'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                               hover:text-gray-700 text-xs font-medium transition-colors"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={inputCls}
                />
                {/* Live match indicator */}
                {confirm.length > 0 && (
                  <p className={`text-xs mt-1 ${password === confirm ? 'text-green-600' : 'text-red-500'}`}>
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Hint for edit mode */}
          {mode === 'edit' && (
            <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              To change the password, use the <span className="font-semibold">Change Password</span> action instead.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                         rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
            >Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50
                         disabled:cursor-not-allowed text-white rounded-xl py-2.5
                         text-sm font-semibold transition-colors shadow-sm"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : mode === 'password' ? 'Update Password' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE CONFIRM
═══════════════════════════════════════════════════════════════════════════ */
const DeleteConfirm = ({ username, onCancel, onConfirm, deleting }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">Delete "{username}"?</h3>
      <p className="text-gray-500 text-sm mb-6">
        This admin account will be permanently removed and cannot be recovered.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                     rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
        >Cancel</button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50
                     disabled:cursor-not-allowed text-white rounded-xl py-2.5
                     text-sm font-semibold transition-colors shadow-sm"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const ManageAdmins = () => {
  const [admins, setAdmins]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [search, setSearch]             = useState('');

  // modal state: null | { mode: 'create'|'edit'|'password', target?: admin }
  const [modal, setModal]               = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch ── */
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/admin/`, { headers: authHeaders });
      const data = await res.json();
      if (res.status === 403) throw new Error('Access denied — super-admin only.');
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch admins');
      const raw = data.data;
      setAdmins(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, []);

  /* ── create ── */
  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/admin`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create admin');
      // Re-fetch to get the newly created admin with its _id
      await fetchAdmins();
      setModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── update (username or password) ── */
  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/admin`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ id: modal.target._id, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to update admin');
      setAdmins((prev) =>
        prev.map((a) => a._id === modal.target._id ? { ...a, ...payload } : a)
      );
      setModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/admin`, {
        method: 'DELETE',
        headers: authHeaders,
        body: JSON.stringify({ id: deleteTarget._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to delete admin');
      setAdmins((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── filtered ── */
  const visible = admins.filter((a) =>
    !search || a.username?.toLowerCase().includes(search.toLowerCase())
  );

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Accounts</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Super-admin only — manage who can access this dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAdmins}
            className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                       px-4 py-2.5 rounded-lg text-sm transition-all"
          >↻ Refresh</button>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md
                       transition flex items-center gap-2 font-medium text-sm"
          >+ New Admin</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-gray-800">{admins.length}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Total Admins</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-red-600">1</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Super Admin</p>
        </div>
      </div>

      {/* Access denied / error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex items-center justify-between">
          <span>{error}</span>
          {!error.includes('Access denied') && (
            <button onClick={fetchAdmins} className="text-sm underline ml-4">Retry</button>
          )}
        </div>
      )}

      {/* Search */}
      <input
        placeholder="Search by username…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                   px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-56 transition-colors"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Admin', 'Created', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider
                      ${h === 'Actions' ? 'text-center' : 'text-left'}`}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-14 text-center text-gray-400 italic">
                    {admins.length === 0
                      ? 'No admin accounts found.'
                      : 'No admins match your search.'}
                  </td>
                </tr>
              ) : (
                visible.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors">

                    {/* Admin identity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700
                                        flex items-center justify-center text-white text-sm font-bold
                                        flex-shrink-0 shadow-sm">
                          {getInitial(admin.username)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{admin.username}</p>
                          <p className="text-xs text-gray-400 font-mono">{admin._id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fmtDate(admin.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModal({ mode: 'edit', target: admin })}
                          className="text-xs border border-amber-300 text-amber-600 hover:bg-amber-50
                                     rounded-lg px-3 py-1.5 font-medium transition-all"
                        >Edit</button>
                        <button
                          onClick={() => setModal({ mode: 'password', target: admin })}
                          className="text-xs border border-blue-300 text-blue-600 hover:bg-blue-50
                                     rounded-lg px-3 py-1.5 font-medium transition-all"
                        >Password</button>
                        <button
                          onClick={() => setDeleteTarget(admin)}
                          className="text-xs border border-red-300 text-red-500 hover:bg-red-50
                                     rounded-lg px-3 py-1.5 font-medium transition-all"
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 font-mono">
              Showing {visible.length} of {admins.length} admins
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal && (
        <Modal
          mode={modal.mode}
          target={modal.target}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'create' ? handleCreate : handleUpdate}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          username={deleteTarget.username}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default ManageAdmins;