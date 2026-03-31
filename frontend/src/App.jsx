// Import React and the useEffect hook for side effects.
import React, { useEffect } from 'react';

// Import React Router components for client-side routing without full page reloads.
// BrowserRouter: wraps the app, listens to browser URL changes
// Routes: container that holds all Route definitions
// Route: maps a URL path to a React component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ---- Import all Page components ----
import Home from './pages/Home.jsx';
import SermonsPage from './pages/SermonsPage.jsx';
import MinistriesPage from './pages/MinistriesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ChoirPage from './pages/ChoirPage.jsx';
import ContactPage from './pages/ContactPage';
import AppointmentPage from './pages/AppointmentPage';
import PrayerPage from './pages/PrayerPage.jsx';
import AnnouncementsPage from './pages/AnnouncementsPage.jsx';
import AnnouncementDetail from './pages/AnnouncementDetail.jsx';
import LoginPage from './pages/LoginPage.jsx';

// ---- Import Admin panel components ----
import AdminPage from './admin/AdminPage.jsx';
import ManageSermons from './admin/ManageSermons.jsx';
import ManageChoirSchedule from './admin/ManageChoirSchedule.jsx';
import ManageAppointments from './admin/ManageAppointments.jsx';
import ManageBlogPosts from "./admin/ManageBlogPosts.jsx";

// ---- Import route guard components ----
// PrivateRoute: redirects unauthenticated users to login page.
import PrivateRoute from './components/PrivateRoute.jsx';
// PublicRoute: redirects authenticated users away from login page.
import PublicRoute from './components/PublicRoute.jsx';
// ScrollToTop: automatically scrolls to the top on every route change.
import ScrollToTop from './components/ScrollToTop.jsx';

// Import Lenis — a smooth scrolling library that replaces the browser's native scroll behavior
// with a buttery-smooth, physics-based scrolling experience.
import Lenis from 'lenis';

// =========================================================================
// App Component — The root component that defines the entire application structure.
// =========================================================================
function App() {

  // Initialize Lenis smooth scrolling on component mount.
  useEffect(() => {
    // Create a new Lenis instance with custom scrolling parameters.
    const lenis = new Lenis({
      duration: 1.2,         // How long each scroll animation takes (in seconds)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // Custom easing curve for natural feel
      direction: 'vertical',       // Scroll direction
      gestureDirection: 'vertical', // Touch gesture direction
      smooth: true,                 // Enable smooth scrolling
      mouseMultiplier: 1,           // Mouse wheel scroll speed multiplier
      smoothTouch: false,           // Disable smooth scroll on touch devices (can feel laggy)
      touchMultiplier: 2,           // Touch scroll speed multiplier
    });

    // `raf` (requestAnimationFrame) function creates an infinite animation loop.
    // Lenis needs to update on every frame to calculate the smooth scroll position.
    function raf(time) {
      lenis.raf(time);              // Update Lenis with the current frame time
      requestAnimationFrame(raf);   // Request the next frame (creates the loop)
    }

    // Start the animation loop.
    requestAnimationFrame(raf);

    // Cleanup function: Runs when the component unmounts.
    // Destroys the Lenis instance to prevent memory leaks.
    return () => {
      lenis.destroy();
    };
  }, []); // Empty dependency array: runs only once on mount.

  return (
    // Main wrapper div with full width, minimum full screen height, and a beige background color.
    <div className="w-full min-h-screen bg-brand-beige overflow-x-hidden">
      {/* BrowserRouter enables client-side routing using the browser's History API. */}
      <Router>
        {/* ScrollToTop ensures every page starts at the top when navigated to. */}
        <ScrollToTop />
        {/* Routes container: React renders ONLY the first Route whose path matches the current URL. */}
        <Routes>
          {/* ── PUBLIC PAGES ── */}
          {/* These routes are accessible to everyone without authentication. */}
          <Route path="/"            element={<Home />} />
          <Route path="/sermons"     element={<SermonsPage />} />
          <Route path="/ministries"  element={<MinistriesPage />} />
          <Route path="/about"       element={<AboutPage />} />
          <Route path="/choir"       element={<ChoirPage />} />
          <Route path="/contact"     element={<ContactPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/prayer"      element={<PrayerPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          {/* Dynamic route: `:slug` is a URL parameter (e.g., /announcements/my-blog-post). */}
          <Route path="/announcements/:slug" element={<AnnouncementDetail />} />

          {/* ── ADMIN LOGIN ── */}
          {/* Wrapped in PublicRoute: if already logged in, redirects to dashboard instead. */}
          <Route
            path="/admin"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* ── PROTECTED ADMIN ROUTES ── */}
          {/* All wrapped in PrivateRoute: if NOT logged in, redirects to login page. */}
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
          <Route
            path="/admin/blog"
            element={
              <PrivateRoute>
                <ManageBlogPosts />
              </PrivateRoute>
            }
          />
        </Routes>
        
      </Router>
    </div>
  );
}

// Export the App component as the default export.
export default App;