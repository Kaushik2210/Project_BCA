// Import React hooks for state, refs, and side effects.
import React, { useState, useRef, useEffect } from 'react';
// Import shared layout components.
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// Import background image for the decorative overlay.
import choirBg from '../assets/schedule-church-atmosphere.png';
// Import GSAP for calendar cell animations.
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// =========================================================================
// ChoirPage — An interactive calendar page that displays choir events.
// Features: Custom calendar grid, GSAP cell animations, event display,
// month navigation, and a fun easter egg interaction.
// =========================================================================
const ChoirPage = () => {
  // Ref for GSAP animation scoping and cleanup.
  const container = useRef();
  // Ref for the calendar card element (used for potential 3D tilt effects).
  const calendarCard = useRef();

  // State: The currently displayed month/year in the calendar.
  const [currentDate, setCurrentDate] = useState(new Date());
  // State: The user-selected date (highlights the cell and shows event details below).
  const [selectedDate, setSelectedDate] = useState(new Date());
  // State: Direction of month navigation (+1 = forward, -1 = backward). Used for animation direction.
  const [direction, setDirection] = useState(1);
  // State: Counter for the easter egg interaction (5 clicks triggers it).
  const [easterEggCount, setEasterEggCount] = useState(0);

  // State: Choir events fetched from the backend API.
  const [events, setEvents] = useState([]);
  // Backend URL from environment variables.
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // ── Fetch Choir Events from Backend ──
  // Called on component mount to populate the calendar with events.
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

  // Fetch events once on component mount.
  useEffect(() => {
    fetchEvents();
  }, []);

  // ── Calendar Utility Functions ──
  // getDaysInMonth: Returns the number of days in the given month.
  // Trick: Creating a Date with day=0 of the NEXT month returns the last day of the current month.
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  // getFirstDayOfMonth: Returns the weekday index (0=Sun, 6=Sat) of the 1st day of the month.
  // This determines how many empty "spacer" cells we need before the first day.
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // ── Month Navigation Handler ──
  // delta: +1 for next month, -1 for previous month.
  // e.stopPropagation() prevents the click from bubbling up to parent elements.
  const changeMonth = (delta, e) => {
    if (e) e.stopPropagation();
    setDirection(delta);  // Store direction for GSAP animation.
    // Create a new Date from the current month + delta.
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + delta, 1));
  };

  // ── GSAP Calendar Cell Animation ──
  // Runs whenever the currentDate or events change (triggered by month navigation).
  // Each cell slides in with a spring-like elastic ease.
  useGSAP(() => {
    gsap.fromTo(
      '.calendar-cell',
      { y: direction * 50, opacity: 0, scale: 0.8 },    // Start: offset, invisible, smaller
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        // `stagger.grid` creates a wave-like reveal across the 7-column calendar grid.
        stagger: { amount: 0.3, grid: [7, 5], from: direction > 0 ? 'start' : 'end' },
        ease: 'elastic.out(1, 0.5)',    // Bouncy spring effect.
      }
    );
  }, { scope: container, dependencies: [currentDate, events] });

  // ── Easter Egg Interaction ──
  // Clicking the "Choir Schedule" title 5 times triggers a chaotic GSAP animation
  // that scatters all calendar cells randomly, then returns them.
  const triggerEasterEgg = () => {
    if (easterEggCount + 1 >= 5) {
      // After 5 clicks: Scatter all calendar cells randomly.
      gsap.to('.calendar-cell', {
        rotation: () => Math.random() * 360,
        scale: () => Math.random() * 1.5 + 0.5,
        x: () => (Math.random() - 0.5) * 500,
        y: () => (Math.random() - 0.5) * 500,
        duration: 1,
        stagger: 0.01,
        ease: 'power4.in',
        yoyo: true,     // Reverse the animation back to original positions.
        repeat: 1,       // Play forward, then backward (total: 2 plays).
      });
      setEasterEggCount(0); // Reset counter.
    } else {
      // Before 5 clicks: Flash the title red with a quick scale pulse.
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

  // ── Render Calendar Day Cells ──
  // Builds an array of JSX elements for the calendar grid.
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty spacer cells for days before the 1st of the month.
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-brand-red/10 bg-white/5 opacity-50"></div>);
    }

    // Add a cell for each day of the month.
    for (let day = 1; day <= daysInMonth; day++) {
      // Check if any event matches this day and month.
      const hasEvent = events.find((e) => e.day === day && e.month === currentDate.getMonth());
      // Check if this day is currently selected.
      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
      // Check if this day is today's date.
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
          {/* Day number */}
          <span className={`text-sm font-bold font-mono ${isToday ? 'text-brand-red' : 'text-brand-dark/50'}`}>{day}</span>

          {/* Event badge — styled differently for 'event' vs 'practice' types */}
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

  // Month names array for display.
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
      <Navbar />
      <div ref={container} className="bg-brand-beige text-brand-dark min-h-screen relative overflow-hidden perspective-[2000px]">
        {/* Decorative background overlay — fixed, low opacity, non-interactive */}
        <div
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url(${choirBg})` }}
        ></div>

        <div className="pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto relative z-10">
          {/* ── Page Header with Easter Egg Trigger ── */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-brand-red/30 pb-8 select-none">
            <div onClick={triggerEasterEgg} className="cursor-pointer">
              <h1 className="header-title text-5xl md:text-7xl font-serif text-brand-red mb-4 transition-colors">Choir Schedule</h1>
              <p className="text-xl text-brand-dark/70 italic">
                "Sing to the Lord a new song." {easterEggCount > 0 && <span className="text-xs text-red-500 ml-2">({5 - easterEggCount} clicks...)</span>}
              </p>
            </div>
          </div>

          {/* ── Calendar Interface ── */}
          <div ref={calendarCard} className="bg-brand-beige/50 backdrop-blur-xl border border-brand-red/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Month Navigation Bar */}
            <div className="flex justify-between items-center p-6 md:p-8 bg-brand-red/5 border-b border-brand-red/20 relative z-50">
              {/* Previous Month Button */}
              <button 
                onClick={(e) => changeMonth(-1, e)} 
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-brand-beige/50 hover:bg-brand-red text-brand-red hover:text-brand-beige transition-all active:scale-90 cursor-pointer text-2xl md:text-3xl shadow-sm hover:shadow-md"
              >
                &larr;
              </button>
              
              {/* Current Month & Year Display */}
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark text-center select-none">
                {monthNames[currentDate.getMonth()]} <span className="text-brand-red">{currentDate.getFullYear()}</span>
              </h2>
              
              {/* Next Month Button */}
              <button 
                onClick={(e) => changeMonth(1, e)} 
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-brand-beige/50 hover:bg-brand-red text-brand-red hover:text-brand-beige transition-all active:scale-90 cursor-pointer text-2xl md:text-3xl shadow-sm hover:shadow-md"
              >
                &rarr;
              </button>
            </div>

            {/* Weekday Headers (Sun–Sat) */}
            <div className="grid grid-cols-7 border-b border-brand-red/20 bg-brand-beige">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-bold uppercase tracking-widest text-brand-red text-xs md:text-sm">{day}</div>
              ))}
            </div>

            {/* Calendar Day Grid — dynamically generated */}
            <div className="grid grid-cols-7 bg-brand-beige overflow-hidden">
              {renderCalendarDays()}
            </div>
          </div>

          {/* ── Selected Day Details Panel ── */}
          {/* Shows the event details for the currently selected date */}
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
