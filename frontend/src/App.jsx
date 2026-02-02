import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SermonsPage from './pages/SermonsPage';
import MinistriesPage from './pages/MinistriesPage';
import AboutPage from './pages/AboutPage';
import ChoirPage from './pages/ChoirPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
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
          <Route path="/" element={<Home />} />
          <Route path="/sermons" element={<SermonsPage />} />
          <Route path="/ministries" element={<MinistriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/choir" element={<ChoirPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
