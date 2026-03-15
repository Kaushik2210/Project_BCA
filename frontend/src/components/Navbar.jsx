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
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const servicesLinks = [
    { name: 'Announcements', path: '/announcements' },
    { name: 'Prayer Request', path: '/prayer' },
    { name: 'Appointment', path: '/appointment' }
  ];

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
        if (location.pathname === '/sermons') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/sermons');
        }
        return;
    }

    if (item === 'Ministries') {
        if (location.pathname === '/ministries') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/ministries');
        }
        return;
    }

    if (item === 'About') {
        if (location.pathname === '/about') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/about');
        }
        return;
    }

    if (item === 'Choir') {
        if (location.pathname === '/choir') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/choir');
        }
        return;
    }

    if (item === 'Contact') {
        if (location.pathname === '/contact') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/contact');
        }
        return;
    }

    if (item === 'Appointment') {
        if (location.pathname === '/appointment') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/appointment');
        }
        return;
    }

    if (item === 'Prayer Request') {
        if (location.pathname === '/prayer') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/prayer');
        }
        return;
    }

    if (item === 'Announcements') {
        if (location.pathname === '/announcements') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/announcements');
        }
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
        <div className={`hidden md:flex flex-wrap items-center justify-center gap-4 px-8 py-3 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/10' : 'bg-white/20 backdrop-blur-sm border border-white/30'}`}>
          <ul className="flex flex-wrap gap-4 lg:gap-8 text-white font-serif text-sm lg:text-lg font-medium justify-center items-center">
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

            {/* Services Dropdown */}
            <li 
              className="relative group py-2"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className="flex items-center hover:text-brand-beige transition-colors duration-200 relative">
                Services
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-beige transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`absolute left-0 mt-2 w-48 rounded-md shadow-xl bg-[#3E2F26]/95 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-200 origin-top-left ${isServicesOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
              >
                <ul className="py-2">
                  {servicesLinks.map((service) => (
                    <li key={service.name}>
                        <a 
                          href={service.path}
                          onClick={(e) => handleNavClick(e, service.name)}
                          className="block px-4 py-3 text-sm text-white hover:bg-white/10 hover:text-brand-beige transition-colors duration-200"
                        >
                          {service.name}
                        </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, 'Contact')}
                  className="hover:text-brand-beige transition-colors duration-200 relative group"
                >
                  Contact
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-beige transition-all duration-300 group-hover:w-full"></span>
                </a>
            </li>
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
        <div className={`flex flex-col items-center justify-start h-full w-full transform transition-transform duration-500 ease-out overflow-y-auto pt-24 pb-8 px-6 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-8'}`}>
          <ul className="flex flex-col gap-6 text-white font-serif text-xl font-medium w-full">
            {['Home', 'About', 'Ministries', 'Sermons', 'Choir'].map((item, index) => (
              <li 
                key={item} 
                className={`transform transition-all duration-500 ease-out border-b border-white/10 pb-4 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                style={{ transitionDelay: `${isMobileMenuOpen ? (index + 1) * 75 : 0}ms` }}
              >
                <a 
                  href={`#${item.toLowerCase()}`} 
                  onClick={(e) => handleNavClick(e, item)}
                  className="block hover:text-brand-beige active:text-brand-beige transition-colors duration-200 w-full text-left"
                >
                  {item}
                </a>
              </li>
            ))}

            {/* Mobile Services Accordion */}
            <li 
              className={`transform transition-all duration-500 ease-out border-b border-white/10 pb-4 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
              style={{ transitionDelay: `${isMobileMenuOpen ? 6 * 75 : 0}ms` }}
            >
              <button 
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="flex items-center justify-between w-full hover:text-brand-beige active:text-brand-beige transition-colors duration-200 text-left cursor-pointer"
              >
                Services
                <svg className={`w-5 h-5 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isServicesOpen ? 'max-h-64 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <ul className="flex flex-col pl-6 border-l-2 border-[#c5a059]/30 space-y-4">
                  {servicesLinks.map((service, idx) => (
                     <li key={service.name}>
                        <a 
                          href={service.path}
                          onClick={(e) => handleNavClick(e, service.name)}
                          className={`block text-lg hover:text-brand-beige text-white/80 active:text-brand-beige transition-all duration-300 transform ${isServicesOpen ? 'translate-x-0' : '-translate-x-4'}`}
                          style={{ transitionDelay: `${isServicesOpen ? idx * 50 : 0}ms` }}
                        >
                          {service.name}
                        </a>
                     </li>
                  ))}
                </ul>
              </div>
            </li>


            <li 
                className={`transform transition-all duration-500 ease-out pb-4 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                style={{ transitionDelay: `${isMobileMenuOpen ? 7 * 75 : 0}ms` }}
              >
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, 'Contact')}
                  className="block hover:text-brand-beige active:text-brand-beige transition-colors duration-200 w-full text-left"
                >
                  Contact
                </a>
              </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
