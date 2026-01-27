import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import sermonsBg from '../assets/sermons-bg.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SermonsPage = () => {
    const container = useRef();
    
    // Mock Data
    const sermonTitles = [
        "Walking in Faith", "The Power of Prayer", "Grace Abounding", 
        "Finding Peace", "The Sermon on the Mount", "Living with Purpose",
        "Divine  Intervention", "Hope in Darkness", "The Prodigal Son", 
        "Fruit of the Spirit", "Armor of God", "Love Thy Neighbor"
    ];
    
    const speakers = [
        "Rev. Michael Johnson", "Pastor Sarah Williams", "Dr. David Clark", "Bishop Thomas Green"
    ];

    const allSermons = Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      title: sermonTitles[i % sermonTitles.length],
      speaker: speakers[i % speakers.length],
      date: `Feb ${Math.floor(Math.random() * 28) + 1}, 2026`,
      series: i % 3 === 0 ? "Foundations of Grace" : i % 3 === 1 ? "Kingdom Living" : "Wisdom for Today",
      duration: `${30 + (i % 30)}:00`,
      audioUrl: `/audio/sermon-${i + 1}.mp3`, // Placeholder for real audio
      isPlaying: false 
    }));

    // Mock Audio Playback State
    const [playingId, setPlayingId] = useState(null);

    const togglePlay = (id) => {
        if (playingId === id) {
            setPlayingId(null); // Pause
        } else {
            setPlayingId(id); // Play new
        }
    };
    
    // Pagination Logic with Bounds Checking
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(allSermons.length / itemsPerPage);
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSermons = allSermons.slice(indexOfFirstItem, indexOfLastItem);

    // Simplied GSAP Animation (No Opacity Hiding to prevent blank screen)
    useGSAP(() => {
        gsap.from(".sermon-card", {
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all"
        });
    }, { scope: container, dependencies: [currentPage] });

    return (
        <>
            <Navbar />
            <div ref={container} className="min-h-screen bg-[#1a1614] text-[#f0e6d2] relative overflow-hidden">
                
                {/* Fixed Parallax Background */}
                <div 
                  className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url(${sermonsBg})` }}
                ></div>

                <div className="pt-40 px-8 pb-24 relative z-10 max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-20">
                        <h1 className="text-6xl md:text-8xl font-serif mb-8 text-[#c5a059] opacity-90 drop-shadow-2xl overflow-hidden">
                            SERMONS ARCHIVE
                        </h1>
                        <p className="text-xl md:text-2xl font-serif text-[#f0e6d2]/80 leading-relaxed italic max-w-2xl mx-auto border-t border-b border-[#c5a059]/30 py-6">
                            "Listen to the word of God, anytime, anywhere."
                        </p>
                    </div>

                    {/* Audio Grid */}
                    <div className="sermons-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                        {currentSermons.map((sermon) => {
                            const isPlaying = playingId === sermon.id;
                            return (
                                <div key={sermon.id} className={`sermon-card group bg-[#1a1614]/80 backdrop-blur-md border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(197,160,89,0.15)] flex flex-col h-full min-h-[350px] ${isPlaying ? 'border-[#c5a059] ring-1 ring-[#c5a059]/50' : 'border-[#c5a059]/20 hover:border-[#c5a059]'}`}>
                                    
                                    {/* Top Metadata */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[#c5a059] text-xs font-bold uppercase tracking-widest border border-[#c5a059]/30 px-3 py-1 rounded-full">{sermon.series}</span>
                                            <span className="text-[#f0e6d2]/50 text-xs font-serif whitespace-nowrap ml-2">{sermon.date}</span>
                                        </div>
                                        <h3 className="text-2xl font-serif text-[#f0e6d2] mb-3 group-hover:text-[#c5a059] transition-colors leading-tight">
                                            {sermon.title}
                                        </h3>
                                        <p className="text-[#f0e6d2]/70 text-sm font-serif italic mb-6">
                                            {sermon.speaker}
                                        </p>
                                    </div>

                                    {/* Audio Visualizer & Player UI */}
                                    <div className="bg-black/30 rounded-2xl p-4 border border-[#c5a059]/10 group-hover:border-[#c5a059]/30 transition-colors mt-auto">
                                        {/* Fake Waveform - Animated when playing */}
                                        <div className="flex justify-between items-center h-8 mb-4 gap-1 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            {Array.from({ length: 20 }).map((_, i) => (
                                                <div key={i} 
                                                     className="w-1 bg-[#c5a059] rounded-full transition-all duration-500" 
                                                     style={{ 
                                                         height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                                                         animation: isPlaying ? `wave 0.5s infinite ease-in-out ${i * 0.05}s alternate` : 'none'
                                                     }}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => togglePlay(sermon.id)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-[#1a1614] hover:scale-110 transition-transform shadow-lg pl-1 shrink-0 ${isPlaying ? 'bg-[#f0e6d2]' : 'bg-[#c5a059]'}`}
                                            >
                                                {isPlaying ? (
                                                    <span className="text-lg font-bold pr-1">||</span> 
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="h-1 bg-[#f0e6d2]/20 rounded-full overflow-hidden w-full">
                                                    <div className={`h-full bg-[#c5a059] transition-all duration-300 ${isPlaying ? 'w-2/3 animate-pulse' : 'w-0'}`}></div>
                                                </div>
                                            </div>
                                            <span className="text-[#c5a059] text-xs font-mono shrink-0">{isPlaying ? "12:34" : sermon.duration}</span>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 relative z-20 select-none">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-6 py-2 rounded-full font-serif font-bold text-[#c5a059] border border-[#c5a059]/30 hover:bg-[#c5a059]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            &larr; Prev
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`w-10 h-10 rounded-full font-serif font-bold border transition-all duration-300 flex items-center justify-center
                                        ${currentPage === i + 1 
                                            ? 'bg-[#c5a059] text-[#1a1614] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.3)] scale-110' 
                                            : 'bg-transparent text-[#c5a059] border-[#c5a059]/30 hover:border-[#c5a059] hover:bg-[#c5a059]/5'
                                        }
                                    `}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-6 py-2 rounded-full font-serif font-bold text-[#c5a059] border border-[#c5a059]/30 hover:bg-[#c5a059]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SermonsPage;
