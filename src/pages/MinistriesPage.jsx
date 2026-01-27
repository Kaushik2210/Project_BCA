import React, { useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import img1 from '../assets/ministry-1.png';
import img2 from '../assets/ministry-2.png';
import img3 from '../assets/ministry-3.png';
import glassBg from '../assets/ministries-stained-glass.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MinistriesPage = () => {
    const container = useRef();

    const ministries = [
        { 
            id: 1,
            name: 'Youth Ministry', 
            role: 'Empowering the Next Generation', 
            desc: "Our Youth Ministry is a vibrant community where young people can grow in their faith, build lasting friendships, and discover their God-given purpose. Through weekly gatherings, retreats, and service projects, we guide teens to become bold disciples of Christ.",
            img: img1,
            color: "#c5a059"
        },
        { 
            id: 2,
            name: 'Outreach & Missions', 
            role: 'Serving Our Community & World', 
            desc: "We believe faith is active. Our Outreach team organizes local food drives, homeless shelter support, and global mission trips. We are committed to being the hands and feet of Jesus, spreading hope and tangible love to those in need.",
            img: img2,
            color: "#f0e6d2"
        },
        { 
            id: 3,
            name: 'Education & Discipleship', 
            role: 'Deepening Knowledge & Spirit', 
            desc: "From Sunday School for kids to Theology classes for adults, our Education department ensures everyone has the tools to understand scripture deeply. We foster a culture of lifelong learning and spiritual maturity.",
            img: img3,
            color: "#c5a059"
        },
    ];

    useGSAP(() => {
        const sections = gsap.utils.toArray('.ministry-section');
        
        sections.forEach((section, i) => {
            const img = section.querySelector('.ministry-img');
            const text = section.querySelector('.ministry-text');
            
            // Image Parallax
            gsap.fromTo(img, 
                { yPercent: -20, scale: 1.1 },
                { 
                    yPercent: 20, 
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );

            // Text Reveal
            gsap.fromTo(text,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 60%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

    }, { scope: container });

    return (
        <>
            <Navbar />
            <div ref={container} className="bg-[#1a1614] text-[#f0e6d2] overflow-hidden">
                
                {/* Fixed Background */}
                <div 
                  className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                  style={{ backgroundImage: `url(${glassBg})` }}
                ></div>

                {/* Hero Header */}
                <div className="h-[60vh] flex flex-col justify-center items-center text-center px-8 pt-20 relative z-10">
                    <h1 className="text-6xl md:text-9xl font-serif text-[#c5a059] opacity-90 drop-shadow-2xl mb-6">
                        MINISTRIES
                    </h1>
                    <p className="text-xl md:text-2xl font-serif text-[#f0e6d2]/80 max-w-2xl italic border-y border-[#c5a059]/30 py-6">
                        "For even the Son of Man came not to be served but to serve."
                    </p>
                </div>

                {/* Ministry Sections */}
                <div className="px-4 md:px-12 pb-24 relative z-10">
                    {ministries.map((min, i) => (
                        <div key={min.id} className="ministry-section min-h-screen py-24 flex flex-col md:flex-row items-center gap-12 md:gap-24 sticky top-0 bg-[#1a1614]/95 backdrop-blur-sm border-t border-[#c5a059]/20">
                            
                            {/* Image Side - Alternating */}
                            <div className={`w-full md:w-1/2 h-[50vh] md:h-[70vh] overflow-hidden rounded-[2rem] border border-[#c5a059]/30 relative group ${i % 2 === 1 ? 'md:order-last' : ''}`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                <img 
                                    src={min.img} 
                                    alt={min.name} 
                                    className="ministry-img w-full h-full object-cover"
                                />
                            </div>

                            {/* Text Side */}
                            <div className="ministry-text w-full md:w-1/2">
                                <span className="text-[#c5a059] text-sm font-bold uppercase tracking-[0.3em] mb-4 block">
                                    0{min.id} — Service
                                </span>
                                <h2 className="text-5xl md:text-7xl font-serif text-[#f0e6d2] mb-6 leading-tight">
                                    {min.name}
                                </h2>
                                <h3 className="text-2xl md:text-3xl font-serif text-[#c5a059] mb-8 italic opacity-80">
                                    {min.role}
                                </h3>
                                <p className="text-lg md:text-xl text-[#f0e6d2]/70 leading-relaxed mb-12 max-w-xl">
                                    {min.desc}
                                </p>
                                
                                {/* Mini Gallery */}
                                <div className="grid grid-cols-3 gap-4 mb-8 opacity-80">
                                    {[min.img, img1, img2, img3].slice(0, 3).map((galleryImg, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-[#c5a059]/20 hover:border-[#c5a059] transition-colors">
                                            <img src={galleryImg} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>

                                <button className="px-8 py-4 border border-[#c5a059] text-[#c5a059] font-bold uppercase tracking-widest hover:bg-[#c5a059] hover:text-[#1a1614] transition-all duration-300 rounded-full">
                                    Get Involved
                                </button>
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
