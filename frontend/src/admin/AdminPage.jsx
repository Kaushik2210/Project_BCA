import React, { useState } from 'react';
import ManageSermons        from './ManageSermons';
import ManageChoirSchedule  from './ManageChoirSchedule';
import ManageAppointments   from './ManageAppointments';
import ManageBlogPosts from "./ManageBlogPosts.jsx";
import ManagePrayers from "./ManagePrayers.jsx";
import ManageSchedule from "./ManageSchedule.jsx";

const NAV_ITEMS = [
  { key: 'sermons',      label: '📖 Sermons'        },
  { key: 'choir',        label: '🎤 Choir Schedule'  },
  { key: 'appointments', label: '📅 Appointments'    },
  { key: 'blog',         label: '📝 Blog Posts'      },
  {key:'prayer', label:'🙏 Prayer Requests'},
  {key:'event schedule',label:'📅 Event Schedule'},
];

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('sermons');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-gradient-to-b from-brand-red to-red-800 text-white shadow-xl">
        <div className="p-6 border-b border-red-700">
          <h2 className="text-2xl font-bold tracking-tight">Resurrection Admin</h2>
          <p className="text-sm text-red-200 mt-1">Church Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3
                ${activeSection === key
                  ? 'bg-white/20 text-white font-semibold'
                  : 'hover:bg-white/10 text-red-100'}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-red-700 text-sm text-red-200">
          Logged in •{' '}
          <button className="underline hover:text-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-brand-red">Admin Dashboard</h1>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {NAV_ITEMS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeSection === 'sermons'      && <ManageSermons />}
          {activeSection === 'choir'        && <ManageChoirSchedule />}
          {activeSection === 'appointments' && <ManageAppointments />}
          {activeSection==='blog' && <ManageBlogPosts/>}
          {activeSection==='prayer' && <ManagePrayers/>}
          {activeSection==='event schedule' && <ManageSchedule/>}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;