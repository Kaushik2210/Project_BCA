import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useGSAP(() => {
    const showNav = gsap.fromTo(navRef.current, {
      yPercent: -100,
      paused: true,
      duration: 0.2
    }, {
      yPercent: 0,
      duration: 0.2,
      ease: "power1.inOut",
      paused: true
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: 99999,
      onUpdate: (self) => {
          self.direction === -1 ? showNav.play() : showNav.reverse();
          setIsScrolled(self.scroll() > 50);
      }
    });
    
  }, { scope: navRef });

  const handleNavClick = (e, item) => {
    e.preventDefault();
    const targetId = item.toLowerCase();

    if (item === 'Sermons') {
        navigate('/sermons');
        return;
    }

    if (item === 'Ministries') {
        navigate('/ministries');
        return;
    }

    if (item === 'About') {
        navigate('/about');
        return;
    }

    if (item === 'Choir') {
        navigate('/choir');
        return;
    }

    if (item === 'Home') {
        if (location.pathname !== '/') {
            navigate('/');
        } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
    }
    
    // For other sections (Contact, etc.)
    if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: targetId } });
    } else {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 transition-all duration-300 ${isScrolled ? 'bg-[#3E2F26]/90 backdrop-blur-md h-20 shadow-lg' : 'bg-transparent h-24'}`}>
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2 text-white font-serif text-xl sm:text-2xl font-bold tracking-wide cursor-pointer">
        <span className="text-3xl">✝</span> {/* Placeholder Icon */}
        <h1>Resurrection Baptist Church</h1>
      </Link>

      {/* Navigation Links */}
      <div className={`hidden md:flex px-8 py-3 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/10' : 'bg-white/20 backdrop-blur-sm border border-white/30'}`}>
        <ul className="flex gap-8 text-white font-serif text-lg font-medium">
          {['Home', 'About', 'Ministries', 'Sermons', 'Choir'].map((item) => (
            <li key={item}>
              <a 
                href={`#${item.toLowerCase()}`} 
                onClick={(e) => handleNavClick(e, item)}
                className="hover:text-brand-beige transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-beige transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Mobile Menu Placeholder */}
      <div className="md:hidden text-white">
         {/* Hamburger or similar would go here */}
      </div>
    </nav>
  );
};

export default Navbar;
