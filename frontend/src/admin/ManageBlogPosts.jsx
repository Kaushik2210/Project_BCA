// Import React hooks for state management, lifecycle, and memoization.
import React, { useState, useEffect, useCallback } from 'react';
// Import ReactQuill — a React wrapper around the Quill.js rich text editor.
// Quill provides a WYSIWYG (What You See Is What You Get) editing experience.
import ReactQuill from 'react-quill-new';
// Import Quill's default "snow" theme CSS for the editor toolbar and formatting.
import 'react-quill-new/dist/quill.snow.css';
// Import auth utility to get the JWT token for authenticated API requests.
import { getToken } from "../utils/auth.js";

// Backend URL from Vite environment variables.
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =========================================================================
// ManageBlogPosts — Admin module for creating, editing, and publishing
// blog/announcement posts. Features:
//   - Rich text editor (Quill) with full formatting toolbar
//   - Draft/Published status management
//   - Cover image URL preview with error handling
//   - Category + tag management
//   - List/Create/Edit view toggles (single-page app pattern)
// =========================================================================

/* ─── QUILL CONFIG ────────────────────────────────────────────────────────── */
// QUILL_MODULES: Controls which toolbar buttons are available in the editor.
// Organized as arrays of arrays — each inner array creates a toolbar group.
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ align: [] }],
    ['clean'],
  ],
};

// QUILL_FORMATS: Whitelist of formatting types the editor will accept.
// If a format isn't listed here, Quill will strip it out when pasting content.
const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image', 'align',
];

/* ─── CONSTANTS ───────────────────────────────────────────────────────────── */
// Predefined blog post categories — used in the category dropdown select.
const CATEGORIES = [
  'Sermon Notes',
  'Devotional',
  'Announcement',
  'Event Recap',
  'Ministry Update',
  'Prayer & Worship',
  'Community',
  'Other',
];

// EMPTY_FORM: Default form state used when creating a new post or resetting.
const EMPTY_FORM = {
  title: '',
  category: CATEGORIES[0],
  author: '',
  excerpt: '',
  coverImage: '',
  tags: '',
  content: '',
  status: 'draft',
};

