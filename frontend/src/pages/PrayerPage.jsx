// Import React hooks for state and DOM references.
import React, { useState, useRef } from "react";
// Import shared layout components.
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// Import background image for the parallax hero effect.
import historyBg from "../assets/hero-church-epic.png";
// Import GSAP animation libraries.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin with GSAP.
gsap.registerPlugin(ScrollTrigger);
// Retrieve backend URL from Vite's environment variables, with a local fallback.
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =========================================================================
// PrayerPage — A public-facing page where visitors can submit prayer requests.
// Features: Form validation, API submission, parallax background, success feedback.
// =========================================================================
const PrayerPage = () => {
  // Ref for the main container — used for scoping GSAP animations.
  const container = useRef();
  // Form data state — tracks the values of the name and description fields.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  // Loading state — disables the submit button during API calls.
  const [loading, setLoading] = useState(false);
  // Success state — toggles the view from form to success message.
  const [success, setSuccess] = useState(false);
  // Error state — displays validation or server error messages.
  const [error, setError] = useState("");

  // Generic input change handler — updates the correct field in formData.
  // Uses computed property name [name] to dynamically set the right key.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form submission handler — validates and sends prayer request to the backend.
  const handleSubmit = async (e) => {
    // Prevent the browser's default form submission (page reload).
    e.preventDefault();
    setError("");

    // Trim whitespace from both fields for validation.
    const nameStr = formData.name.trim();
    const descStr = formData.description.trim();

    // Validation: Check if both fields have content.
    if (!nameStr || !descStr) {
      setError("Please provide both your name and your prayer request.");
      return;
    }

    // Validation: Name must be at least 3 characters.
    if (nameStr.length < 3) {
      setError("Name must be at least 3 characters long.");
      return;
    }

    // Validation: Name should not contain numbers (regex \d matches digits).
    if (/\d/.test(nameStr)) {
      setError("Name should not contain any numbers.");
      return;
    }

    // Validation: Prayer request must be at least 10 characters.
    if (descStr.length < 10) {
      setError("Prayer request must be at least 10 characters long.");
      return;
    }

    // Validation: Prayer request cannot exceed 200 characters.
    if (descStr.length > 200) {
      setError("Prayer request cannot exceed 200 characters.");
      return;
    }

    // Start loading state (disables submit button, shows spinner).
    setLoading(true);

    try {
      // Send a POST request to the backend prayer endpoint.
      const response = await fetch(`${backendURL}/api/v1/prayers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Convert the formData object into a JSON string for the request body.
        body: JSON.stringify(formData),
      });

      // Parse the server's JSON response.
      const data = await response.json();

      // Check both the HTTP status and the custom `success` flag from our API.
      if (response.ok && data.success) {
        // Switch to the success view and reset the form.
        setSuccess(true);
        setFormData({ name: "", description: "" });
      } else {
        // Throw an error with the server's message to display it in the UI.
        throw new Error(data.message || "Failed to submit prayer request.");
      }
    } catch (err) {
      // Catch network errors or thrown errors and display them.
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      // Always stop the loading spinner.
      setLoading(false);
    }
  };

  // GSAP animations — hero text reveal, parallax background, and form card reveal.
  useGSAP(
    () => {
      // Animate the hero text elements: slide up from 30px below and fade in.
      gsap.fromTo(
        ".hero-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
      );

      // Parallax effect: Move the background image at a slower rate than the scroll.
      gsap.to(".parallax-bg", {
        yPercent: 15,         // Move down by 15% of its height.
        ease: "none",          // Linear movement matches scroll speed.
        scrollTrigger: {
          trigger: ".form-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,         // Tie animation to scrollbar position.
        },
      });

      // Form card reveal: Slide up and fade in when the form section scrolls into view.
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
            start: "top 80%",   // Trigger when the form section is 80% visible.
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

      {/* Hero Section — Solid dark background with title and scripture */}
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

      {/* Form Section — Contains the parallax background and the prayer request form */}
      <div className="relative form-section py-16 lg:py-24 flex-grow">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-bg z-0"
          style={{
            backgroundImage: `url(${historyBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        ></div>
        {/* Dark overlay with blur for text readability */}
        <div className="absolute inset-0 bg-[#14110f]/85 z-10 backdrop-blur-sm"></div>

        <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="form-card bg-[#2a2420]/95 rounded-2xl shadow-2xl border border-[#c5a059]/20 overflow-hidden backdrop-blur-md">
            <div className="p-8 sm:p-12">
              {/* Success View — shown after successful submission */}
              {success ? (
                <div className="text-center py-12">
                  {/* Checkmark Icon */}
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
                  {/* Button to submit another prayer request */}
                  <button
                    onClick={() => setSuccess(false)}
                    className="bg-[#c5a059] text-[#1a1614] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a68444] transition-all transform hover:-translate-y-1 shadow-md uppercase tracking-wider"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                /* Form View — the actual prayer request form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Banner — shown when validation or API errors occur */}
                  {error && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded">
                      <p className="text-red-200">{error}</p>
                    </div>
                  )}

                  {/* Name Input Field */}
                  <div>
                    <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      minLength="3"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 text-[#f0e6d2] rounded-md focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none transition-colors"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Prayer Request Textarea with Character Counter */}
                  <div>
                    <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">
                      Prayer Request
                    </label>
                    <textarea
                      name="description"
                      required
                      minLength="10"
                      maxLength="200"
                      rows="6"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 text-[#f0e6d2] rounded-md focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none resize-none transition-colors"
                      placeholder="Share your prayer needs here... (10 to 200 characters)"
                    ></textarea>
                    {/* Dynamic character counter that turns red when exceeding limit */}
                    <p className={`text-xs text-right mt-1 ${formData.description.length > 200 ? 'text-red-400' : 'text-[#f0e6d2]/50'}`}>
                      {formData.description.length}/200
                    </p>
                  </div>

                  {/* Submit Button with Loading State */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#c5a059] text-[#1a1614] text-lg font-bold py-4 rounded-md hover:bg-[#a68444] transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider flex justify-center items-center gap-3 mt-8"
                  >
                    {/* Show spinner when loading */}
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
