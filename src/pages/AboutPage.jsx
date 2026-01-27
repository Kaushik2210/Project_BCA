import React, { useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import historyBg from '../assets/hero-church-epic.png';
import pastorImg from '../assets/ministry-1.png'; // Placeholder
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
    const container = useRef();
    const timelineRef = useRef();

    const historyEvents = [
        { year: "1985", title: "The Foundation", desc: "Started in a small living room with just 12 families dedicated to prayer." },
        { year: "1998", title: "Growing Community", desc: "Moved to our first permanent building as membership exceeded 200 congregants." },
        { year: "2010", title: "New Horizons", desc: "launched our global outreach program, partnering with missions in 5 continents." },
        { year: "2024", title: "A Legacy Continues", desc: "Celebrating nearly 40 years of grace, we continue to build for the next generation." },
    ];

    useGSAP(() => {
        // Line Drawing Animation
        gsap.fromTo(".timeline-line", 
            { height: "0%" },
            { 
                height: "100%", 
                ease: "none",
                scrollTrigger: {
                    trigger: ".history-section",
                    start: "top center",
                    end: "bottom center",
                    scrub: 1
                }
            }
        );

        // Milestone Reveal
        const milestones = gsap.utils.toArray('.milestone-card');
        milestones.forEach((milestone) => {
            gsap.fromTo(milestone, 
                { opacity: 0, x: -50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: milestone,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Pastor Section Pinning
        ScrollTrigger.create({
            trigger: ".pastor-section",
            start: "top top",
            end: "bottom bottom",
            pin: ".pastor-image-container",
            scrub: true,
            // markers: true // for debugging
        });

    }, { scope: container });

    return (
        <>
            <Navbar />
            <div ref={container} className="bg-[#1a1614] text-[#f0e6d2] overflow-hidden">
                
                {/* Hero */}
                <div className="h-[70vh] relative flex items-center justify-center overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40 parallax-bg"
                        style={{ backgroundImage: `url(${historyBg})` }}
                    ></div>
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

                {/* History Timeline */}
                <div className="history-section py-32 px-4 md:px-24 mx-auto max-w-6xl relative">
                    <h2 className="text-4xl md:text-6xl font-serif text-[#c5a059] mb-24 text-center">Thinking Back</h2>
                    
                    <div className="relative border-l md:border-l-0 md:pl-0 pl-8 ml-4 md:ml-0">
                        {/* Central Line for Desktop */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#c5a059]/30 -translate-x-1/2">
                            <div className="timeline-line w-full bg-[#c5a059] shadow-[0_0_10px_#c5a059]"></div>
                        </div>

                        {historyEvents.map((event, i) => (
                            <div key={i} className={`milestone-card md:flex items-center justify-between mb-24 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                
                                {/* Center Dot */}
                                <div className="absolute left-[-2.35rem] md:left-1/2 top-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-4 h-4 bg-[#c5a059] rounded-full border-4 border-[#1a1614] z-10"></div>

                                <div className="hidden md:block w-5/12"></div> {/* Spacer */}

                                <div className="w-full md:w-5/12 bg-[#c5a059]/10 border border-[#c5a059]/20 p-8 rounded-2xl backdrop-blur-sm hover:bg-[#c5a059]/20 transition-all duration-500">
                                    <span className="text-[#c5a059] font-bold text-5xl font-serif opacity-30 absolute top-4 right-6 pointer-events-none">
                                        {event.year}
                                    </span>
                                    <h3 className="text-2xl font-serif text-[#f0e6d2] mb-4 relative z-10">{event.title}</h3>
                                    <p className="text-[#f0e6d2]/70 leading-relaxed relative z-10">
                                        {event.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pastor & Family Section */}
                <div className="pastor-section min-h-screen flex flex-col md:flex-row bg-[#f0e6d2] text-[#1a1614] relative">
                    
                    {/* Sticky Image Side */}
                    <div className="pastor-image-container w-full md:w-1/2 h-[50vh] md:h-screen md:sticky md:top-0 overflow-hidden relative">
                        <img 
                            src={pastorImg} 
                            alt="Pastor" 
                            className="w-full h-full object-cover grayscale contrast-125 sepia-[.2]"
                        />
                        <div className="absolute inset-0 bg-[#c5a059] mix-blend-multiply opacity-20"></div>
                        <div className="absolute bottom-12 left-12">
                            <h2 className="text-5xl md:text-7xl font-serif text-[#1a1614] leading-none mb-2">
                                Rev. Michael <br/> Johnson
                            </h2>
                            <p className="text-xl font-serif italic text-[#1a1614]/70">Senior Pastor</p>
                        </div>
                    </div>

                    {/* Scrolling Content Side */}
                    <div className="w-full md:w-1/2 p-12 md:p-32 flex flex-col justify-center">
                        <h3 className="text-[#c5a059] font-bold uppercase tracking-widest mb-8 text-sm">Shepherd & Leader</h3>
                        <p className="text-2xl md:text-3xl font-serif leading-relaxed mb-8">
                            "It is my greatest privilege to walk alongside this community as we seek God's face together."
                        </p>
                        <div className="prose prose-lg prose-stone text-[#1a1614]/80 font-serif">
                            <p className="mb-6">
                                Reverend Michael Johnson has served as the Senior Pastor of Resurrection Baptist Church since 2012. With a heart for expository preaching and community outreach, he has led the church through a decade of transformative growth.
                            </p>
                            <p className="mb-6">
                                Before arriving here, Michael served in mission fields across South America, an experience that deeply shaped his understanding of the global church. He holds a Masters of Divinity from Grace Theological Seminary.
                            </p>
                            <p>
                                He and his wife, Sarah, have been married for 25 years and are proud parents to three children. When not in the pulpit, you can find Michael hiking the local trails or enjoying a good cup of coffee with new friends.
                            </p>
                        </div>
                        
                        <div className="mt-16 pt-8 border-t border-[#1a1614]/10">
                            <img src={historyBg} alt="Family Signature" className="h-16 w-auto opacity-50 mix-blend-multiply" /> 
                            {/* Ideally a signature image, reusing background as placeholder for texture */}
                        </div>
                    </div>

                </div>

            </div>
            <Footer />
        </>
    );
};

export default AboutPage;
