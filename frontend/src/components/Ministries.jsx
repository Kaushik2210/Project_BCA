import React, { useRef } from 'react';
import img1 from '../assets/ministry-1.png';
import img2 from '../assets/ministry-2.png';
import img3 from '../assets/ministry-3.png';
import glassBg from '../assets/ministries-stained-glass.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Ministries = () => {
  const container = useRef();
  const slider = useRef();
  
  const people = [
    { name: 'EMILY JOHNSON', role: 'Youth Ministry Leader, Resurrection Baptist Church', img: img1 },
    { name: 'MICHAEL SMITH', role: 'Outreach Coordinator, Resurrection Baptist Church', img: img2 },
    { name: 'SARAH BROWN', role: 'Education Program Director, Resurrection Baptist Church', img: img3 },
  ];

  useGSAP(() => {
    // Horizontal Scroll
    // Use a function to calculate width dynamically to handle image loading/resizing
    const getScrollAmount = () => {
        return slider.current.scrollWidth - window.innerWidth;
    };

    const tween = gsap.to(slider.current, {
      x: () => -getScrollAmount(), // Move left dynamically
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: () => `+=${getScrollAmount() + 500}`, // Dynamic end
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });

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
    <div ref={container} id="ministries" className="bg-[#1a1614] overflow-hidden relative">
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
        
        <h2 className="text-[#f0e6d2] text-6xl md:text-8xl font-serif text-left mb-8 uppercase tracking-widest drop-shadow-2xl absolute top-10 left-8 z-10">
          Ministries
        </h2>

        {/* The Slider Container */}
        <div ref={slider} className="flex gap-12 w-fit pl-[10vw] relative z-20">
          
          {/* Intro Card */}
           <div className="flex flex-col justify-center min-w-[300px] md:min-w-[450px]">
              <p className="text-[#f0e6d2] text-3xl font-serif leading-relaxed italic border-l-4 border-[#c5a059] pl-6">
                  "Discover the vibrant community and the dedicated individuals serving at Resurrection Baptist Church."
              </p>
              <div className="text-left mt-12 pl-6">
                <button 
                  onClick={() => window.location.href = '/ministries'}
                  className="text-[#c5a059] text-xl font-bold uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-[#c5a059] pb-2 hover:border-white"
                >
                  View All Ministries &rarr;
                </button>
              </div>
           </div>

          {people.map((person, index) => (
            <div key={index} className="ministry-card border border-[#c5a059]/30 bg-black/20 backdrop-blur-md rounded-[2rem] p-8 flex flex-col items-center text-center w-[85vw] md:w-[450px] shrink-0 hover:bg-black/40 hover:border-[#c5a059] hover:shadow-[0_0_40px_rgba(197,160,89,0.2)] transition-all duration-500 group relative overflow-hidden">
              
              {/* Inner Glow Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/0 to-[#c5a059]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="w-full aspect-[4/5] mb-8 overflow-hidden rounded-2xl border border-[#c5a059]/20 relative">
                 <div className="absolute inset-0 bg-[#c5a059] mix-blend-color opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                 <img src={person.img} alt={person.name} className="ministry-img w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
              </div>

              <h3 className="text-[#c5a059] text-3xl font-serif mb-4 uppercase tracking-widest group-hover:text-[#f0e6d2] transition-colors">{person.name}</h3>
              
              <p className="text-[#f0e6d2]/80 font-sans text-sm tracking-wide uppercase border-t border-[#c5a059]/30 pt-4 w-full">
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
