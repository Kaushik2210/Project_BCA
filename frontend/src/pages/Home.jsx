import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Schedule from '../components/Schedule';
import Ministries from '../components/Ministries';
import Sermons from '../components/Sermons';
import Footer from '../components/Footer';

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
