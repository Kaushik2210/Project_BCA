// Import React hooks for state and side effects.
import React, { useState, useEffect } from 'react';
// Import all admin sub-page components — each manages a specific resource.
import ManageSermons        from './ManageSermons';
import ManageChoirSchedule  from './ManageChoirSchedule';
import ManageAppointments   from './ManageAppointments';
import ManageBlogPosts from "./ManageBlogPosts.jsx";
import ManagePrayers from "./ManagePrayers.jsx";
import ManageSchedule from "./ManageSchedule.jsx";
import ManageContacts from "./ManageContacts.jsx";
import ManageNewsletter from "./ManageNewsletter.jsx";
import ManageAdmins from "./ManageAdmin.jsx";
// Import auth utility functions for JWT token management.
import { getToken, removeToken } from "../utils/auth.js";
// Import useNavigate for programmatic routing (e.g., redirect after logout).
import { useNavigate } from 'react-router';

// =========================================================================
// NAV_ITEMS — Static array defining the sidebar navigation menu entries.
// Each item has a `key` (used for state matching) and a `label` (displayed text with emoji).
// =========================================================================
const NAV_ITEMS = [
  { key: 'sermons',      label: '📖 Sermons'          },
  { key: 'choir',        label: '🎤 Choir Schedule'    },
  { key: 'schedule',     label: '🗓️ Schedule'          },
  { key: 'appointments', label: '📅 Appointments'      },
  { key: 'blog',         label: '✍️ Blog Posts'        },
  { key: 'prayers',      label: '🙏 Prayer Requests'   },
  { key: 'contacts',     label: '✉️ Contact Messages'  },
  { key: 'newsletter',   label: '📧 Newsletter'        },
  { key: 'admins',       label: '🔐 Admin Accounts'    },
];
 
// =========================================================================
// getRole — Helper function to decode the admin's role from the JWT token.
// JWT tokens have 3 parts: header.payload.signature (separated by dots).
// We decode the payload (Base64) to read the `role` field (e.g., 'admin' or 'super-admin').
// =========================================================================
const getRole = () => {
  try {
    const token = getToken();
    if (!token) return null;
    // Split the JWT by '.', take the payload (index 1), decode from Base64.
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Use nullish coalescing (??) — returns null if payload.role is undefined.
    return payload.role ?? null;
  } catch {
    return null;
  }
};
 
// =========================================================================
// AdminPage — The main admin dashboard page with sidebar navigation.
// Acts as a "single-page app within an app" — the sidebar controls which
// management sub-page is displayed in the main content area.
// =========================================================================
const AdminPage = () => {
  // State to track which admin section is currently visible.
  const [activeSection, setActiveSection] = useState('sermons');
  const navigate = useNavigate();
 
  // useEffect: Periodically check if the JWT token has expired.
  // Runs a check every 60 seconds. If expired, removes token and redirects to login.
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();
      // If no token exists, redirect to login immediately.
      if (!token) { navigate('/admin', { replace: true }); return; }
      try {
        // Decode the token payload and check expiration.
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Compare expiration time (seconds) against current time (milliseconds).
        if (payload.exp * 1000 <= Date.now()) {
          removeToken();  // Clear the expired token.
          navigate('/admin', { replace: true }); // Redirect to login.
        }
      } catch {
        // If token is malformed, clear it and redirect.
        removeToken();
        navigate('/admin', { replace: true });
      }
    }, 60_000); // Check every 60 seconds.
    // Cleanup: Clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, [navigate]);
 
  // Logout handler — removes the JWT token and redirects to the login page.
  const handleLogout = () => {
    removeToken();
    navigate('/admin', { replace: true });
  };
 
  // Decode the current admin's role for conditional rendering.
  const role = getRole();
 
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
 
      {/* ── SIDEBAR (Desktop only) ── */}
      {/* Gradient background with brand-red to dark red. Hidden on mobile (md:flex). */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-linear-to-b from-brand-red to-red-800 text-white shadow-xl">
        {/* Sidebar Header / Branding */}
        <div className="p-6 border-b border-red-700">
          <h2 className="text-2xl font-bold tracking-tight">Resurrection Admin</h2>
          <p className="text-sm text-red-200 mt-1">Church Dashboard</p>
        </div>
 
        {/* Navigation Links — scrollable if too many items */}
        {/* data-lenis-prevent stops the Lenis smooth scroll library from interfering with this scrollable area */}
        <nav data-lenis-prevent className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label }) => {
            // RBAC: Only show the "Admin Accounts" button to super-admin users.
            if (key === 'admins' && role !== 'super-admin') return null;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3
                  ${activeSection === key
                    ? 'bg-white/20 text-white font-semibold'
                    : 'hover:bg-white/10 text-red-100'}
                  ${key === 'admins' ? 'mt-4 border-t border-red-700 pt-4' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </nav>
 
        {/* Session Info — shows current role and logout button */}
        <div className="px-6 py-4 border-t border-red-700 text-xs text-red-300 space-y-1">
          {role && (
            <p className="flex items-center gap-1.5">
              {/* Color-coded role indicator dot: yellow for super-admin, green for regular admin */}
              <span className={`w-1.5 h-1.5 rounded-full ${role === 'super-admin' ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <span className="capitalize font-medium">{role}</span>
            </p>
          )}
          <p>
            <button className="underline hover:text-white transition-colors" onClick={handleLogout}>
              Logout
            </button>
          </p>
        </div>
      </aside>
 
      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
 
        {/* Mobile Header — shown only on small screens (md:hidden) */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-brand-red">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Dropdown navigation for mobile — replaces the sidebar */}
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {NAV_ITEMS
                .filter(({ key }) => key !== 'admins' || role === 'super-admin')
                .map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
            </select>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 border border-red-300 px-3 py-2 rounded-lg
                         hover:bg-red-50 transition-all font-medium"
            >
              Logout
            </button>
          </div>
        </header>
 
        {/* Dynamic Content Area — renders the active admin sub-page based on activeSection state */}
        {/* data-lenis-prevent ensures smooth scrolling doesn't conflict with the scrollable admin panels */}
        <main data-lenis-prevent className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeSection === 'sermons'      && <ManageSermons />}
          {activeSection === 'choir'        && <ManageChoirSchedule />}
          {activeSection === 'schedule'     && <ManageSchedule />}
          {activeSection === 'appointments' && <ManageAppointments />}
          {activeSection === 'blog'         && <ManageBlogPosts />}
          {activeSection === 'prayers'      && <ManagePrayers />}
          {activeSection === 'contacts'     && <ManageContacts />}
          {activeSection === 'newsletter'   && <ManageNewsletter />}
          {/* Admin Accounts is double-gated: only renders if activeSection matches AND role is super-admin */}
          {activeSection === 'admins'       && role === 'super-admin' && <ManageAdmins />}
        </main>
      </div>
    </div>
  );
};
 
export default AdminPage;
