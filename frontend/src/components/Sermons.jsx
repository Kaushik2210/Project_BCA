import React, { useRef, useEffect, useState } from 'react';
import sermonsBg from '../assets/sermons-bg.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Sermons = () => {
  // Reference to the main container for GSAP scoping
  const container = useRef();
  
  // State variables for managing data fetching lifecycle
  const [sermons, setSermons] = useState([]); // Stores the fetched sermons
  const [loading, setLoading] = useState(true); // Tracks if the fetch is still in progress
  const [error, setError] = useState(null); // Stores any error that occurs during fetch
  
  // Base URL for API requests, falls back to localhost if environment variable is missing
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Sub-component used explicitly to display a single sermon's data cleanly
  const SermonCard = ({ sermon, className }) => {
    const date = sermon?.createdAt ? new Date(sermon.createdAt).toLocaleDateString() : '';
    return (
      <div className={`bg-[#F5F5DC] p-6 rounded-4xl shadow-xl w-full max-w-sm mx-auto z-10 relative group hover:-translate-y-2 transition-transform duration-300 ${className}`}>
        <h4 className="text-[#3E2F26] text-xl font-serif font-bold mb-1">{sermon?.title || 'Untitled'}</h4>
        {/* <p className="text-gray-600 text-sm mb-4">{sermon?.duration || ''} • {date}</p> */}
        <p className="text-gray-700 text-xs leading-relaxed mb-6">
          {sermon?.description || ''}
        </p>

        {/* Audio Player */}
        {sermon?.sermon_url ? (
          <audio controls className="w-full">
            <source src={sermon.sermon_url} />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div className="text-sm text-gray-500">No audio available</div>
        )}
      </div>
    );
  };

  // React hook to run the fetch operation side-effect
  useEffect(() => {
    let mounted = true; // Boolean flag to prevent state updates if the component unmounts mid-fetch
    
    // Async function containing the fetch logic
    const fetchSermons = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch up to 4 sermons using pagination parameters
        const res = await fetch(`${backendUrl}/api/v1/sermons?limit=4&page=1`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const body = await res.json();
        // Handle varying API response structures gracefully
        const data = body?.data?.sermons || body?.sermons || [];
        
        // Update state with up to 4 sermons, but only if the component is still visible
        if (mounted) setSermons(data.slice(0, 4));
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load sermons');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSermons(); // Execute the fetch
    
    // Cleanup function runs on unmount
    return () => { mounted = false; };
  }, []); // Run effect only once on mount

  // GSAP animation definitions
  useGSAP(() => {
    if (loading) return; // Wait until DOM elements actually exist

    // Parallax Effect: Move odd and even columns at different speeds
    // This creates an uneven scrolling effect where one side moves faster, adding depth
    
    // Column 1 (Odd items) moves upward at scrub speed 1
    gsap.to(".sermon-col-1", {
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".sermon-grid", // Links animation to the grid container
        start: "top bottom",     // Starts when top of grid hits bottom of screen
        end: "bottom top",       // Ends when bottom of grid leaves top of screen
        scrub: 1                 // Links animation specifically to the user's scrollbar
      }
    });

    // Column 2 (Even items) moves exactly the same but we could change the `y` here to make it move faster
    gsap.to(".sermon-col-2", {
      y: -50, 
      ease: "none",
      scrollTrigger: {
        trigger: ".sermon-grid",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.from(".sermon-header", {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%"
      }
    });

  }, { scope: container, dependencies: [loading] });

  return (
    <div ref={container} id="sermons" className="relative w-full py-20 overflow-hidden">
      {/* Background */}
      <div 
          className="absolute inset-0 bg-cover bg-center fixed-bg-hack" // Fixed bg hack if needed
          style={{ backgroundImage: `url(${sermonsBg})`, backgroundAttachment: 'fixed' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="sermon-header text-[#F5E6D3] text-6xl md:text-8xl font-serif text-center mb-16 drop-shadow-lg">
            Sermons
          </h2>

          <div className="sermon-grid grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 min-h-75">
              {loading && (
                  <div className="col-span-full flex items-center justify-center text-white">
                    Loading...
                  </div>
              )}
              
              {error && (
                <div className="col-span-full flex items-center justify-center">
                  <div className="bg-[#F5F5DC] border border-red-300 text-[#3E2F26] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center animate-fade-in">
                    <div className="bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      !
                    </div>
                    
                    <h4 className="text-xl font-serif font-bold mb-2">
                      Unable to Load Sermons
                    </h4>

                    <p className="text-sm text-gray-700 mb-4">
                      Please check your connection and try again.
                    </p>

                    <p className="text-xs text-gray-500 mb-6">
                      {error}
                    </p>

                    <button
                      onClick={() => window.location.reload()}
                      className="bg-[#3E2F26] text-white px-6 py-2 rounded-full text-sm hover:bg-[#2c211b] transition-colors duration-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {!loading && !error && (
                <>
                  <div className="sermon-col-1 flex flex-col gap-8">
                    {sermons.slice(0,2).map((s) => (
                      <SermonCard key={s._id} sermon={s} />
                    ))}
                  </div>
                  
                  <div className="sermon-col-2 flex flex-col gap-8 pt-12 md:pt-0">
                    {sermons.slice(2,4).map((s) => (
                      <SermonCard key={s._id} sermon={s} />
                    ))}
                  </div>
                </>
              )}
          </div>
  
          <div className="text-center mt-12 relative z-20">
              <h3 className="text-[#F5E6D3] text-3xl md:text-4xl font-sans font-bold uppercase tracking-wide drop-shadow-md">
                GROW IN FAITH, ENGAGE WITH OUR COMMUNITY!
              </h3>
          </div>
      </div>
    </div>
  );
};

export default Sermons;
