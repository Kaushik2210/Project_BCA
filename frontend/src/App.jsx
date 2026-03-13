import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import SermonsPage from './pages/SermonsPage.jsx';
import MinistriesPage from './pages/MinistriesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ChoirPage from './pages/ChoirPage.jsx';
import ContactPage from './pages/ContactPage';
import AppointmentPage from './pages/AppointmentPage';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './admin/AdminPage.jsx';
import ManageSermons from './admin/ManageSermons.jsx';
import ManageChoirSchedule from './admin/ManageChoirSchedule.jsx';
import ManageAppointments from './admin/ManageAppointments.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Lenis from 'lenis';

function App() {

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-brand-beige overflow-x-hidden">
      <Router>
        <Routes>
          {/* ── Public pages ── */}
          <Route path="/"            element={<Home />} />
          <Route path="/sermons"     element={<SermonsPage />} />
          <Route path="/ministries"  element={<MinistriesPage />} />
          <Route path="/about"       element={<AboutPage />} />
          <Route path="/choir"       element={<ChoirPage />} />
          <Route path="/contact"     element={<ContactPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />

          {/* ── Admin login ── */}
          <Route
            path="/admin"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* ── Protected admin routes ── */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sermons"
            element={
              <PrivateRoute>
                <ManageSermons />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/choir"
            element={
              <PrivateRoute>
                <ManageChoirSchedule />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <PrivateRoute>
                <ManageAppointments />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;