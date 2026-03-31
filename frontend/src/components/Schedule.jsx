import React, { useRef, useState, useEffect } from 'react';
import scheduleBg from '../assets/schedule-church-atmosphere.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Safely access backend URL from environment variables, fallback for local dev
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const Schedule = () => {
  // Reference for scoping GSAP animations
  const container = useRef();
  
  // Local state to store the schedule data and loading status
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data natively from express backend upon component mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${backendURL}/api/v1/schedule`);
        const data = await res.json();
        if (res.ok) {
          setDays(data.data); // Update state with the days array when successful
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false); // Make sure we stop loading whether it succeeds or fails
      }
    };

    fetchSchedule();
  }, []); // Empty dependency array ensures this runs exactly once on mount

  useGSAP(() => {
    // Background Parallax movement
    // Moves the background image up slightly slower than the scroll speed
    gsap.to(".schedule-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "bottom top",
        scrub: true // ties animation to scrollbar
      }
    });

    // Only run the card reveal animation if we've finished loading and actually have days to show
    if (!loading && days.length > 0) {
      // Refresh ScrollTrigger to recalculate exact trigger start/end heights since content height changed
      ScrollTrigger.refresh();

      // Card Fade-up animation
      gsap.fromTo(".schedule-card", 
        { 
          y: 80, 
          opacity: 0 // Starting state: further down and invisible
        },
        {
          y: 0,
          opacity: 1, // End state: normal position and fully visible
          duration: 1.2,
          stagger: 0.15, // Delay each card by 0.15s for ripple effect
          ease: "power3.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 85%", // Starts animating when the top of the container hits 85% of view height
            toggleActions: "play none none reverse", // Play going down, reverse going up
          }
        }
      );
    } // the dependency array below ensures the useGSAP hook re-runs its effects if `days` or `loading` change
  }, { scope: container, dependencies: [days, loading] });

  return (
    <div ref={container} id="schedule" className="relative py-32 px-8 min-h-screen overflow-hidden">
      {/* New Atmospheric Background */}
      <div 
        className="schedule-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${scheduleBg})` }}
      >
        <div className="absolute inset-0 bg-black/70"></div> {/* Dark overlay for readability */}
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-amber-500 text-6xl md:text-8xl font-serif text-center mb-24 drop-shadow-2xl">
            Schedule
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
          </div>
        ) : days.length === 0 ? (
          <div className="text-center text-white/70 text-xl font-serif">
            No upcoming schedules.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {days.map((day, index) => (
              <div key={day._id || index} className="schedule-card bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                <h3 className="text-white text-3xl font-serif mb-6 border-b border-amber-500/30 pb-4">
                    {day.date}
                </h3>
                
                <div className="space-y-6">
                  {day.events && day.events.map((event, i) => (
                    <div key={event._id || i} className="group">
                      <p className="schedule-time text-amber-400 text-sm font-bold tracking-widest mb-1 shadow-black group-hover:drop-shadow-md transition-all">{event.time}</p>
                      <p className="schedule-title text-white text-xl font-serif">{event.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
