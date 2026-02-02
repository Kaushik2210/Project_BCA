import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import sermonsBg from '../assets/sermons-bg.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SermonsPage = () => {
    const container = useRef();
    
    // Real data state
    const [sermons, setSermons] = useState([]);
    const [playingId, setPlayingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [totalPages, setTotalPages] = useState(1);
    const audioRefs = useRef({});

   

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Fetch sermons from backend (paginated)
    const fetchSermons = async (page = 1) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/sermons?page=${page}&limit=${itemsPerPage}`);
            if (!res.ok) throw new Error('Failed to load sermons');
            const json = await res.json();
            const data = json.data || {};
            setSermons(data.sermons || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            console.error('Error fetching sermons:', err);
        }
    };

    useEffect(() => {
        fetchSermons(currentPage);
    }, [currentPage]);

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
            <div ref={container} className="min-h-screen bg-brand-beige text-brand-dark relative overflow-hidden">
                
                {/* Fixed Parallax Background */}
                <div 
                  className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url(${sermonsBg})` }}
                ></div>

                <div className="pt-40 px-8 pb-24 relative z-10 max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-20">
                        <h1 className="text-6xl md:text-8xl font-serif mb-8 text-brand-red opacity-90 drop-shadow-2xl overflow-hidden">
                            SERMONS ARCHIVE
                        </h1>
                        <p className="text-xl md:text-2xl font-serif text-brand-dark/80 leading-relaxed italic max-w-2xl mx-auto border-t border-b border-brand-red/30 py-6">
                            "Listen to the word of God, anytime, anywhere."
                        </p>
                    </div>

                    {/* Audio Grid */}
                    <div className="sermons-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                        {sermons.map((sermon) => {
                            const isPlaying = playingId === sermon._id;
                            return (
                                <div key={sermon._id} className={`sermon-card group bg-brand-beige/80 backdrop-blur-md border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(197,160,89,0.15)] flex flex-col h-full min-h-87.5 ${isPlaying ? 'border-brand-red ring-1 ring-brand-red/50' : 'border-brand-red/20 hover:border-brand-red/50'}`}>
                                    
                                    {/* Top Metadata */}
                                    <div className="grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-brand-red text-xs font-bold uppercase tracking-widest border border-brand-red/30 px-3 py-1 rounded-full">{sermon.series}</span>
                                            <span className="text-brand-dark/50 text-xs font-serif whitespace-nowrap ml-2">{/* date not provided */}</span>
                                        </div>
                                        <h3 className="text-2xl font-serif text-brand-dark mb-3 group-hover:text-brand-red transition-colors leading-tight text-wrap line-clamp-2">
                                            {sermon.title}
                                        </h3>
                                        <p className="text-brand-dark/70 text-sm font-serif italic mb-6">
                                            {sermon.description}
                                        </p>
                                    </div>

                                    {/* Audio Visualizer & Player UI */}
                                    <div className="bg-black/30 rounded-2xl p-4 border border-brand-red/10 group-hover:border-brand-red/30 transition-colors mt-auto">
                                        {/* Fake Waveform - Animated when playing */}
                                        <div className="flex justify-between items-center h-8 mb-4 gap-1 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            {Array.from({ length: 20 }).map((_, i) => (
                                                <div key={i} 
                                                     className="w-1 bg-brand-red rounded-full transition-all duration-500" 
                                                     style={{ 
                                                         height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                                                         animation: isPlaying ? `wave 0.5s infinite ease-in-out ${i * 0.05}s alternate` : 'none'
                                                     }}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Audio player */}
                                        <div className="flex items-center gap-4">
                                            <audio
                                                ref={(el) => { if (el) audioRefs.current[sermon._id] = el }}
                                                src={sermon.sermon_url}
                                                controls
                                                className="w-full"
                                                preload="none"
                                                onPlay={() => {
                                                    // pause any other playing audio
                                                    Object.keys(audioRefs.current).forEach(key => {
                                                        if (key !== sermon._id && audioRefs.current[key] && !audioRefs.current[key].paused) {
                                                            audioRefs.current[key].pause(); 
                                                        }
                                                    });
                                                    setPlayingId(sermon._id);
                                                }}
                                                onPause={() => {
                                                    const el = audioRefs.current[sermon._id];
                                                    if (el && el.paused) setPlayingId(null);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* audio element is rendered above with controls */}

                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 relative z-20 select-none">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-6 py-2 rounded-full font-serif font-bold text-brand-red border border-brand-red/30 hover:bg-brand-red/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
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
                                            ? 'bg-brand-red text-brand-beige border-brand-red shadow-[0_0_15px_rgba(197,160,89,0.3)] scale-110' 
                                            : 'bg-transparent text-brand-red border-brand-red/30 hover:border-brand-red hover:bg-brand-red/5'
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
                            className={`px-6 py-2 rounded-full font-serif font-bold text-brand-red border border-brand-red/30 hover:bg-brand-red/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
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
