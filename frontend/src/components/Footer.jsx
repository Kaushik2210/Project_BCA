import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const Footer = () => {
  const container = useRef();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter an email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${backendURL}/api/v1/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage("Thank you for subscribing to our updates!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "An error occurred. Please check your connection.");
    }
  };

  useGSAP(
    () => {
      // Animate "Stay Connected" Title
      gsap.from(".footer-char", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".footer-title",
          start: "top 80%",
        },
      });

      // Animate Accessibility Quote Lines
      gsap.from(".access-line", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".access-quote",
          start: "top 80%",
        },
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="bg-brand-beige pt-24 pb-12 w-full overflow-hidden relative z-10"
    >
      {/* Top Section: Stay Connected */}
      <div className="border border-brand-red mx-8 p-12 mb-20 relative bg-brand-beige/50 backdrop-blur-sm rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="footer-title text-brand-light text-4xl md:text-5xl lg:text-6xl font-sans uppercase leading-tight max-w-3xl drop-shadow-lg">
            <SplitText>Stay </SplitText> <br />
            <SplitText>Connected </SplitText> <br />
            <SplitText>For Updates </SplitText> <br />
          </h2>
          <div className="mt-8 md:mt-0 lg:w-1/3 flex flex-col justify-end space-y-4 text-brand-red">
            <p className="font-serif text-lg leading-relaxed hidden">
              <a
                href="https://www.instagram.com/resurrection_baptist?igsh=MWQ2OTc1ZXNnMnNtdw=="
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-dark transition-colors"
                
              >
                Resurrection Baptist Church
              </a>
            </p>
            
            <form onSubmit={handleSubscribe} className="w-full flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="flex-grow bg-[#2a2420] text-[#f0e6d2] px-4 py-3 rounded-md border border-[#c5a059]/30 focus:outline-none focus:border-[#c5a059] placeholder-[#f0e6d2]/40 transition-colors disabled:opacity-50"
                aria-label="Email address for newsletter"
                required
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="bg-[#c5a059] text-[#1a1614] px-6 py-3 rounded-md font-bold hover:bg-[#a68444] transition-colors whitespace-nowrap disabled:opacity-70 flex items-center justify-center"
              >
                {status === 'loading' ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            {message && (
               <div className={`text-sm px-2 py-1 rounded w-full line-clamp-2 ${status === 'success' ? 'text-green-800 bg-green-200/50 border border-green-500/30' : 'text-red-800 bg-red-200/50 border border-red-500/30'}`}>
                 {message}
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Contacts */}
      <div className="px-8 flex flex-col md:flex-row justify-between items-start border-t border-brand-red/30 pt-12">
        <div className="mb-8 md:mb-0">
          <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">
            Email
          </h4>
          <p className="text-brand-red font-serif hover:text-brand-dark transition-colors cursor-pointer">
            jonahchowri95@gmail.com
          </p>
        </div>

        <div className="mb-8 md:mb-0">
          <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">
            Phone
          </h4>
          <p className="text-brand-red font-serif">+91-90084 69800</p>
        </div>

        <div className="max-w-xs text-right">
          <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">
            Our Location
          </h4>
          <p className="text-brand-red font-serif">#839 HSR Layout Bengaluru, Karnataka</p>
        </div>
      </div>

      <div className="mt-12 text-center pb-8 border-t border-brand-red/10 pt-8">
        <Link to="/admin" className="text-brand-red/60 hover:text-brand-red text-sm font-sans transition-colors cursor-pointer tracking-widest">
          ADMIN LOGIN
        </Link>
      </div>
    </div>
  );
};

const SplitText = ({ children, className }) => {
  return (
    <span className={`inline-block ${className}`}>
      {children.split("").map((char, index) => (
        <span
          key={index}
          className="footer-char inline-block min-w-[0.2em] whitespace-pre"
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default Footer;
