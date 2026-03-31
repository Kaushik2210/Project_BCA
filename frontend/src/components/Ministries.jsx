// Import React to access core component capabilities.
// Import 'useRef' to create direct references to specific DOM elements for GSAP animations.
import React, { useRef } from 'react';

// Import image assets needed for the specific ministry cards. 
// Webpack/Vite statically analyzes these and bundles them properly.
import img1 from '../assets/ministry-1.jpeg';
import img3 from "../assets/ministry-3.jpeg";

// Import a large background image ('stained glass' style) to give texture behind the component.
import glassBg from '../assets/ministries-stained-glass.png';

// Import the GSAP core library, which handles all complex JavaScript animations.
import gsap from 'gsap';

// Import 'useGSAP', a specialized React hook from GSAP that automatically cleans up 
// animations when the component is removed, preventing memory leaks and bugs.
import { useGSAP } from '@gsap/react';

// Import ScrollTrigger, a powerful GSAP plugin that links animation timelines 
// directly to the browser's native scroll position.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Link to navigate quickly without reloading the page.
// Import useNavigate (a React Router hook) to trigger navigation programmatically via Javascript if needed.
import { Link, useNavigate } from "react-router-dom";

// Standard GSAP setup: We MUST register ScrollTrigger here globally before we can use it anywhere in the app.
gsap.registerPlugin(ScrollTrigger);

