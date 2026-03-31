// Import React hooks for state, refs, and side effects.
import React, { useState, useRef, useEffect } from 'react';
// Import layout components shared across pages.
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// Import background image asset for the page.
import sermonsBg from '../assets/sermons-bg.png';
// Import GSAP animation libraries.
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger so GSAP can use scroll-based animations.
gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// SermonsPage — A dedicated archive page for browsing all sermons with pagination.
// Features: Paginated API fetching, audio playback with waveform UI, GSAP animations.
// =========================================================================
const SermonsPage = () => {
    // Ref for the main container — scopes GSAP animations to this component only.
    const container = useRef();
    
    // State for the list of sermons fetched from the backend.
    const [sermons, setSermons] = useState([]);
    // Tracks which sermon's audio player is currently playing (by its MongoDB _id).
    const [playingId, setPlayingId] = useState(null);
    // Loading state for showing a loading indicator during API fetch.
    const [loading, setLoading] = useState(true);
    // Error state for displaying error messages if the fetch fails.
    const [error, setError] = useState(null);
    // Current page number for pagination (1-indexed).
    const [currentPage, setCurrentPage] = useState(1);
    // Number of sermons displayed per page.
    const itemsPerPage = 6;
    // Total number of pages received from the backend pagination data.
    const [totalPages, setTotalPages] = useState(1);
    // A ref object that stores references to all <audio> DOM elements by their sermon _id.
    // This allows us to pause other audio players when a new one starts playing.
    const audioRefs = useRef({});
    // Backend API base URL, with fallback for local development.
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Handle page changes: validates the new page number, updates state, and scrolls to top.
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Smooth scroll to the top of the page so the user sees the new sermons from the start.
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Fetch sermons from the backend API with pagination parameters.
    const fetchSermons = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            // Send a GET request with query parameters for page number and items per page.
            const res = await fetch(`${backendUrl}/api/v1/sermons?page=${page}&limit=${itemsPerPage}`);
            // If the HTTP status is not 2xx, throw an error.
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            // Parse the JSON response body.
            const json = await res.json();
            const data = json.data || {};
            
            // Update state with the array of sermons and pagination metadata.
            setSermons(data.sermons || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            // Store the error message for display in the UI.
            setError(err.message || 'Failed to load sermons');
        } finally {
            // Always stop the loading spinner regardless of success or failure.
            setLoading(false);
        }
    };

    // useEffect: Fetch sermons whenever the currentPage changes.
    // This makes pagination reactive — clicking a page button triggers a new fetch.
    useEffect(() => {
        fetchSermons(currentPage);
    }, [currentPage]);

    // GSAP animation: Slide up each sermon card when the page loads or changes.
    useGSAP(() => {
        gsap.from(".sermon-card", {
            y: 30,             // Start 30px below normal position.
            duration: 0.8,     // Animation takes 0.8 seconds.
            stagger: 0.1,      // Each card starts 0.1s after the previous one.
            ease: "power2.out", // Smooth deceleration.
            clearProps: "all"   // Remove all GSAP-set inline styles after animation completes,
                                // preventing them from conflicting with CSS hover effects.
        });
    }, { scope: container, dependencies: [currentPage] }); // Re-run animation on page change.

    return (
        <>
            <Navbar />
            <div ref={container} className="min-h-screen bg-brand-beige text-brand-dark relative overflow-hidden">
                
                {/* Fixed low-opacity background image for subtle texture */}
                <div 
                  className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url(${sermonsBg})` }}
                ></div>

                <div className="pt-40 px-8 pb-24 relative z-10 max-w-7xl mx-auto">
                    
                    {/* Page Header */}
                    <div className="text-center mb-20">
                        <h1 className="text-6xl md:text-8xl font-serif mb-8 text-brand-red opacity-90 drop-shadow-2xl overflow-hidden">
                            SERMONS ARCHIVE
                        </h1>
                        <p className="text-xl md:text-2xl font-serif text-brand-dark/80 leading-relaxed italic max-w-2xl mx-auto border-t border-b border-brand-red/30 py-6">
                            "Listen to the word of God, anytime, anywhere."
                        </p>
                    </div>

                    {/* Sermon Cards Grid */}
                    <div className="sermons-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 min-h-100">
                        {/* Show loading text while fetching data */}
                        {loading && (
                            <div className="col-span-full flex justify-center items-center">
                                <div className="text-brand-red font-serif text-xl animate-pulse">
                                    Loading sermons...
                                </div>
                            </div>
                        )}
                        
                        {/* Show error card with retry button if fetch failed */}
                        {error && (
                            <div className="col-span-full flex justify-center items-center">
                                <div className="bg-brand-beige border border-brand-red/30 rounded-3xl p-10 shadow-xl text-center max-w-md w-full">
                                    <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mx-auto mb-5">
                                        <span className="text-brand-red text-2xl font-bold">!</span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-brand-red mb-3">
                                        Unable to Load Sermons
                                    </h3>
                                    <p className="text-brand-dark/70 text-sm mb-6">
                                        Something went wrong while fetching the sermons.
                                    </p>
                                    <button
                                        onClick={() => fetchSermons(currentPage)}
                                        className="px-6 py-2 rounded-full font-serif font-bold text-brand-beige bg-brand-red hover:opacity-90 transition-opacity"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Render sermon cards when data is loaded successfully */}
                        {!loading && !error && sermons.map((sermon) => {
                            // Check if this specific sermon is the one currently playing audio.
                            const isPlaying = playingId === sermon._id;
                            return (
                                <div key={sermon._id} className={`sermon-card group bg-brand-beige/80 backdrop-blur-md border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(197,160,89,0.15)] flex flex-col h-full min-h-87.5 ${isPlaying ? 'border-brand-red ring-1 ring-brand-red/50' : 'border-brand-red/20 hover:border-brand-red/50'}`}>
                                    
                                    {/* Top Section: Title and Description */}
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

                                    {/* Bottom Section: Audio Player with Waveform Visualization */}
                                    <div className="bg-black/30 rounded-2xl p-4 border border-brand-red/10 group-hover:border-brand-red/30 transition-colors mt-auto">
                                        {/* Decorative Waveform Bars — animated when this sermon is playing */}
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

                                        {/* Native HTML5 Audio Player */}
                                        <div className="flex items-center gap-4">
                                            <audio
                                                // Store a reference to this audio element in our audioRefs object by sermon ID.
                                                ref={(el) => { if (el) audioRefs.current[sermon._id] = el }}
                                                src={sermon.sermon_url}
                                                controls
                                                className="w-full"
                                                preload="none" // Don't preload audio until user clicks play (saves bandwidth).
                                                onPlay={() => {
                                                    // When this audio starts playing, pause ALL other playing audios.
                                                    Object.keys(audioRefs.current).forEach(key => {
                                                        if (key !== sermon._id && audioRefs.current[key] && !audioRefs.current[key].paused) {
                                                            audioRefs.current[key].pause(); 
                                                        }
                                                    });
                                                    // Track which sermon is currently playing for UI highlighting.
                                                    setPlayingId(sermon._id);
                                                }}
                                                onPause={() => {
                                                    // When paused, clear the playing state.
                                                    const el = audioRefs.current[sermon._id];
                                                    if (el && el.paused) setPlayingId(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-4 relative z-20 select-none">
                        {/* Previous Page Button */}
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-6 py-2 rounded-full font-serif font-bold text-brand-red border border-brand-red/30 hover:bg-brand-red/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            &larr; Prev
                        </button>

                        {/* Page Number Buttons — dynamically generated based on totalPages */}
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

                        {/* Next Page Button */}
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
