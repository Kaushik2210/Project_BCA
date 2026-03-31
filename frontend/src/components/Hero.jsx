// Import the React library, which is required to build user interfaces using components.
// 'useRef' is a React Hook that lets us reference DOM elements directly.
import React, { useRef } from 'react';

// Import the specific background image asset for the Hero section. 
// Webpack/Vite handles bundling this file into the final build.
import heroBg from '../assets/hero-church-epic.png';

// Import the core GSAP library, which is a powerful Javascript animation engine.
import gsap from 'gsap';

// Import the official GSAP React hook, which helps manage animation cleanup 
// and scoping specifically within React's render cycle.
import { useGSAP } from '@gsap/react';

// Import ScrollTrigger from GSAP to create animations that are triggered 
// or scrubbed based on the user's scroll position on the page.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin with the GSAP core. 
// This is required before using ScrollTrigger in any animations.
gsap.registerPlugin(ScrollTrigger);

// Define the Hero functional component representing the top section of the page.
const Hero = () => {
  // Create a React reference for the outermost wrapper div. 
  // We need this so GSAP knows which element to "pin" during the scroll animation.
  const wrapperRef = useRef();   
  
  // Create a reference for the inner container that holds the background and text.
  // This helps GSAP apply the shrinking/scaling effect specifically to this box.
  const containerRef = useRef(); 
  
  // Create a reference for the text headers so we can animate them fading in.
  const textRef = useRef();      
  
  // Create a reference for the "Join Us" button to apply a custom magnetic hover effect.
  const btnRef = useRef();       
  
  // Create a reference to the background image layer to apply a visual parallax effect.
  const bgRef = useRef();        

  // The useGSAP hook runs our animation code safely when the component mounts.
  // We pass a config object at the end `{ scope: wrapperRef }` to ensure GSAP only 
  // looks for elements inside our wrapperRef, preventing conflicts with other components.
  useGSAP(() => {
    
    // Create a GSAP timeline. Timelines let us chain multiple animations together 
    // in exactly the order we want (e.g. animate text A, then text B, then the button).
    const tl = gsap.timeline();

    // Begin the first animation on the timeline: Animating elements with the class '.hero-line'.
    // The '.from()' method means we define the *starting* state, and GSAP animates it to its normal CSS state.
    tl.from(".hero-line", {
      // Start the text 100 pixels lower on the Y-axis.
      y: 100,
      // Start the text completely invisible.
      opacity: 0,
      // The animation will take 1.5 seconds to complete.
      duration: 1.5,
      // 'stagger: 0.2' delays the start of each '.hero-line' element by 0.2 seconds relative to the previous one.
      stagger: 0.2,
      // Use an 'out' easing function so the animation starts fast and slows down gracefully at the end.
      ease: "power4.out",
      // Wait 0.5 seconds after the component mounts before starting this initial animation.
      delay: 0.5
    })
    // Immediately chain the next animation onto the timeline for the 'Join Us' button.
    .from(btnRef.current, {
      // Start the button 50 pixels lower.
      y: 50,
      // Start the button fully transparent.
      opacity: 0,
      // This animation lasts exactly 1 second.
      duration: 1,
      // Use a slightly different easing curve for smooth deceleration.
      ease: "power3.out"
      // The "-=1" means start this animation 1 second *before* the previous text animation officially ends.
    }, "-=1");

    // Create a scroll-triggered animation pointing directly at the 'containerRef' element.
    // The '.to()' method animates the element *towards* these new CSS values.
    gsap.to(containerRef.current, {
      // Shrink the container to 90% of its original size.
      scale: 0.9,
      // Round the corners heavily as it shrinks.
      borderRadius: "2rem",
      // Make the transition smooth going both in and out.
      ease: "power1.inOut",
      // Configure the ScrollTrigger settings for this specific animation.
      scrollTrigger: {
        // The element that dictates when the animation starts is the outer 'wrapperRef'.
        trigger: wrapperRef.current,
        // Start animating precisely when the "top" of the trigger hits the "top" of the browser viewport.
        start: "top top", 
        // Finish animating when the "bottom" of the trigger reaches the "top" of the viewport.
        end: "bottom top", 
        // Keep the trigger element locked (pinned) in place on the screen while this animation happens.
        pin: true,        
        // 'scrub: true' links the animation progress directly to the user's scrollbar dragging.
        scrub: true,      
      }
    });

    // Create a separate Parallax effect animation specifically targeting the background image.
    gsap.to(bgRef.current, {
      // Slightly scale it up to 1.2 to create a feeling of depth.
      scale: 1.2, 
      // Move it down by 10% on the Y axis.
      yPercent: 10,
      // Use a linear ease ("none") so the movement matches the scroll speed perfectly.
      ease: "none", 
      // Attach this animation to the same scroll timeframe as the pinning animation.
      scrollTrigger: {
        // Use the wrapper as the trigger block.
        trigger: wrapperRef.current,
        // Start exactly when the wrapper hits the top of the screen.
        start: "top top",
        // End when the wrapper scrolls away.
        end: "bottom top",
        // Scrub tightly links it to the scrollbar movement.
        scrub: true 
      }
    });

    // Extract the raw DOM button element from the Ref variable for direct event manipulation.
    const btn = btnRef.current;
    
    // Declare let variables to hold our event listener functions so we can cleanly remove them later.
    let moveBtn, resetBtn;

    // A safety check: ensure the button actually exists in the DOM before we attach events.
    if(btn) {
        // Define the function that runs every time the user moves their mouse over the button.
        moveBtn = (e) => {
          // Destructure the X and Y coordinate of the user's mouse pointer relative to the browser window.
          const { clientX, clientY } = e;
          // Get the actual physical dimensions and position of the button on the screen.
          const { left, top, width, height } = btn.getBoundingClientRect();
          
          // Calculate the distance from the center of the button on the X axis.
          const x = clientX - (left + width / 2);
          // Calculate the distance from the center of the button on the Y axis.
          const y = clientY - (top + height / 2);
          
          // Use GSAP to animate the button towards the mouse position.
          gsap.to(btn, {
            // We multiply by 0.3 so the button only trails the mouse slightly (a sticky/magnetic feel).
            x: x * 0.3,
            // Multiply Y by 0.3 for the vertical magnetic pull.
            y: y * 0.3,
            // Make the movement snap instantly by using a short duration.
            duration: 0.3,
            // Use an 'out' ease to quickly snap it but smoothly finish the movement.
            ease: "power2.out"
          });
        };

        // Define the reset function that runs the moment the user's mouse leaves the boundaries of the button.
        resetBtn = () => {
          // Tell GSAP to return the button back to its exact origin point.
          gsap.to(btn, {
            // 0 means original CSS X position.
            x: 0,
            // 0 means original CSS Y position.
            y: 0,
            // Animation duration of 0.3 seconds.
            duration: 0.3,
            // Use a bouncy "elastic" ease to make the button wobble when released back to center.
            ease: "elastic.out(1, 0.3)" 
          });
        };

        // Attach the 'moveBtn' function to listen to continuous mouse movements over the button.
        btn.addEventListener("mousemove", moveBtn);
        // Attach the 'resetBtn' function to listen for when the mouse completely leaves the button.
        btn.addEventListener("mouseleave", resetBtn);
    }

    // Return a cleanup function from the useGSAP hook. React runs this right before removing the component from the screen.
    return () => {
      // Check if the button and our listener functions exist.
      if (btn && moveBtn && resetBtn) {
        // Detach the mousemove listener so we don't leak memory.
        btn.removeEventListener("mousemove", moveBtn);
        // Detach the mouseleave listener so we don't leak memory.
        btn.removeEventListener("mouseleave", resetBtn);
      }
    };

    // Close the hook definition and provide the scoping object as discussed earlier.
  }, { scope: wrapperRef });

  // Return the actual JSX markup which React converts into DOM elements on the webpage.
  return (
    // The outermost container. We attach `ref={wrapperRef}` so GSAP knows to pin this element.
    // We use Tailwind CSS classes: relative positioning, full width, screen height, hiding visual overflows, and a brown background color.
    <div ref={wrapperRef} id="home" className="relative w-full h-screen overflow-hidden bg-[#3E2F26]"> 
      
      {/* The inner container that we attached `ref={containerRef}` to. */}
      {/* This is the div that shrinks heavily on scroll. 'origin-center' means it shrinks perfectly towards its middle. */}
      {/* 'will-change-transform' optimizes browser rendering performance for transformations. */}
      <div ref={containerRef} className="relative w-full h-full overflow-hidden origin-center will-change-transform">
          
          {/* This nested div holds the actual Parallax Background image. We assign it `ref={bgRef}`. */}
          {/* 'absolute inset-0' stretches the div perfectly over its parent. 'scale-110' starts it 10% larger to give room to shrink later. */}
          <div 
            ref={bgRef}
            className="absolute inset-0 bg-cover bg-center scale-110" 
            // We dynamically inline the background image URL imported at the top of the file.
            style={{ backgroundImage: `url(${heroBg})` }}
          >
            {/* The overlay layer. 'absolute inset-0 bg-black/30' creates a pitch black layer covering everything with 30% transparency. */}
            {/* This ensures the white text placed on top is always strictly legible against any background brightness. */}
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* The Content wrapper div. 'relative z-10' pops it up over the background image. */}
          {/* We use flexbox ('flex flex-col justify-center') to vertically align the text to the middle of the screen. */}
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 pt-20">
            
            {/* The primary headline structure. 'ref={textRef}' is attached though GSAP in this case targeted `.hero-line` directly. */}
            {/* We apply Tailwind styling for white serif text, responsive sizing (text-5xl to 7xl), and a drop shadow for pop. */}
            <h1 ref={textRef} className="text-white text-5xl md:text-6xl lg:text-7xl font-serif mb-12 max-w-4xl leading-tight drop-shadow-2xl">
              
              {/* Outer wrapping div sets 'overflow-hidden'. This is known as a "masking container" in animation. */}
              {/* Anything inside this box that starts below the box will be completely invisible until it slides up into the box. */}
              <div className="overflow-hidden">
                 {/* The actual text line span. We add the 'hero-line' class that our GSAP Timeline directly targets to animate up. */}
                 <span className="hero-line block">Resurrection Baptist</span>
              </div>
              
              {/* Second line mask container for staggered animation effect. */}
              <div className="overflow-hidden">
                 {/* The second line of text, naturally delayed by our `stagger: 0.2` rule in GSAP. */}
                 <span className="hero-line block">Church: Welcome</span>
              </div>
            </h1>
            
            {/* A mask container for the button as well, ensuring it animates cleanly. */}
            <div className="overflow-hidden">
              {/* The Call to Action button. We attach `ref={btnRef}` here to power the magnetic mouse effect. */}
              {/* It uses Tailwind for styling a beige ('#E8D4C1') button with uppercase text, strong rounding ('rounded-full'), and a hover swap. */}
              <button ref={btnRef} className="bg-[#E8D4C1] text-[#3E2F26] px-12 py-3 rounded-full text-xl md:text-2xl font-serif tracking-wide hover:bg-[#F5E6D3] transition-all shadow-2xl uppercase border-2 border-[#E8D4C1] hover:border-white">
                Join Us
              </button>
            </div>

          </div>
      </div>
    </div>
  );
};

// Export the 'Hero' component as the default export so it can be cleanly imported into the main page layout files.
export default Hero;
