import React from 'react';
// Importing section components that make up the Home page
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Schedule from '../components/Schedule.jsx';
import Ministries from '../components/Ministries.jsx';
import Sermons from '../components/Sermons.jsx';
import Footer from '../components/Footer.jsx';

// Home component serves as the main layout wrapper for the landing page
function Home() {
  return (
    <>
      {/* Navbar: Sticky animated top navigation, handles routing and smooth scrolling */}
      <Navbar />
      
      {/* Hero: The top full-screen section with parallax background and headline */}
      <Hero />
      
      {/* Schedule: Fetches and displays upcoming church events */}
      <Schedule />
      
      {/* Ministries: Grid display of various church ministries */}
      <Ministries />
      
      {/* Sermons: Fetches and displays recent sermons/audio */}
      <Sermons />
      
      {/* Footer: Persistant bottom section with links and copyright */}
      <Footer />
    </>
  );
}

export default Home;
