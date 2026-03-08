import React, { useRef } from 'react';
import img1 from '../assets/ministry-1.jpeg';
import img2 from '../assets/ministry-2.jpeg';
import img3 from "../assets/ministry-3.jpeg"
import glassBg from '../assets/ministries-stained-glass.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from "react-router";

gsap.registerPlugin(ScrollTrigger);

const Ministries = () => {
  const container = useRef();
  const slider = useRef();
  const navigate = useNavigate();

  
  const people = [
    { name: 'JUDE CHOWRI', role: 'Youth Ministry Leader, Resurrection Baptist Church', img: img1 },
    { name: 'JONAH CHOWRI', role: 'Outreach Coordinator, Resurrection Baptist Church', img: img2 },
    { name: 'JONAH CHOWRI', role: 'Sunday School Director, Resurrection Baptist Church', img: img3 },
  ];

  useGSAP(() => {
    // Horizontal Scroll
    // Use a function to calculate width dynamically to handle image loading/resizing
    const getScrollAmount = () => {
        return slider.current.scrollWidth - window.innerWidth;
    };

  

    // Inner Parallax for Images
    gsap.utils.toArray(".ministry-img").forEach((img) => {
        gsap.fromTo(img, 
            { xPercent: -20 },
            { 
                xPercent: 20, 
                ease: "none",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top top",
                    end: () => `+=${getScrollAmount() + 500}`,
                    scrub: 1
                }
             }
        );
    });

  }, { scope: container });

  return (
    <div ref={container} id="ministries" className="bg-brand-beige overflow-hidden relative">
      <div 
         className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
         style={{ backgroundImage: `url(${glassBg})` }}
      ></div>

      {/* 
         Wrapper for the horizontal scroll area.
      */}
      <div className="h-screen w-full flex flex-col justify-center px-8 relative">
        
        {/* Massive Editorial Header */}
        <h2 className="text-transparent text-[12vw] font-serif font-black text-left mb-8 uppercase tracking-tighter absolute top-0 left-0 z-0 opacity-10 select-none pointer-events-none"
            style={{ WebkitTextStroke: '2px #c5a059' }}>
          Ministries
        </h2>
        
        <h2 className="text-brand-dark text-6xl md:text-8xl font-serif text-left mb-8 uppercase tracking-widest drop-shadow-2xl absolute top-10 left-8 z-10">
          Ministries
        </h2>

        {/* The Slider Container */}
        <div ref={slider} className="flex gap-12 w-fit pl-[10vw] relative z-20">
          
          {/* Intro Card */}
           <div className="flex flex-col justify-center min-w-75 md:min-w-112.5">
              <p className="text-brand-dark text-3xl font-serif leading-relaxed italic border-l-4 border-brand-red pl-6">
                  "Discover the vibrant community and the dedicated individuals serving at Resurrection Baptist Church."
              </p>
              <div className="text-left mt-12 pl-6">
                <button 
                  onClick={() => navigate('/ministries')}
                  className="text-brand-red text-xl font-bold uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-brand-red pb-2 hover:border-white"
                >
                  View All Ministries &rarr;
                </button>
              </div>
           </div>

          {people.map((person, index) => (
            <div key={index} className="ministry-card border border-brand-red/30 bg-black/20 backdrop-blur-md rounded-4xl p-8 flex flex-col items-center text-center w-[85vw] md:w-112.5 shrink-0 hover:bg-black/40 hover:border-brand-red hover:shadow-[0_0_40px_rgba(197,160,89,0.2)] transition-all duration-500 group relative overflow-hidden">
              
              {/* Inner Glow Gradient */}
              <div className="absolute inset-0 bg-linear-to-b from-brand-red/0 to-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="w-full aspect-4/5 mb-8 overflow-hidden rounded-2xl border border-brand-red/20 relative">
                 <div className="absolute inset-0 bg-brand-red] mix-blend-color opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                 <img src={person.img} alt={person.name} className="ministry-img  w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
              </div>

              <h3 className="text-brand-red text-3xl font-serif mb-4 uppercase tracking-widest group-hover:text-brand-dark transition-colors">{person.name}</h3>
              
              <p className="text-brand-dark/80 font-sans text-sm tracking-wide uppercase border-t border-brand-red/30 pt-4 w-full">
                {person.role}
              </p>
            </div>
          ))}

          {/* End Spacer */}
          <div className="w-[10vw] shrink-0"></div>
        </div>
      </div>
    </div>
  );
};


export default Ministries;
