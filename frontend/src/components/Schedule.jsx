import React, { useRef } from 'react';
import scheduleBg from '../assets/schedule-church-atmosphere.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Schedule = () => {
  const container = useRef();
  
  const days = [
    {
      date: 'MARCH 8',
      events: [
        { time: '10:00 am', title: 'Sunday Service' },
        { time: '11:30 am', title: 'Prayer' },
        { time: '12:00 pm', title: 'Theology Class' },
      ],
    },
    {
      date: 'MARCH 11',
      events: [
        { time: '7:00 Pm', title: 'Prayer' },
        { time: '7:30 Pm', title: 'Bible Study' },
        { time: '8:30 pm', title: 'Fellowship' },
      ],
    },
    {
      date: 'MARCH 14',
      events: [
        { time: '8:00 am', title: 'Prayer(Online)' },
        { time: '6:30 pm', title: 'Guest Speaker' },
      ],
    },
  ];

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

    // Cards Float Up Effect
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

  }, { scope: container });

  return (
    <div ref={container} id="schedule" className="relative py-32 px-8 min-h-screen overflow-hidden">
      {/* New Atmospheric Background */}
      <div 
        className="schedule-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${scheduleBg})` }}
      >
        <div className="absolute inset-0 bg-brand-beige/70"></div> {/* Dark overlay for readability */}
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-brand-red text-6xl md:text-8xl font-serif text-center mb-24 drop-shadow-2xl">
            Schedule
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {days.map((day, index) => (
            <div key={index} className="schedule-card bg-brand-beige/80 backdrop-blur-sm border border-brand-red/40 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-500">
              <h3 className="text-brand-dark text-3xl font-serif mb-6 border-b border-brand-red/30 pb-4">
                  {day.date}
              </h3>
              
              <div className="space-y-6">
                {day.events.map((event, i) => (
                  <div key={i} className="group">
                    <p className="text-brand-red text-sm font-bold tracking-widest mb-1 opacity-80 group-hover:opacity-100 transition-opacity">{event.time}</p>
                    <p className="text-brand-dark text-xl font-serif">{event.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
