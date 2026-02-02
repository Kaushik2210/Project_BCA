import React, { useRef } from 'react';
import heroBg from '../assets/hero-church-epic.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const wrapperRef = useRef();
  const containerRef = useRef();
  const textRef = useRef();
  const btnRef = useRef();
  const bgRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();

    // Initial Reveal
    tl.from(".hero-line", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power4.out",
      delay: 0.5
    })
    .from(btnRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, "-=1");

    // Merge on Scroll / Pinning Effect
    // The wrapper pins, and the container inside shrinks
    gsap.to(containerRef.current, {
      scale: 0.9,
      borderRadius: "2rem",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: true,
      }
    });

    // Background Parallax inside the shrinking container
    gsap.to(bgRef.current, {
      scale: 1.2, // Slightly zoom in/out or move
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Magnetic Button Effect
    const btn = btnRef.current;
    let moveBtn, resetBtn;

    if(btn) {
        moveBtn = (e) => {
          const { clientX, clientY } = e;
          const { left, top, width, height } = btn.getBoundingClientRect();
          const x = clientX - (left + width / 2);
          const y = clientY - (top + height / 2);
          
          gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
          });
        };

        resetBtn = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "elastic.out(1, 0.3)"
          });
        };

        btn.addEventListener("mousemove", moveBtn);
        btn.addEventListener("mouseleave", resetBtn);
    }

    return () => {
      if (btn && moveBtn && resetBtn) {
        btn.removeEventListener("mousemove", moveBtn);
        btn.removeEventListener("mouseleave", resetBtn);
      }
    };

    return () => {
      if (btn) {
        btn.removeEventListener("mousemove", moveBtn);
        btn.removeEventListener("mouseleave", resetBtn);
      }
    };

  }, { scope: wrapperRef });

  return (
    // Wrapper handles the pinning space
    <div ref={wrapperRef} id="home" className="relative w-full h-screen overflow-hidden bg-[#3E2F26]"> 
      {/* Container undergoes the transformation */}
      <div ref={containerRef} className="relative w-full h-full overflow-hidden origin-center will-change-transform">
          
          {/* Background Image */}
          <div 
            ref={bgRef}
            className="absolute inset-0 bg-cover bg-center scale-110" 
            style={{ backgroundImage: `url(${heroBg})` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 pt-20">
            <h1 ref={textRef} className="text-white text-5xl md:text-6xl lg:text-7xl font-serif mb-12 max-w-4xl leading-tight drop-shadow-2xl">
              <div className="overflow-hidden"><span className="hero-line block">Resurrection Baptist</span></div>
              <div className="overflow-hidden"><span className="hero-line block">Church: Welcome</span></div>
            </h1>
            
            <div className="overflow-hidden">
              <button ref={btnRef} className="bg-[#E8D4C1] text-[#3E2F26] px-12 py-3 rounded-full text-xl md:text-2xl font-serif tracking-wide hover:bg-[#F5E6D3] transition-all shadow-2xl uppercase border-2 border-[#E8D4C1] hover:border-white">
                Join Us
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Hero;