/* ─── SMALL COMPONENTS ────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = status === 'published'
    ? 'bg-green-100 text-green-700 border border-green-300'
    : 'bg-amber-100 text-amber-700 border border-amber-300';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-full mt-2" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = `w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400
  transition-colors bg-white`;

const selectCls = `${inputCls} cursor-pointer`;

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const ManageBlogPosts = () => {
  // View state: toggles between 'list' (default), 'create', and 'edit'.
  // This is the "single-page app" pattern — no routing needed.
  const [view, setView]           = useState('list');
  // Array of blog post objects fetched from the backend.
  const [posts, setPosts]         = useState([]);
  // Loading and error states for the initial fetch.
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  // Saving state — disables buttons during create/update API calls.
  const [saving, setSaving]       = useState(false);
  // The post currently being edited (null when creating a new post).
  const [editingPost, setEditingPost] = useState(null);
  // The form data object — tracks all input field values.
  const [form, setForm]           = useState(EMPTY_FORM);
  // ID of the post pending deletion (used for the confirm modal).
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  // Filter/search state for the list view.
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  // Tracks if the cover image URL failed to load a preview.
  const [coverPreviewError, setCoverPreviewError] = useState(false);

  const token = getToken();
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch posts ── */
  // Fetches all blog posts (including drafts) from the admin-only endpoint.
  // useCallback ensures the function reference is stable (prevents unnecessary re-renders).
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/blogs/admin/all`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Failed to load posts');
      setPosts(data.data?.blogs ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, []);

  /* ── form helpers ── */
  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingPost(null);
    setCoverPreviewError(false);
    setView('create');
  };

  const openEdit = (post) => {
    setForm({
      title:       post.title       ?? '',
      category:    post.category    ?? CATEGORIES[0],
      author:      post.author      ?? '',
      excerpt:     post.excerpt     ?? '',
      coverImage:  post.coverImage  ?? '',
      tags:        Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags ?? ''),
      content:     post.content     ?? '',
      status:      post.status      ?? 'draft',
    });
    setEditingPost(post);
    setCoverPreviewError(false);
    setView('edit');
  };

  const cancelForm = () => {
    setView('list');
    setEditingPost(null);
    setForm(EMPTY_FORM);
  };

  /* ── save (create or update) ── */
  // handleSave: Validates form data and sends a POST (create) or PUT (update) request.
  // `publishNow` param overrides the status to 'published' when the "Publish Now" button is clicked.
  const handleSave = async (publishNow = false) => {
    const tTitle = form.title.trim();
    const tContent = form.content.trim();
    const tAuthor = form.author?.trim() || '';
    const tExcerpt = form.excerpt?.trim() || '';
    const tTags = form.tags?.trim() || '';
    const tCover = form.coverImage?.trim() || '';

    if (!tTitle) return alert('Title is required.');
    if (tTitle.length < 5 || tTitle.length > 100) return alert('Title must be between 5 and 100 characters.');
    if (!tContent || tContent === '<p><br></p>') return alert('Content is required.');
    
    if (tAuthor && tAuthor.length > 50) return alert('Author name cannot exceed 50 characters.');
    if (tExcerpt && tExcerpt.length > 300) return alert('Excerpt cannot exceed 300 characters.');
    if (tTags && tTags.length > 100) return alert('Tags cannot exceed 100 total characters.');
    if (tCover && tCover.length > 500) return alert('Cover image URL cannot exceed 500 characters.');

    const payload = {
      ...form,
      title: tTitle,
      author: tAuthor,
      excerpt: tExcerpt,
      coverImage: tCover,
      tags: tTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: publishNow ? 'published' : form.status,
    };

    setSaving(true);
    try {
      const isEdit = Boolean(editingPost);
      const url    = isEdit
        ? `${backendURL}/api/v1/blogs/${editingPost._id}`
        : `${backendURL}/api/v1/blogs`;
      const res  = await fetch(url, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Save failed');

      const saved = data.data;
      if (isEdit) {
        setPosts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
      }
      setView('list');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  // Sends a DELETE request and removes the post from local state (optimistic UI update).
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendURL}/api/v1/blogs/${id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Delete failed');
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ── filtered list ── */
  // Client-side filtering: applies status, category, and search filters to the posts array.
  // This runs on every render, filtering the full list without additional API calls.
  const visiblePosts = posts.filter((p) => {
    const matchStatus   = filterStatus   === 'all' || p.status   === filterStatus;
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch   = !q
      || p.title.toLowerCase().includes(q)
      || (p.author ?? '').toLowerCase().includes(q)
      || (p.excerpt ?? '').toLowerCase().includes(q);
    return matchStatus && matchCategory && matchSearch;
  });

  const fmtDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  /* ════════════════════════════════════════════════════════════════════════
     LIST VIEW
  ════════════════════════════════════════════════════════════════════════ */
  const renderList = () => (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Blog Posts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Write and publish articles for your community</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md
                     transition flex items-center gap-2 font-medium text-sm whitespace-nowrap"
        >
          + New Post
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: posts.length,                                        cls: 'text-gray-800'  },
          { label: 'Published', value: posts.filter((p) => p.status === 'published').length, cls: 'text-green-600' },
          { label: 'Drafts',    value: posts.filter((p) => p.status === 'draft').length,    cls: 'text-amber-600' },
          { label: 'Categories',value: new Set(posts.map((p) => p.category)).size,          cls: 'text-blue-600'  },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPosts} className="text-sm underline ml-4">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search title, author, excerpt…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                     px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-56 transition-colors"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg text-gray-700 px-3 py-2 text-sm
                     focus:outline-none focus:border-red-400 cursor-pointer transition-colors bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-lg text-gray-700 px-3 py-2 text-sm
                     focus:outline-none focus:border-red-400 cursor-pointer transition-colors bg-white"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={fetchPosts}
          className="border border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700
                     rounded-lg px-3.5 py-2 text-sm transition-all ml-auto"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Post cards */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-base font-medium">No posts found</p>
          <p className="text-sm mt-1">
            {posts.length === 0 ? 'Create your first blog post!' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visiblePosts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md
                         transition-shadow flex gap-4"
            >
              {/* Cover thumbnail */}
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      {post.author && (
                        <span className="text-xs text-gray-400">by {post.author}</span>
                      )}
                      {post.createdAt && (
                        <span className="text-xs text-gray-400">{fmtDate(post.createdAt)}</span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                    )}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(post)}
                      className="text-amber-600 hover:text-amber-900 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setDeleteConfirm(post._id)}
                      className="text-red-500 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <p className="text-xs text-gray-400 font-mono">
          Showing {visiblePosts.length} of {posts.length} posts
        </p>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     CREATE / EDIT FORM VIEW
  ════════════════════════════════════════════════════════════════════════ */
  const renderForm = () => (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {view === 'edit' ? 'Edit Post' : 'New Post'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {view === 'edit' ? `Editing "${editingPost?.title}"` : 'Write and publish a new blog post'}
          </p>
        </div>
        <button
          onClick={cancelForm}
          className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                     px-4 py-2 rounded-lg text-sm transition-all"
        >
          ← Back to Posts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main editor column ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <FormField label="Post Title" required>
              <input
                className={`${inputCls} text-lg font-medium ${form.title.length > 0 && form.title.trim().length < 5 ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter a compelling title…"
                maxLength="100"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
              />
              <div className="flex justify-between mt-1 px-1">
                {form.title.length > 0 && form.title.trim().length < 5 ? (
                  <span className="text-[10px] text-red-500">Minimum 5 characters required</span>
                ) : <span></span>}
                <span className={`text-[10px] ${form.title.length >= 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.title.length}/100
                </span>
              </div>
            </FormField>
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <FormField label="Excerpt">
              <textarea
                rows={3}
                className={inputCls + ' resize-none'}
                placeholder="A short summary shown in post listings…"
                maxLength="300"
                value={form.excerpt}
                onChange={(e) => setField('excerpt', e.target.value)}
              />
              <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-gray-400">Recommended length</span>
                <span className={`text-[10px] ${(form.excerpt?.length || 0) >= 300 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.excerpt?.length || 0}/300
                </span>
              </div>
            </FormField>
          </div>

          {/* Quill Editor */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Content <span className="text-red-500">*</span>
              </p>
            </div>
            <div className="quill-wrapper">
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(val) => setField('content', val)}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Write your post content here…"
              />
            </div>
          </div>
        </div>

        {/* ── Sidebar meta column ── */}
        <div className="flex flex-col gap-5">

          {/* Publish panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Publish
            </p>

            <FormField label="Status">
              <select
                className={selectCls}
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </FormField>

            <div className="flex flex-col gap-2 mt-4">
              <button
                disabled={saving}
                onClick={() => handleSave(true)}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                           text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {saving ? 'Saving…' : '🚀 Publish Now'}
              </button>
              <button
                disabled={saving}
                onClick={() => handleSave(false)}
                className="w-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
                           text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : '💾 Save Draft'}
              </button>
              <button
                disabled={saving}
                onClick={cancelForm}
                className="w-full text-gray-400 hover:text-gray-600 py-2 rounded-lg text-sm transition-colors"
              >
                Discard
              </button>
            </div>
          </div>

          {/* Category & Author */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</p>

            <FormField label="Category">
              <select
                className={selectCls}
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="Author">
              <input
                className={inputCls}
                placeholder="Author name"
                maxLength="50"
                value={form.author}
                onChange={(e) => setField('author', e.target.value)}
              />
              <div className="flex justify-end mt-1 px-1">
                <span className={`text-[10px] ${(form.author?.length || 0) >= 50 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.author?.length || 0}/50
                </span>
              </div>
            </FormField>

            <FormField label="Tags">
              <input
                className={inputCls}
                placeholder="faith, prayer, community"
                maxLength="100"
                value={form.tags}
                onChange={(e) => setField('tags', e.target.value)}
              />
              <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-gray-400">Comma-separated</span>
                <span className={`text-[10px] ${(form.tags?.length || 0) >= 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.tags?.length || 0}/100
                </span>
              </div>
            </FormField>
          </div>

          {/* Cover image */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Cover Image</p>

            <FormField label="Image URL">
              <input
                className={inputCls}
                placeholder="https://example.com/image.jpg"
                maxLength="500"
                value={form.coverImage}
                onChange={(e) => {
                  setField('coverImage', e.target.value);
                  setCoverPreviewError(false);
                }}
              />
              <div className="flex justify-end mt-1 px-1">
                <span className={`text-[10px] ${(form.coverImage?.length || 0) >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.coverImage?.length || 0}/500
                </span>
              </div>
            </FormField>

            {form.coverImage && !coverPreviewError && (
              <div className="relative">
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="w-full h-36 object-cover rounded-lg border border-gray-200"
                  onError={() => setCoverPreviewError(true)}
                />
                <button
                  onClick={() => { setField('coverImage', ''); setCoverPreviewError(false); }}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600
                             hover:text-red-600 rounded-full w-6 h-6 flex items-center justify-center
                             text-sm shadow transition-colors"
                >
                  ×
                </button>
              </div>
            )}
            {coverPreviewError && (
              <p className="text-xs text-red-500">Could not load image preview.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     DELETE CONFIRM MODAL
  ════════════════════════════════════════════════════════════════════════ */
  const renderDeleteModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Post?</h3>
        <p className="text-gray-500 text-sm mb-6">
          This action cannot be undone. The post will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                       rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5
                       text-sm font-semibold transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  /* ── root render ── */
  return (
    <>
      {/* Quill theme overrides — keeps toolbar consistent with the admin's light palette */}
      <style>{`
        .quill-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 16px;
          background: #f9fafb;
        }
        .quill-wrapper .ql-container.ql-snow {
          border: none;
          font-size: 15px;
          font-family: Georgia, 'Times New Roman', serif;
        }
        .quill-wrapper .ql-editor {
          min-height: 360px;
          padding: 20px;
          line-height: 1.75;
          color: #1f2937;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          font-family: inherit;
        }
        .quill-wrapper .ql-editor h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; }
        .quill-wrapper .ql-editor h2 { font-size: 1.5rem;   font-weight: 700; margin-bottom: 0.5rem; }
        .quill-wrapper .ql-editor h3 { font-size: 1.25rem;  font-weight: 600; margin-bottom: 0.5rem; }
        .quill-wrapper .ql-editor blockquote {
          border-left: 4px solid #dc2626;
          padding-left: 1rem;
          color: #4b5563;
          font-style: italic;
          margin: 1rem 0;
        }
        .quill-wrapper .ql-snow .ql-picker-label:hover,
        .quill-wrapper .ql-snow .ql-picker-item:hover,
        .quill-wrapper .ql-snow button:hover .ql-stroke,
        .quill-wrapper .ql-snow button.ql-active .ql-stroke { stroke: #dc2626 !important; }
        .quill-wrapper .ql-snow button:hover .ql-fill,
        .quill-wrapper .ql-snow button.ql-active .ql-fill  { fill: #dc2626  !important; }
        .quill-wrapper .ql-snow .ql-picker-label:hover     { color: #dc2626 !important; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {(view === 'list') && renderList()}
      {(view === 'create' || view === 'edit') && renderForm()}
      {deleteConfirm && renderDeleteModal()}
    </>
  );
};

export default ManageBlogPosts;