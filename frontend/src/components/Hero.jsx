import React, { useRef } from 'react';
import heroBg from '../assets/hero-church-epic.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger to sync animations to scroll position
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  // Creating references to DOM elements to target them with GSAP animations
  const wrapperRef = useRef();   // Outer wrapper that pins
  const containerRef = useRef(); // Inner container that shrinks
  const textRef = useRef();      // Text elements to animate in
  const btnRef = useRef();       // Button to apply magnetic hover effect
  const bgRef = useRef();        // Background for parallax effect

  // useGSAP scopes all these animations to the component lifecycle
  useGSAP(() => {
    // A timeline lets us sequence animations (like staggered text fade-up)
    const tl = gsap.timeline();

    // Initial Reveal - Fades up the text line by line using 'stagger: 0.2'
    tl.from(".hero-line", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power4.out",
      delay: 0.5
    })
    // Also fade up the button just before the text finishes ("-=1" means 1 second early)
    .from(btnRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, "-=1");

    // Merge on Scroll / Pinning Effect
    // The wrapper stays pinned while you scroll down, and the container inside shrinks to scale 0.9, revealing rounded borders.
    gsap.to(containerRef.current, {
      scale: 0.9,
      borderRadius: "2rem",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top", // Starts pinning when wrapper top hits viewport top
        end: "bottom top", 
        pin: true,        // Actually fixes the element in place while moving
        scrub: true,      // Animation synchronizes precisely to the scroll bar
      }
    });

    // Background Parallax inside the shrinking container
    // As you scroll, the background continues zooming/translating to add a feeling of depth
    gsap.to(bgRef.current, {
      scale: 1.2, // Slightly zoom in/out or move
      yPercent: 10,
      ease: "none", // Even linear scrolling
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true // Link to scroll position
      }
    });

    // Magnetic Button Effect
    // The button shifts toward the mouse pointer when you hover over it
    const btn = btnRef.current;
    let moveBtn, resetBtn;

    if(btn) {
        // Function executed repeatedly as mouse moves over the button bounds
        moveBtn = (e) => {
          const { clientX, clientY } = e;
          const { left, top, width, height } = btn.getBoundingClientRect();
          // Calculate distance from center of the button
          const x = clientX - (left + width / 2);
          const y = clientY - (top + height / 2);
          
          // Use GSAP to animate it instantly by applying a factor (0.3 drag coefficient)
          gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
          });
        };

        // Resets position elastically when the mouse leaves
        resetBtn = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "elastic.out(1, 0.3)" // Gives the bouncing effect
          });
        };

        // Attach listeners
        btn.addEventListener("mousemove", moveBtn);
        btn.addEventListener("mouseleave", resetBtn);
    }

    // Cleanup phase: React will run this function when the component disappears to release memory/event listeners
    return () => {
      if (btn && moveBtn && resetBtn) {
        btn.removeEventListener("mousemove", moveBtn);
        btn.removeEventListener("mouseleave", resetBtn);
      }
    };

  }, { scope: wrapperRef });

  return (
    // Wrapper handles the pinning space. When triggered via GSAP, this box stays still as user scrolls.
    <div ref={wrapperRef} id="home" className="relative w-full h-screen overflow-hidden bg-[#3E2F26]"> 
      
      {/* Container undergoes the size transformation. Overflows hidden to prevent background bleeding */}
      <div ref={containerRef} className="relative w-full h-full overflow-hidden origin-center will-change-transform">
          
          {/* Background Image: the scale class starts it larger so it has parallax room to zoom */}
          <div 
            ref={bgRef}
            className="absolute inset-0 bg-cover bg-center scale-110" 
            style={{ backgroundImage: `url(${heroBg})` }}
          >
            {/* The overlay dims the background slightly to ensure white text stays readable */}
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
