import React, { useState,useEffect } from 'react';
import ManageSermons        from './ManageSermons';
import ManageChoirSchedule  from './ManageChoirSchedule';
import ManageAppointments   from './ManageAppointments';
import ManageBlogPosts from "./ManageBlogPosts.jsx";
import ManagePrayers from "./ManagePrayers.jsx";
import ManageSchedule from "./ManageSchedule.jsx";
import ManageContacts from "./ManageContacts.jsx";
import ManageNewsletter from "./ManageNewsletter.jsx";
import ManageAdmins from "./ManageAdmin.jsx";
import { getToken,removeToken } from "../utils/auth.js";
import { useNavigate } from 'react-router';

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
 
/* ── decode role from JWT payload ── */
const getRole = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
};
 
const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('sermons');
  const navigate = useNavigate();
 
  /* Redirect if token has expired mid-session */
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();
      if (!token) { navigate('/admin', { replace: true }); return; }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 <= Date.now()) {
          removeToken();
          navigate('/admin', { replace: true });
        }
      } catch {
        removeToken();
        navigate('/admin', { replace: true });
      }
    }, 60_000); // check every 60s
    return () => clearInterval(interval);
  }, [navigate]);
 
  const handleLogout = () => {
    removeToken();
    navigate('/admin', { replace: true });
  };
 
  const role = getRole();
 
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
 
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-linear-to-b from-brand-red to-red-800 text-white shadow-xl">
        <div className="p-6 border-b border-red-700">
          <h2 className="text-2xl font-bold tracking-tight">Resurrection Admin</h2>
          <p className="text-sm text-red-200 mt-1">Church Dashboard</p>
        </div>
 
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label }) => {
            /* Only super-admin can see Admin Accounts */
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
 
        {/* Session info */}
        <div className="px-6 py-4 border-t border-red-700 text-xs text-red-300 space-y-1">
          {role && (
            <p className="flex items-center gap-1.5">
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
 
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
 
        {/* Mobile header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-brand-red">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
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
 
        {/* Section content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeSection === 'sermons'      && <ManageSermons />}
          {activeSection === 'choir'        && <ManageChoirSchedule />}
          {activeSection === 'schedule'     && <ManageSchedule />}
          {activeSection === 'appointments' && <ManageAppointments />}
          {activeSection === 'blog'         && <ManageBlogPosts />}
          {activeSection === 'prayers'      && <ManagePrayers />}
          {activeSection === 'contacts'     && <ManageContacts />}
          {activeSection === 'newsletter'   && <ManageNewsletter />}
          {activeSection === 'admins'       && role === 'super-admin' && <ManageAdmins />}
        </main>
      </div>
    </div>
  );
};
 
export default AdminPage;
