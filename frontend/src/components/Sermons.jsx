import React, { useRef, useEffect, useState } from 'react';
import sermonsBg from '../assets/sermons-bg.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Sermons = () => {
  const container = useRef();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const SermonCard = ({ sermon, className }) => {
    const date = sermon?.createdAt ? new Date(sermon.createdAt).toLocaleDateString() : '';
    return (
      <div className={`bg-[#F5F5DC] p-6 rounded-4xl shadow-xl w-full max-w-sm mx-auto z-10 relative group hover:-translate-y-2 transition-transform duration-300 ${className}`}>
        <h4 className="text-[#3E2F26] text-xl font-serif font-bold mb-1">{sermon?.title || 'Untitled'}</h4>
        <p className="text-gray-600 text-sm mb-4">{sermon?.duration || ''} • {date}</p>
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

  useEffect(() => {
    let mounted = true;
    const fetchSermons = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${backendUrl}/api/v1/sermons?limit=4&page=1`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        const data = body?.data?.sermons || body?.sermons || [];
        if (mounted) setSermons(data.slice(0, 4));
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load sermons');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSermons();
    return () => { mounted = false; };
  }, []);

  useGSAP(() => {
    // Parallax Effect: Move odd and even columns at different speeds
    // Left Column (Odd indices in 0-based grid if 2 columns) -> Index 0, 2
    // Right Column (Even indices) -> Index 1, 3
    
    // Actually, simpler to just select by class or child index
    // Let's make the second column move faster/slower than scroll
    
    // Column 1
    gsap.to(".sermon-col-1", {
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".sermon-grid",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    // Column 2 - moves faster upwards (y: -150) creating parallax depth
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

  }, { scope: container });

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
