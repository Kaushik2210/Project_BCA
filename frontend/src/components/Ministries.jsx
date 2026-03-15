import React, { useRef } from 'react';
import img1 from '../assets/ministry-1.jpeg';
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
    { name: 'Joshua Aravind', role: 'Youth Ministry Leader, Resurrection Baptist Church', img: img1 },
    { name: 'JONAH CHOWRI', role: 'Outreach Coordinator & Sunday School Director, Resurrection Baptist Church', img: img3 },
  ];

  useGSAP(() => {
    let mm = gsap.matchMedia();

    // Desktop: Horizontal Scroll
    mm.add("(min-width: 768px)", () => {
      const getScrollAmount = () => {
          return slider.current.scrollWidth - window.innerWidth;
      };

      const tween = gsap.to(slider.current, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      // Simple zoom-in scroll effect for images on desktop (NO inner parallax)
      gsap.utils.toArray(".ministry-img").forEach((img) => {
          gsap.from(img, {
              scale: 1.2,
              opacity: 0,
              duration: 1,
              scrollTrigger: {
                  trigger: img.closest('.ministry-card'),
                  start: "left right-=100",
                  toggleActions: "play none none reverse",
                  containerAnimation: tween
              }
          });
      });
    });

    // Mobile: Vertical Scroll Effects
    mm.add("(max-width: 767px)", () => {
      gsap.utils.toArray(".ministry-card").forEach((card) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
          }
        });
      });
    });

    // Refresh ScrollTrigger to ensure correct placement after layout
    ScrollTrigger.refresh();

  }, { scope: container });

  return (
    <div ref={container} id="ministries" className="bg-brand-beige overflow-hidden relative">
      <div 
         className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
         style={{ backgroundImage: `url(${glassBg})` }}
      ></div>

      <div className="min-h-screen md:h-screen w-full flex flex-col justify-center px-4 md:px-8 relative py-20 md:py-0">
        
        {/* Massive Editorial Header */}
        <h2 className="text-transparent text-[15vw] md:text-[12vw] font-serif font-black text-left mb-8 uppercase tracking-tighter absolute top-0 md:top-0 left-0 z-0 opacity-20 select-none pointer-events-none"
            style={{ WebkitTextStroke: '2px #c5a059' }}>
          Ministries
        </h2>
        
        {/* Desktop Fixed Texts Overlay */}
        <div className="absolute top-8 left-4 md:top-10 md:left-8 z-10 w-full md:w-auto text-center md:text-left pointer-events-none">
           <h2 className="text-brand-dark text-5xl md:text-8xl font-serif uppercase tracking-widest drop-shadow-2xl">
             Ministries
           </h2>
           
           {/* Intro text moved below header on desktop */}
           <div className="hidden md:flex flex-col mt-6 max-w-100 pointer-events-auto">
              <p className="text-brand-dark text-xl md:text-2xl font-serif leading-relaxed italic border-l-4 border-brand-red pl-4">
                  "Discover the vibrant community and the dedicated individuals serving at Resurrection Baptist Church."
              </p>
              <div className="mt-6 md:pl-4">
                <button 
                  onClick={() => navigate('/ministries')}
                  className="text-brand-red text-lg font-bold uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-brand-red pb-2 hover:border-white inline-block cursor-pointer"
                >
                  View All Ministries &rarr;
                </button>
              </div>
           </div>
        </div>

        {/* The Slider Container - Now stacks vertically on mobile (flex-col) */}
        <div ref={slider} className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-12 w-full md:w-fit px-4 md:pl-[50vw] relative z-20 mt-28 md:mt-0">
          
          {/* Intro Card (Mobile Only now) */}
           <div className="md:hidden flex flex-col justify-center w-full max-w-100 shrink-0 text-center self-center">
              <p className="text-brand-dark text-xl font-serif leading-relaxed italic px-4">
                  "Discover the vibrant community and the dedicated individuals serving at Resurrection Baptist Church."
              </p>
              <div className="mt-8">
                <button 
                  onClick={() => navigate('/ministries')}
                  className="text-brand-red text-lg font-bold uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-brand-red pb-2 hover:border-white inline-block"
                >
                  View All Ministries &rarr;
                </button>
              </div>
           </div>

          {people.map((person, index) => (
            <div key={index} className="ministry-card border border-brand-red/30 bg-black/20 backdrop-blur-md rounded-4xl p-6 md:p-8 flex flex-col items-center text-center w-full max-w-100 md:max-w-none md:w-112.5 shrink-0 hover:bg-black/40 hover:border-brand-red hover:shadow-[0_0_40px_rgba(197,160,89,0.2)] transition-all duration-500 group relative overflow-hidden">
              
              {/* Inner Glow Gradient */}
              <div className="absolute inset-0 bg-linear-to-b from-brand-red/0 to-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="w-full aspect-4/5 mb-6 md:mb-8 overflow-hidden rounded-3xl md:rounded-2xl border border-brand-red/20 relative">
                 <div className="absolute inset-0 bg-brand-red mix-blend-color opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                 <img src={person.img} alt={person.name} className="ministry-img w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-1000" />
              </div>

              <h3 className="text-brand-red text-2xl md:text-3xl font-serif mb-2 md:mb-4 uppercase tracking-widest group-hover:text-brand-dark transition-colors">{person.name.toUpperCase()}</h3>
              
              <p className="text-brand-dark/80 font-sans text-xs md:text-sm tracking-wide uppercase border-t border-brand-red/30 pt-4 w-full">
                {person.role}
              </p>
            </div>
          ))}

          {/* End Spacer (Only needed for desktop horizontal scroll padding) */}
          <div className="hidden md:block w-[10vw] shrink-0"></div>
        </div>
      </div>
    </div>
  );
};


export default Ministries;
