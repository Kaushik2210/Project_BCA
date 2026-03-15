import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Schedule from '../components/Schedule.jsx';
import Ministries from '../components/Ministries.jsx';
import Sermons from '../components/Sermons.jsx';
import Footer from '../components/Footer.jsx';

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Schedule />
      <Ministries />
      <Sermons />
      <Footer />
    </>
  );
}

export default Home;
