import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bgImage from "../assets/ministries-community.png";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";


const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
gsap.registerPlugin(ScrollTrigger);


const AnnouncementsPage = () => {
  const container = useRef();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
  });

  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${backendURL}/api/v1/blogs?page=${page}&limit=${pagination.limit}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setBlogs(data.data.blogs || []);
        setPagination({
          page: data.data.pagination.page,
          limit: data.data.pagination.limit,
          totalPages: data.data.pagination.totalPages,
        });
      } else {
        throw new Error(data.message || "Failed to fetch announcements.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  useGSAP(
    () => {
      // Hero text animation
      gsap.fromTo(
        ".hero-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
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
    },
    { scope: container }
  );

  // Re-run card animations when blogs change
  useEffect(() => {
    if (!loading && blogs.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".announcement-card",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".blogs-grid",
              start: "top 85%",
            },
          }
        );
      }, container);
      return () => ctx.revert();
    }
  }, [loading, blogs]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBlogs(newPage);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#1a1614] text-[#f0e6d2] overflow-hidden flex flex-col"
    >
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#14110f]">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-text-container">
          <h1 className="hero-text text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-[#c5a059] mb-6 drop-shadow-lg leading-tight">
            Announcements & Stories
          </h1>
          <p className="hero-text max-w-2xl mx-auto text-xl md:text-2xl text-[#f0e6d2]/80 italic font-serif">
            "How good and pleasant it is when God's people live together in
            unity!" - Psalm 133:1
          </p>
          <p className="hero-text max-w-2xl mx-auto text-lg text-[#f0e6d2]/60 mt-6">
            Stay updated with the latest news, upcoming events, and stories of
            faith from our church community.
          </p>
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
        <div className="absolute inset-0 bg-[#1a1614]/90 z-10 backdrop-blur-sm"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-8 rounded max-w-3xl mx-auto text-center">
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => fetchBlogs(1)}
                className="mt-4 text-[#c5a059] underline hover:text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin"></div>
            </div>
          ) : !error && blogs.length === 0 ? (
            <div className="text-center py-20 bg-[#2a2420]/80 backdrop-blur-md rounded-2xl border border-[#c5a059]/10 max-w-3xl mx-auto">
              <h3 className="text-2xl font-serif text-[#c5a059] mb-4">
                No Announcements Yet
              </h3>
              <p className="text-[#f0e6d2]/70">
                Check back later for updates and stories from our community.
              </p>
            </div>
          ) : (
            <>
              <div className="blogs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <article
                    key={blog._id}
                    onClick={() => navigate(`/announcements/${blog.slug}`)}
                    className="announcement-card bg-[#2a2420]/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-[#c5a059]/20 flex flex-col transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#c5a059]/50 group cursor-pointer"
                  >
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="mb-4 flex items-center justify-between text-sm text-[#c5a059]/80 font-medium">
                        <time dateTime={blog.createdAt}>
                          {formatDate(blog.createdAt)}
                        </time>
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-[#c5a059] mb-4 group-hover:text-white transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                      <div className="w-12 h-0.5 bg-[#c5a059]/40 mb-4 transition-all duration-300 group-hover:w-full"></div>
                      <p className="text-[#f0e6d2]/80 leading-relaxed flex-grow line-clamp-4">
                        {decodeHTML(blog.content.replace(/<[^>]*>/g, ''))}
                      </p>
                      
                      <div className="mt-8 pt-4 border-t border-[#c5a059]/10 flex items-center text-[#c5a059] font-medium group-hover:text-white transition-colors">
                        Read Full Story
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-16 space-x-4">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-3 rounded-full bg-[#2a2420] border border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1614] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous page"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-[#f0e6d2]/80 font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-3 rounded-full bg-[#2a2420] border border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1614] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Next page"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
