import React, { useRef, useState, useEffect } from 'react';
import scheduleBg from '../assets/schedule-church-atmosphere.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const Schedule = () => {
  const container = useRef();
  
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${backendURL}/api/v1/schedule`);
        const data = await res.json();
        if (res.ok) {
          setDays(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  useGSAP(() => {
    // Parallax background movement
    gsap.to(".schedule-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    if (!loading && days.length > 0) {
      gsap.from(".schedule-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 70%",
        }
      });
    }

  }, { scope: container, dependencies: [days, loading] });

  return (
    <div ref={container} id="schedule" className="relative py-32 px-8 min-h-screen overflow-hidden">
      {/* New Atmospheric Background */}
      <div 
        className="schedule-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${scheduleBg})` }}
      >
        <div className="absolute inset-0 bg-[#1a1614]/80"></div> {/* Dark overlay for readability */}
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-[#c5a059] text-6xl md:text-8xl font-serif text-center mb-24 drop-shadow-2xl">
            Schedule
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#c5a059]"></div>
          </div>
        ) : days.length === 0 ? (
          <div className="text-center text-[#f0e6d2]/70 text-xl font-serif">
            No upcoming schedules.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {days.map((day, index) => (
              <div key={day._id || index} className="schedule-card bg-[#2c2520]/80 backdrop-blur-md border border-[#c5a059]/30 p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                <h3 className="text-[#f0e6d2] text-3xl font-serif mb-6 border-b border-[#c5a059]/30 pb-4">
                    {day.date}
                </h3>
                
                <div className="space-y-6">
                  {day.events && day.events.map((event, i) => (
                    <div key={event._id || i} className="group">
                      <p className="text-[#c5a059] text-sm font-bold tracking-widest mb-1 group-hover:drop-shadow-md transition-all">{event.time}</p>
                      <p className="text-[#f0e6d2] text-xl font-serif">{event.title}</p>
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
