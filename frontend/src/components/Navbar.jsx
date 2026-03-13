import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FiMenu, FiX } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

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
    setIsMobileMenuOpen(false); // Close mobile menu when an item is clicked
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

    if (item === 'Contact') {
        navigate('/contact');
        return;
    }

    if (item === 'Appointment') {
        navigate('/appointment');
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
    <>
      <nav ref={navRef} className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 py-6 transition-all duration-300 ${isScrolled ? 'bg-[#3E2F26]/90 backdrop-blur-md h-20 shadow-lg' : 'bg-transparent h-24'}`}>
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 text-white font-serif text-xl sm:text-2xl font-bold tracking-wide cursor-pointer z-50 relative">
          <span className="text-3xl">✝</span> {/* Placeholder Icon */}
          <h1 className="text-lg sm:text-2xl hidden sm:block">Resurrection Baptist Church</h1>
          <h1 className="text-xl sm:hidden font-bold tracking-wider">RBC</h1>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`hidden md:flex px-8 py-3 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/10' : 'bg-white/20 backdrop-blur-sm border border-white/30'}`}>
          <ul className="flex gap-8 text-white font-serif text-lg font-medium">
            {['Home', 'About', 'Ministries', 'Sermons', 'Choir', 'Contact', 'Appointment'].map((item) => (
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
        
        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center z-50 relative">
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
             className="text-white text-3xl focus:outline-none transition-transform duration-300 active:scale-90"
             aria-label="Toggle menu"
           >
             <div className={`transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isMobileMenuOpen ? <FiX /> : <FiMenu />}
             </div>
           </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-[#3E2F26] transition-all duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none"></div>
        <div className={`flex flex-col items-center justify-center h-full w-full transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-8'}`}>
          <ul className="flex flex-col gap-8 text-white font-serif text-2xl font-medium text-center w-full px-6">
            {['Home', 'About', 'Ministries', 'Sermons', 'Choir', 'Contact', 'Appointment'].map((item, index) => (
              <li 
                key={item} 
                className={`transform transition-all duration-500 ease-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                style={{ transitionDelay: `${isMobileMenuOpen ? index * 75 + 150 : 0}ms` }}
              >
                <a 
                  href={`#${item.toLowerCase()}`} 
                  onClick={(e) => handleNavClick(e, item)}
                  className="block hover:text-brand-beige active:text-brand-beige active:scale-95 transition-all duration-200 py-3 w-full"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
