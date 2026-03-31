// Import React and useRef hook for DOM references.
import React, { useRef } from "react";
// Import shared layout components.
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// Import background image for the parallax hero section.
import historyBg from "../assets/hero-church-epic.png";
// Import pastor's image for the sticky pinning section.
import pastorImg from "../assets/ministry-3.jpeg"; // Placeholder
// Import GSAP animation libraries.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin with GSAP — required for scroll-based animations.
gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// AboutPage — The "Our Story" page with a timeline, parallax hero, and
// a sticky pastor section. Features three main GSAP animation techniques:
// 1. Scroll-scrubbed line drawing (timeline)
// 2. Reveal animations on milestone cards
// 3. Pinning (sticky) for the pastor's photo while text scrolls beside it
// =========================================================================
const AboutPage = () => {
  // Ref for the main wrapper — used as GSAP animation scope for cleanup.
  const container = useRef();
  // eslint-disable-next-line no-unused-vars
  const timelineRef = useRef();

  // Static array of church history milestones — each rendered as a timeline card.
  const historyEvents = [
    {
      year: "2025",
      title: "The Foundation",
      desc: "Started in a small living room with just 3 families dedicated to prayer.",
    },
    {
      year: "2025",
      title: "Growing Community",
      desc: "Gathered in various believers homes as the early church did",
    },
    {
      year: "2026",
      title: "New Horizons",
      desc: "launching forward with the truth of God's word to reach out to lost souls",
    },
    {
      year: "2026",
      title: "A Legacy Continues",
      desc: "Celebrating as we grow in grace striving to follow our higher calling",
    },
  ];

  // useGSAP: Set up all scroll-based animations. Scoped to `container` for proper cleanup.
  useGSAP(
    () => {
      // ─── Animation 1: Vertical Timeline Line Drawing ───
      // The timeline line starts at 0% height and grows to 100% as the user scrolls.
      // `scrub: 1` means the animation is tied directly to the scrollbar position.
      gsap.fromTo(
        ".timeline-line",
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: ".history-section",
            start: "top center",      // Start when section top reaches viewport center.
            end: "bottom center",      // End when section bottom reaches viewport center.
            scrub: 1,                  // Smooth scrubbing — animation follows scroll position.
          },    
        },
      );

      // ─── Animation 2: Milestone Card Reveal ───
      // Each milestone card fades in and slides from left as it enters the viewport.
      const milestones = gsap.utils.toArray(".milestone-card");
      milestones.forEach((milestone) => {
        gsap.fromTo(
          milestone,
          { opacity: 0, x: -50 },      // Start invisible, 50px to the left.
          {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: milestone,
              start: "top 80%",         // Trigger when the card top is 80% down the viewport.
              // play → do nothing on leave → do nothing on re-enter → reverse on scroll back up
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // ─── Animation 3: Pastor Photo Pinning ───
      // Uses ScrollTrigger.create() to "pin" (make sticky) the pastor's image container.
      // The image stays fixed while the text content scrolls beside it.
      ScrollTrigger.create({
        trigger: ".pastor-section",       // The parent section that controls pin duration.
        start: "top top",                 // Start pinning when section top hits viewport top.
        end: "bottom bottom",             // Stop pinning when section bottom hits viewport bottom.
        pin: ".pastor-image-container",   // The element to pin (make sticky).
        scrub: true,
      });
    },
    { scope: container },   // Scope ensures cleanup when component unmounts.
  );

  return (
    <>
      <Navbar />
      <div
        ref={container}
        className="bg-[#1a1614] text-[#f0e6d2] overflow-hidden"
      >
        {/* ── Hero Section ── */}
        {/* Full-height hero with background image, gradient overlay, and centered title */}
        <div className="h-[70vh] relative flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 parallax-bg"
            style={{ backgroundImage: `url(${historyBg})` }}
          ></div>
          {/* Gradient overlay: transparent in the middle, dark at top and bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1614]/20 via-transparent to-[#1a1614]"></div>

          <div className="relative z-10 text-center px-4">
            <h1 className="text-6xl md:text-9xl font-serif text-[#c5a059] opacity-90 drop-shadow-2xl mb-4">
              OUR STORY
            </h1>
            <p className="text-xl md:text-2xl font-serif max-w-2xl mx-auto italic opacity-80">
              "Built on Faith, Growing in Grace."
            </p>
          </div>
        </div>

        {/* ── History Timeline Section ── */}
        {/* Vertical timeline with alternating left/right milestone cards */}
        <div className="history-section py-32 px-4 md:px-24 mx-auto max-w-6xl relative">
          <h2 className="text-4xl md:text-6xl font-serif text-[#c5a059] mb-24 text-center">
            Thinking Back
          </h2>

          <div className="relative border-l md:border-l-0 md:pl-0 pl-8 ml-4 md:ml-0">
            {/* Central Line for Desktop — the line that "draws" as you scroll */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#c5a059]/30 -translate-x-1/2">
              <div className="timeline-line w-full bg-[#c5a059] shadow-[0_0_10px_#c5a059]"></div>
            </div>

                        {/* Map through history events to create alternating timeline cards */}
                        {historyEvents.map((event, i) => (
                            <div key={i} className={`milestone-card md:flex items-center justify-between mb-24 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                
                                {/* Center Dot — the gold circle on the timeline line */}
                                <div className="absolute left-[-2.35rem] md:left-1/2 top-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-4 h-4 bg-[#c5a059] rounded-full border-4 border-[#1a1614] z-10"></div>

                                <div className="hidden md:block w-5/12"></div> {/* Spacer for alternating layout */}

                                {/* Milestone Card Content */}
                                <div className="w-full md:w-5/12 bg-brand-red/10 border border-brand-red/20 p-8 rounded-2xl backdrop-blur-sm hover:bg-brand-red/20 transition-all duration-500">
                                    {/* Large watermark year in background */}
                                    <span className="text-[#c5a059] font-bold text-5xl font-serif opacity-30 absolute top-4 right-6 pointer-events-none">
                                        {event.year}
                                    </span>
                                    <h3 className="text-2xl font-serif text-[#f0e6d2] mb-4 relative z-10">{event.title}</h3>
                                    <p className="text-brand-dark/70 leading-relaxed relative z-10">
                                        {event.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Pastor & Family Section ── */}
                {/* Split layout: Left side = pinned (sticky) photo, Right side = scrolling text */}
                <div className="pastor-section min-h-screen flex flex-col md:flex-row bg-brand-dark text-[#1a1614] relative">
                    
                    {/* Sticky Image Side — gets pinned by ScrollTrigger */}
                    <div className="pastor-image-container w-full md:w-1/2 h-[50vh] md:h-screen md:sticky md:top-0 overflow-hidden relative">
                        <img 
                            src={pastorImg} 
                            alt="Pastor" 
                            className="w-full h-full object-scale-down grayscale contrast-125 sepia-[.2]"
                        />
                        {/* Red color overlay using CSS mix-blend-mode */}
                        <div className="absolute inset-0 bg-brand-red mix-blend-multiply opacity-20"></div>
                        {/* Name overlay at bottom-left of the image */}
                        <div className="absolute bottom-12 left-12">
                            <h2 className="text-5xl md:text-7xl font-serif text-white leading-none mb-2">
                                Pastor Jonah Chowri
                            </h2>
                            <p className="text-xl font-serif italic text-white/70">Senior Pastor</p>
                        </div>
                    </div>

                    {/* Scrolling Content Side — scrolls normally while photo is pinned */}
                    <div className="w-full md:w-1/2 p-12 md:p-32 flex flex-col justify-center">
                        <h3 className="text-brand-red font-bold uppercase tracking-widest mb-8 text-sm">Shepherd & Leader</h3>
                        <p className="text-2xl md:text-3xl font-serif leading-relaxed mb-8">
                            "It is my greatest privilege to walk alongside this community as we seek God's face together."
                        </p>
                        <div className="prose prose-lg prose-stone text-brand-beige/80 font-serif">
                            <p className="mb-6">
                                Pastor Jonah Chowri has served as the Pastor of Resurrection Baptist Church since 2025. With a heart for expository preaching and community outreach, he has led the church for transformative growth.
                            </p>
                            <p className="mb-6">
                                Before arriving here, Pastor Jonah served in Heritage Baptist Church, Bengaluru where he learnt the truth of God's word and the need for a local church. He holds a Bachelors in Theology from HBBC.
                            </p>
                            <p>
                                He and his wife, Priya, have been married for 2 years. When not in the pulpit, you can find Jonah travelling and enjoying a good cup of coffee with family and friends.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    );
};

export default AboutPage;
