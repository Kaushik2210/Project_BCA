import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import choirBg from '../assets/schedule-church-atmosphere.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ChoirPage = () => {
  const container = useRef();
  const calendarCard = useRef();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(1);
  const [easterEggCount, setEasterEggCount] = useState(0);

  const [events, setEvents] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // -------------------- FETCH EVENTS FROM BACKEND --------------------
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/choir`);
      if (!res.ok) throw new Error('Failed to fetch choir events');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // -------------------- CALENDAR LOGIC --------------------
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (delta, e) => {
    if (e) e.stopPropagation();
    setDirection(delta);
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + delta, 1));
  };

  useGSAP(() => {
    gsap.fromTo(
      '.calendar-cell',
      { y: direction * 50, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: { amount: 0.3, grid: [7, 5], from: direction > 0 ? 'start' : 'end' },
        ease: 'elastic.out(1, 0.5)',
      }
    );
  }, { scope: container, dependencies: [currentDate, events] });

  // -------------------- 3D TILT --------------------
  useEffect(() => {
    const card = calendarCard.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;

      gsap.to(card, { rotateX, rotateY, duration: 0.5, ease: 'power2.out', transformPerspective: 1000 });
    };

    const handleMouseLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // -------------------- EASTER EGG --------------------
  const triggerEasterEgg = () => {
    if (easterEggCount + 1 >= 5) {
      gsap.to('.calendar-cell', {
        rotation: () => Math.random() * 360,
        scale: () => Math.random() * 1.5 + 0.5,
        x: () => (Math.random() - 0.5) * 500,
        y: () => (Math.random() - 0.5) * 500,
        duration: 1,
        stagger: 0.01,
        ease: 'power4.in',
        yoyo: true,
        repeat: 1,
      });
      setEasterEggCount(0);
    } else {
      setEasterEggCount((prev) => prev + 1);
      gsap.to('.header-title', {
        scale: 1.1,
        color: '#ff0000',
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.to('.header-title', { color: '#c5a059', scale: 1 }),
      });
    }
  };

  // -------------------- RENDER CALENDAR --------------------
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-brand-red/10 bg-white/5 opacity-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = events.find((e) => e.day === day && e.month === currentDate.getMonth());
      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`calendar-cell h-24 md:h-32 border border-brand-red/20 p-2 relative transition-all duration-300 hover:z-10 cursor-pointer group hover:bg-brand-red/20
            ${isSelected ? 'bg-brand-red/20 shadow-[inset_0_0_20px_rgba(197,160,89,0.2)]' : 'bg-transparent'}
            ${isToday ? 'border-brand-red' : ''}`}
        >
          <span className={`text-sm font-bold font-mono ${isToday ? 'text-brand-red' : 'text-brand-dark/50'}`}>{day}</span>

          {hasEvent && (
            <div
              className={`mt-2 text-xs md:text-sm p-1 md:p-2 rounded-lg font-bold truncate transition-transform group-hover:scale-110 group-hover:-rotate-2
              ${hasEvent.type === 'event' ? 'bg-brand-red text-brand-beige shadow-[0_0_15px_#c5a059]' : 'bg-brand-dark text-brand-beige opacity-80'}`}
            >
              {hasEvent.title}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
      <Navbar />
      <div ref={container} className="bg-brand-beige text-brand-dark min-h-screen relative overflow-hidden perspective-[2000px]">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url(${choirBg})` }}
        ></div>

        <div className="pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-brand-red/30 pb-8 select-none">
            <div onClick={triggerEasterEgg} className="cursor-pointer">
              <h1 className="header-title text-5xl md:text-7xl font-serif text-brand-red mb-4 transition-colors">Choir Schedule</h1>
              <p className="text-xl text-brand-dark/70 italic">
                "Sing to the Lord a new song." {easterEggCount > 0 && <span className="text-xs text-red-500 ml-2">({5 - easterEggCount} clicks...)</span>}
              </p>
            </div>
          </div>

          {/* Calendar Interface */}
          <div ref={calendarCard} className="bg-brand-beige/50 backdrop-blur-xl border border-brand-red/20 rounded-3xl overflow-hidden shadow-2xl will-change-transform">
            <div className="flex justify-between items-center p-8 bg-brand-red/5 border-b border-brand-red/20 relative z-50">
              <button onClick={(e) => changeMonth(-1, e)} className="w-12 h-12 rounded-full border border-brand-red/30 flex items-center justify-center hover:bg-brand-red hover:text-brand-beige transition-all active:scale-90 cursor-pointer text-xl pb-1">&larr;</button>
              <h2 className="text-3xl font-serif font-bold text-brand-dark">
                {monthNames[currentDate.getMonth()]} <span className="text-brand-red">{currentDate.getFullYear()}</span>
              </h2>
              <button onClick={(e) => changeMonth(1, e)} className="w-12 h-12 rounded-full border border-brand-red/30 flex items-center justify-center hover:bg-brand-red hover:text-brand-beige transition-all active:scale-90 cursor-pointer text-xl pb-1">&rarr;</button>
            </div>

            <div className="grid grid-cols-7 border-b border-brand-red/20 bg-brand-beige">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-bold uppercase tracking-widest text-brand-red text-xs md:text-sm">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-brand-beige overflow-hidden">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="mt-12 p-8 border-t border-brand-red/20">
            <h3 className="text-2xl font-serif text-brand-red mb-4">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {events.find((e) => e.day === selectedDate.getDate() && e.month === selectedDate.getMonth()) ? (
              <div className="bg-brand-red/10 p-6 rounded-xl border-l-4 text-brand-red animate-pulse">
                <h4 className="text-xl font-bold text-brand-dark mb-2">{events.find((e) => e.day === selectedDate.getDate() && e.month === selectedDate.getMonth()).title}</h4>
                <p className="text-brand-red font-mono">{events.find((e) => e.day === selectedDate.getDate() && e.month === selectedDate.getMonth()).time}</p>
              </div>
            ) : (
              <p className="text-brand-dark/40 italic">No events scheduled for this day.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChoirPage;