// Define the Ministries functional React component.
const Ministries = () => {
  // 'container' reference: targets the outermost wrapper of this whole section.
  // We use this as the master pinning trigger: while scrolling down, this element locks in place on screen.
  const container = useRef();
  
  // 'slider' reference: targets the actual inner flex container that holds all the cards.
  // While the 'container' is pinned vertically, we animate this slider moving sideways (x-axis).
  const slider = useRef();
  
  // Initialize the navigation function. Usually called when handling a click event (e.g. `navigate('/page')`).
  const navigate = useNavigate();

  // Create an array of objects to store data for our Ministry cards.
  // Keeping data separated like this makes the UI easy to update or fetch from a backend API later.
  const people = [
    { name: 'Joshua Aravind', role: 'Youth Ministry Leader, Resurrection Baptist Church', img: img1 },
    { name: 'JONAH CHOWRI', role: 'Outreach Coordinator & Sunday School Director, Resurrection Baptist Church', img: img3 },
  ];

  // Initialize GSAP animations using the safe hook, constrained to only affect elements inside 'container'.
  useGSAP(() => {
    
    // Create a matchMedia object. This works exactly like CSS @media queries but for Javascript animations.
    // It lets us execute completely different animation logic depending on screen size.
    let mm = gsap.matchMedia();

    // ----------------------------------------------------
    // DESKTOP ANIMATION LOGIC (Screens larger than 768px)
    // ----------------------------------------------------
    mm.add("(min-width: 768px)", () => {
      
      // Define a dynamic function to calculate how far left the slider needs to travel horizontally.
      const getScrollAmount = () => {
          // 'scrollWidth' is the total inner dynamic width of all cards combined.
          // 'window.innerWidth' is the visible screen width. 
          // Result: The amount of hidden overflow that needs to slide into view.
          return slider.current.scrollWidth - window.innerWidth;
      };

      // Create a master animation (tween) that moves the slider leftwards.
      const tween = gsap.to(slider.current, {
        // Move along the X axis by negative the scroll amount (moves left).
        x: () => -getScrollAmount(), 
        // Keep movement linear so it feels identical to regular scrolling. No easing speed-ups.
        ease: "none",
        // Setup ScrollTrigger to turn vertical scrolling into this horizontal movement.
        scrollTrigger: {
          // The outer section container is the trigger point.
          trigger: container.current,
          // "top top" = start when the top of the container hits the top of the browser screen.
          start: "top top", 
          // End exactly after the user has scrolled down equivalent to the amount we need to pan sideways.
          // `+=` tells it to add that numeric distance dynamically.
          end: () => `+=${getScrollAmount()}`, 
          // Lock (pin) the outer container to the screen so it doesn't leave while the inner track slides.
          pin: true, 
          // 'scrub: 1' means the animation catches up to the scrollbar over 1 second (smoothing effect).
          scrub: 1, 
          // 'invalidateOnRefresh' ensures that if the user resizes their window, the math for scrollAmount recalculates safely.
          invalidateOnRefresh: true, 
        }
      });

      // Find every image inside our ministry cards to add a slight "zoom in" effect as they scroll into view.
      // `gsap.utils.toArray()` converts a CSS class selector into an array we can map over.
      gsap.utils.toArray(".ministry-img").forEach((img) => {
          
          // Animate the image from a starting state.
          gsap.from(img, {
              // Start slightly zoomed in (1.2x size).
              scale: 1.2,
              // Start invisible (0 opacity).
              opacity: 0,
              // The effect lasts 1 second.
              duration: 1,
              // Setup scrollTrigger for this nested effect.
              scrollTrigger: {
                  // The trigger is the specific parent card containing the image.
                  trigger: img.closest('.ministry-card'),
                  // "left right-=100" = start the animation when the left edge of the card comes within 100px of the right side of the screen.
                  start: "left right-=100", 
                  // Play animation entering, but fade out (reverse) if they scroll backward past it.
                  toggleActions: "play none none reverse",
                  // CRITICAL: We pass our main horizontal tween here as `containerAnimation`. 
                  // Without this, GSAP wouldn't know the card is moving sideways because technically no vertical scrolling is hitting it directly.
                  containerAnimation: tween 
              }
          });
      });
    });

    // ----------------------------------------------------
    // MOBILE ANIMATION LOGIC (Screens smaller than 767px)
    // ----------------------------------------------------
    mm.add("(max-width: 767px)", () => {
      // On mobile, horizontal scrolling lists are annoying, so we stack them vertically.
      // Therefore, we just fade each card up standardly as they scroll down normally without pinning.
      gsap.utils.toArray(".ministry-card").forEach((card) => {
        gsap.from(card, {
          // Start 40px lower on the Y axis.
          y: 40, 
          // Start invisible.
          opacity: 0,
          // Quick smooth duration.
          duration: 0.8,
          // Standard ease out.
          ease: "power2.out",
          // ScrollTrigger per card.
          scrollTrigger: {
            // The card itself triggers its own appearance.
            trigger: card,
            // When the top of the card is 50px near the bottom of the viewport viewport, fade it in immediately.
            start: "top bottom-=50", 
            // Play normally forward, reverse if scrolled back up manually.
            toggleActions: "play none none reverse"
          }
        });
      });
    });

    // Manually force GSAP to refresh and recalculate all positional geometry of elements on the screen.
    // This helps prevent bugs where React mounts the DOM but GSAP records the positions before images load.
    ScrollTrigger.refresh();

  // Close hook, bound context strictly to 'container'.
  }, { scope: container });

  // Render out the UI using semantic HTML and Tailwind CSS utilities.
  return (
    // The master wrapping container. Important classes: 'overflow-hidden relative'
    <div ref={container} id="ministries" className="bg-brand-beige overflow-hidden relative">
      
      {/* Background Stained Glass Image Overlay */}
      {/* 'pointer-events-none' ensures users can't click on the background by mistake or drag the image. */}
      {/* 'opacity-30' dims it so it is subtle and doesn't interfere with the text. */}
      <div 
         className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
         style={{ backgroundImage: `url(${glassBg})` }}
      ></div>

      {/* Main content wrapper padding block. Sets 'min-h-screen' to ensure it takes up exact height of screen on load for pinning to work properly. */}
      <div className="min-h-screen md:h-screen w-full flex flex-col justify-center px-4 md:px-8 relative py-20 md:py-0">
        
        {/* Massive watermark text sitting behind everything for aesthetic ("Ministries"). */}
        {/* We use 'absolute top-0' and 'z-0' to push it fully to the back, underneath standard content. */}
        {/* Text stroke uses an inline Webkit style to create a hollow outlined font look. */}
        <h2 className="text-transparent text-[15vw] md:text-[12vw] font-serif font-black text-left mb-8 uppercase tracking-tighter absolute top-0 md:top-0 left-0 z-0 opacity-20 select-none pointer-events-none"
            style={{ WebkitTextStroke: '2px #c5a059' }}>
          Ministries
        </h2>
        
        {/* Fixed Title Block overlaid on top of the scrolling section (Desktop specific) */}
        {/* 'z-30' ensures it stays visually above the photos sliding by behind it. */}
        <div className="absolute top-8 left-4 md:top-10 md:left-8 z-30 w-full md:w-auto text-center md:text-left pointer-events-none">
           {/* Classic large serif text title. */}
           <h2 className="text-brand-dark text-5xl md:text-8xl font-serif uppercase tracking-widest drop-shadow-2xl">
             Ministries
           </h2>
           
           {/* Detailed paragraph and link chunk (hidden on mobile, handled separately below). */}
           {/* 'pointer-events-auto' allows the user to actually click the link inside this box despite the parent being 'pointer-events-none'. */}
           <div className="hidden md:flex flex-col mt-6 max-w-100 pointer-events-auto">
              
              {/* Added left border decoration ('border-l-4') styling to look editorial. */}
              <p className="text-brand-dark text-xl md:text-2xl font-serif leading-relaxed italic border-l-4 border-brand-red pl-4">
                  "Discover the vibrant community and the dedicated individuals serving at Resurrection Baptist Church."
              </p>
              
              <div className="mt-6 md:pl-4">
                {/* React Router Link element. Pushes path to "/ministries" route instantly without a hard load. */}
                <Link 
                  to="/ministries"
                  className="text-brand-red text-lg font-bold uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-brand-red pb-2 hover:border-white inline-block cursor-pointer"
                >
                  View All Ministries &rarr;
                </Link>
              </div>
           </div>
        </div>

        {/* The Horizonatal Slider Track containing the actual cards. Linked to `slider` ref. */}
        {/* For mobile, it acts as a stacked flex column ('flex-col'). For desktop ('md:flex-row') it becomes a horizontal list spanning infinitely wide based on items. */}
        <div ref={slider} className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-12 w-full md:w-fit px-4 md:pl-[50vw] relative z-20 mt-28 md:mt-0">
          
          {/* Mobile equivalent of the text overlay block (appears inline only on mobile). */}
           <div className="md:hidden flex flex-col justify-center w-full max-w-100 shrink-0 text-center self-center">
              <p className="text-brand-dark text-xl font-serif leading-relaxed italic px-4">
                  "Discover the vibrant community and the dedicated individuals serving at Resurrection Baptist Church."
              </p>
              <div className="mt-8">
                <Link 
                  to="/ministries"
                  className="text-brand-red text-lg font-bold uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-brand-red pb-2 hover:border-white inline-block"
                >
                  View All Ministries &rarr;
                </Link>
              </div>
           </div>

          {/* ITERATOR PATTERN: We loop over our 'people' array using `.map()`. */}
          {/* For each object in the array, React spits out one fully formed UI card using the data properties mapped inward. */}
          {/* We must specify a unique 'key={index}' so React algorithmically knows which elements to update if the list data ever changes. */}
          {people.map((person, index) => (
            
            // The ministry card container block with extensive glass styling and grouping properties (`group`).
            // `shrink-0` ensures flexbox will NEVER squish the cards down—they stay exactly their set dimensions and force horizontal overflowing out the bounding box.
            <div key={index} className="ministry-card border border-brand-red/30 bg-black/20 backdrop-blur-md rounded-4xl p-6 md:p-8 flex flex-col items-center text-center w-full max-w-100 md:max-w-none md:w-112.5 shrink-0 hover:bg-black/40 hover:border-brand-red hover:shadow-[0_0_40px_rgba(197,160,89,0.2)] transition-all duration-500 group relative overflow-hidden">
              
              {/* Inner ambient hover glow: Appears when the parent `.group` is hovered. */}
              <div className="absolute inset-0 bg-linear-to-b from-brand-red/0 to-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Photo wrapping div fixing constant aspect ratio shape layout so odd images stretch gracefully. */}
              <div className="w-full aspect-4/5 mb-6 md:mb-8 overflow-hidden rounded-3xl md:rounded-2xl border border-brand-red/20 relative">
                 
                 {/* Decorative Red colored wash filter that only shows 20% on hover (`mix-blend-color`). */}
                 <div className="absolute inset-0 bg-brand-red mix-blend-color opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                 
                 {/* The specific image data populated here via `{person.img}`. */}
                 {/* 'ministry-img' class allows our GSAP effect to grab it automatically and pop it when it scrolls by. */}
                 {/* Has a CSS transform applied so pointing the mouse at parent zooms image gently (`group-hover:scale-110`). */}
                 <img src={person.img} alt={person.name} className="ministry-img w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-1000" />
              </div>

              {/* Data injected via `{person.name}` inside a Header tag . */}
              <h3 className="text-brand-red text-2xl md:text-3xl font-serif mb-2 md:mb-4 uppercase tracking-widest group-hover:text-brand-dark transition-colors">{person.name.toUpperCase()}</h3>
              
              {/* Data injected via `{person.role}` inside standard text tag . */}
              <p className="text-brand-dark/80 font-sans text-xs md:text-sm tracking-wide uppercase border-t border-brand-red/30 pt-4 w-full">
                {person.role}
              </p>
            </div>
          ))}

          {/* This empty invisible box is a spacer technique. */}
          {/* It pads out the end of the flex slider track on desktop, so the last photo isn't pushed exactly hard-right against edge. */}
          <div className="hidden md:block w-[10vw] shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

// Export the module.
export default Ministries;
