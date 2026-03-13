import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bgImage from "../assets/ministries-community.png";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const container = useRef();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`http://localhost:8000/api/v1/blogs/${slug}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setBlog(data.data);
        } else {
          throw new Error(data.message || "Failed to load the announcement.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while loading.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [slug]);

  useGSAP(
    () => {
      if (!loading && blog) {
        // Hero text animation
        gsap.fromTo(
          ".hero-text",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
        );

        // Content fade in
        gsap.fromTo(
          ".content-article",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
        );

        // Parallax background
        gsap.to(".parallax-bg", {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: ".content-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: container, dependencies: [loading, blog] }
  );

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#1a1614] text-[#f0e6d2] overflow-hidden flex flex-col"
    >
      <Navbar />

      <div className="flex-grow flex justify-center items-center py-32" style={{ display: loading || error ? "flex" : "none" }}>
        {loading ? (
             <div className="w-12 h-12 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin"></div>
        ) : error ? (
            <div className="text-center bg-[#2a2420]/80 p-8 rounded-2xl border border-[#c5a059]/20">
                <h2 className="text-2xl font-serif text-[#c5a059] mb-4">Error Loading Post</h2>
                <p className="text-red-300 mb-6">{error}</p>
                <button 
                  onClick={() => navigate('/announcements')}
                  className="bg-[#c5a059] text-[#1a1614] px-6 py-2 rounded-md font-bold hover:bg-[#a68444] transition-colors"
                >
                    Back to Announcements
                </button>
            </div>
        ) : null}
      </div>

      {!loading && !error && blog && (
        <>
          {/* Hero Section */}
          <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#14110f]">
            <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-text-container">
               <button 
                  onClick={() => navigate('/announcements')}
                  className="hero-text mb-8 inline-flex items-center text-[#c5a059] hover:text-white transition-colors uppercase tracking-wider text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Announcements
               </button>
               
              <h1 className="hero-text text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-[#c5a059] mb-6 drop-shadow-lg leading-tight">
                {blog.title}
              </h1>
              
              <div className="hero-text flex items-center justify-center space-x-4 text-[#f0e6d2]/60 mt-6">
                 <time dateTime={blog.createdAt} className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#c5a059]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(blog.createdAt)}
                 </time>
              </div>
            </div>
          </div>

          {/* Content Section with Parallax Background */}
          <div className="relative content-section py-16 lg:py-24 flex-grow">
            <div
              className="absolute inset-0 parallax-bg z-0"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            ></div>
            <div className="absolute inset-0 bg-[#1a1614]/95 z-10 backdrop-blur-md"></div>

            <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <article className="content-article bg-[#14110f]/60 p-8 md:p-12 rounded-2xl shadow-2xl border border-[#c5a059]/10">
                 <div className="prose prose-lg prose-invert max-w-none text-[#f0e6d2]/90 leading-relaxed font-sans whitespace-pre-wrap">
                    {blog.content}
                 </div>
              </article>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default AnnouncementDetail;
