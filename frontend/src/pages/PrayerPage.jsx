import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import historyBg from "../assets/hero-church-epic.png"; // Or perhaps ministry-2.png if that's more fitting, but hero-church-epic has the nice dark overlay.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PrayerPage = () => {
  const container = useRef();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.description.trim()) {
      setError("Please provide both your name and your prayer request.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/prayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setFormData({ name: "", description: "" });
      } else {
        throw new Error(data.message || "Failed to submit prayer request.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
          trigger: ".form-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Form card animation
      gsap.fromTo(
        ".form-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".form-section",
            start: "top 80%",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#1a1614] text-[#f0e6d2] overflow-hidden flex flex-col"
    >
      <Navbar />

      {/* Hero Section (Solid Background) */}
      <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#14110f]">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-text-container">
          <h1 className="hero-text text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-[#c5a059] mb-6 drop-shadow-lg leading-tight">
            Prayer Requests
          </h1>
          <p className="hero-text max-w-2xl mx-auto text-xl md:text-2xl text-[#f0e6d2]/80 italic font-serif">
            "Ask, and it will be given to you; seek, and you will find; knock,
            and it will be opened to you."
          </p>
          <p className="hero-text max-w-2xl mx-auto text-lg text-[#f0e6d2]/60 mt-6">
            We believe in the power of prayer. Share your burdens, praises, or needs with us, and our church family will lift them up before the Lord.
          </p>
        </div>
      </div>

      {/* Form Section with Parallax Wallpaper */}
      <div className="relative form-section py-16 lg:py-24 flex-grow">
        <div
          className="absolute inset-0 parallax-bg z-0"
          style={{
            backgroundImage: `url(${historyBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        ></div>
        <div className="absolute inset-0 bg-[#14110f]/85 z-10 backdrop-blur-sm"></div>

        <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="form-card bg-[#2a2420]/95 rounded-2xl shadow-2xl border border-[#c5a059]/20 overflow-hidden backdrop-blur-md">
            <div className="p-8 sm:p-12">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#c5a059]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c5a059]/40">
                    <svg
                      className="w-10 h-10 text-[#c5a059]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-[#c5a059] mb-4">
                    Request Received
                  </h2>
                  <p className="text-xl text-[#f0e6d2]/80 mb-8 max-w-lg mx-auto leading-relaxed">
                    Thank you for sharing your prayer needs. We will be praying
                    with you. May God grant you peace and comfort.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="bg-[#c5a059] text-[#1a1614] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a68444] transition-all transform hover:-translate-y-1 shadow-md uppercase tracking-wider"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded">
                      <p className="text-red-200">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 text-[#f0e6d2] rounded-md focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none transition-colors"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">
                      Prayer Request
                    </label>
                    <textarea
                      name="description"
                      required
                      rows="6"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 text-[#f0e6d2] rounded-md focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none resize-none transition-colors"
                      placeholder="Share your prayer needs here..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#c5a059] text-[#1a1614] text-lg font-bold py-4 rounded-md hover:bg-[#a68444] transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider flex justify-center items-center gap-3 mt-8"
                  >
                    {loading && (
                      <div className="w-5 h-5 border-2 border-[#1a1614] border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {loading ? "Submitting..." : "Submit Prayer Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrayerPage;
