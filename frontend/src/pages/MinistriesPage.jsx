// Import React and useRef for DOM element references.
import React, { useRef } from 'react';
// Import Navbar and Footer layout components.
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// Import ministry images from the assets folder.
import img1 from '../assets/ministry-1.jpeg';
import img2 from '../assets/ministry-2.jpeg';
import img3 from '../assets/ministry-3.jpeg';
// Import the decorative stained glass background.
import glassBg from '../assets/ministries-stained-glass.png';
// Import GSAP animation libraries.
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin with GSAP so scroll-linked animations work.
gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// MinistriesPage — A dedicated page showcasing all church ministries.
// Each ministry gets its own full-screen section with parallax images and reveal animations.
// =========================================================================
const MinistriesPage = () => {
    // Ref for the main container — used as the GSAP animation scope.
    const container = useRef();

    // Static array of ministry data objects. Each object defines the content for one section.
    const ministries = [
        { 
            id: 1,
            name: 'Youth Ministry', 
            role: 'Empowering the Next Generation', 
            desc: "Our Youth Ministry is a vibrant community where young people can grow in their faith, build lasting friendships, and discover their God-given purpose. Through weekly gatherings we guide teens to become bold disciples of Christ.",
            img: img1,
            color: "#c5a059"
        },
        { 
            id: 2,
            name: 'Outreach & Missions', 
            role: 'Serving Our Community & World', 
            desc: "We believe faith is active. Our Outreach team organizes house to house meetings and hospital visits to evangelise the blessed hope in the Gospel to unknown people ",
            img: img2,
            color: "#f0e6d2"
        },
        { 
            id: 3,
            name: 'Education & Discipleship', 
            role: 'Deepening Knowledge & Spirit', 
            desc: "From Sunday School for kids to Theology classes for adults, our Sunday School department ensures everyone has the tools to understand scripture deeply. We foster a culture of lifelong learning and spiritual maturity.",
            img: img3,
            color: "#c5a059"
        },
    ];

    // GSAP animation hook — runs when the component mounts and the container is available.
    useGSAP(() => {
        // Get all ministry section elements as an array for iteration.
        const sections = gsap.utils.toArray('.ministry-section');
        
        // Loop through each section and attach individual animations.
        sections.forEach((section, i) => {
            // Select the image and text elements within this specific section.
            const img = section.querySelector('.ministry-img');
            const text = section.querySelector('.ministry-text');
            
            // IMAGE PARALLAX EFFECT:
            // As the user scrolls, the image moves from -20% to +20% of its height,
            // while scaling down from 1.1x to 1x. This creates a depth/parallax illusion.
            gsap.fromTo(img, 
                { yPercent: -20, scale: 1.1 },   // Starting state
                { 
                    yPercent: 20,                  // Ending state (moves down)
                    scale: 1,                      // Scales back to normal
                    ease: "none",                  // Linear movement (no ease)
                    scrollTrigger: {
                        trigger: section,           // This section is the trigger element
                        start: "top bottom",        // Start when section top enters viewport bottom
                        end: "bottom top",          // End when section bottom leaves viewport top
                        scrub: true                 // Tie animation directly to scroll position
                    }
                }
            );

            // TEXT REVEAL ANIMATION:
            // Text fades in and slides up when the section scrolls into view.
            gsap.fromTo(text,
                { y: 100, opacity: 0 },            // Start 100px below, invisible
                {
                    y: 0,                           // Slide to normal position
                    opacity: 1,                     // Fade to fully visible
                    duration: 1,
                    ease: "power3.out",             // Smooth deceleration
                    scrollTrigger: {
                        trigger: section,
                        start: "top 60%",           // Trigger when section top reaches 60% of viewport
                        toggleActions: "play none none reverse" // Play on enter, reverse on leave
                    }
                }
            );
        });

    }, { scope: container }); // Scope ensures cleanup when component unmounts.

    return (
        <>
            <Navbar />
            <div ref={container} className="bg-brand-beige text-brand-dark overflow-hidden">
                
                {/* Fixed decorative background image with low opacity */}
                <div 
                  className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                  style={{ backgroundImage: `url(${glassBg})` }}
                ></div>

                {/* Hero Header Section — 60% viewport height */}
                <div className="h-[60vh] flex flex-col justify-center items-center text-center px-8 pt-20 relative z-10">
                    <h1 className="text-6xl md:text-9xl font-serif text-brand-red opacity-90 drop-shadow-2xl mb-6">
                        MINISTRIES
                    </h1>
                    <p className="text-xl md:text-2xl font-serif text-brand-dark/80 max-w-2xl italic border-y border-brand-red/30 py-6">
                        "For even the Son of Man came not to be ministerd unto, but to minister."
                    </p>
                </div>

                {/* Ministry Sections — Each ministry gets a full-screen alternating layout */}
                <div className="px-4 md:px-12 pb-24 relative z-10">
                    {ministries.map((min, i) => (
                        <div key={min.id} className="ministry-section min-h-screen py-24 flex flex-col md:flex-row items-center gap-12 md:gap-24 sticky top-0 bg-brand-beige/95 backdrop-blur-sm border-t border-brand-red/20">
                            
                            {/* Image Side — alternates left/right using md:order-last on odd items */}
                            <div className={`w-full md:w-1/2 h-[50vh] md:h-[70vh] overflow-hidden rounded-4xl border border-brand-red/30 relative group ${i % 2 === 1 ? 'md:order-last' : ''}`}>
                                {/* Dark overlay that clears on hover for an interactive reveal effect */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                <img 
                                    src={min.img} 
                                    alt={min.name} 
                                    className="ministry-img w-full h-full object-contain"
                                />
                            </div>

                            {/* Text Content Side */}
                            <div className="ministry-text w-full md:w-1/2">
                                {/* Ministry number label */}
                                <span className="text-brand-red text-sm font-bold uppercase tracking-[0.3em] mb-4 block">
                                    0{min.id} — Service
                                </span>
                                <h2 className="text-5xl md:text-7xl font-serif text-brand-dark mb-6 leading-tight">
                                    {min.name}
                                </h2>
                                <h3 className="text-2xl md:text-3xl font-serif text-brand-red mb-8 italic opacity-80">
                                    {min.role}
                                </h3>
                                <p className="text-lg md:text-xl text-brand-dark/70 leading-relaxed mb-12 max-w-xl">
                                    {min.desc}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
            <Footer />
        </>
    );
};

export default MinistriesPage;
