// Import React and standard hooks.
// `useRef` provides direct access to DOM nodes.
// `useState` allows this component to hold dynamic data that updates the UI when changed.
import React, { useRef, useState } from "react";

// Import `Link` from React Router to allow clicking internal links without doing a full browser refresh.
import { Link } from "react-router-dom";

// Import the core GSAP Javascript animation library.
import gsap from "gsap";

// Import the GSAP React hook for safe scoping and memory cleanup during component unmounts.
import { useGSAP } from "@gsap/react";

// Import the ScrollTrigger plugin to fire animations based on where the user scrolls.
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Global GSAP requirement: Register ScrollTrigger so the GSAP engine knows how to use it.
gsap.registerPlugin(ScrollTrigger);

// Retrieve the backend API URL securely from Vite's environment variables.
// If the environment variable isn't found (e.g. locally), it defaults to localhost port 8000.
// `import.meta.env` is the Vite specific way to access `.env` file variables.
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Define the Footer functional component.
const Footer = () => {
  // Create a React reference specifically to target the outermost wrapper div of the Footer.
  // This allows GSAP to restrict animations to only fire inside this specific footer code.
  const container = useRef();
  
  // React State 1: `email`. Tracks exactly what the user is typing into the subscribe box.
  // We initialize it to an empty string `""`.
  const [email, setEmail] = useState("");
  
  // React State 2: `status`. Tracks what phase the network request is currently in.
  // Initialized to "idle". Can change to "loading", "success", or "error".
  const [status, setStatus] = useState("idle"); 
  
  // React State 3: `message`. Tracks the specific text feedback to show the user (e.g., "Thanks!" or "Email invalid").
  const [message, setMessage] = useState("");

  // Define an asynchronous function to handle when the user clicks the "Subscribe" button.
  // It takes the event object `e` automatically passed by the form submission.
  const handleSubscribe = async (e) => {
    // CRITICAL: Stop the browser from executing its default HTML form submit behavior,
    // which would cause the entire page to physically refresh and lose our Javascript state.
    e.preventDefault(); 
    
    // Basic Frontend Validation Step.
    if (!email) {
      // If the email string is entirely empty, abort the function.
      setStatus("error");
      setMessage("Please enter an email address.");
      return; 
    }

    // Set the UI status to loading. This will typically disable the button and show a spinning icon.
    setStatus("loading");
    // Clear out any old error or success messages from previous attempts.
    setMessage("");

    // Begin a `try...catch` block. This is standard Javascript for handling Network requests.
    // If the network completely drops (e.g. airplane mode), the `catch` block catches the crash safely.
    try {
      // Execute an asynchronous HTTP POST request to our Backend Express Server using the native `fetch` API.
      // We dynamically inject the backendURL variable we defined at the top.
      const response = await fetch(`${backendURL}/api/v1/newsletter/subscribe`, {
        // We are sending data, so the method is POST.
        method: "POST",
        // Explain to the backend server that we are sending JSON formatted data in the body.
        headers: { "Content-Type": "application/json" },
        // Convert our raw Javascript object `{ email: "user@test.com" }` into a strict JSON string.
        body: JSON.stringify({ email }), 
      });
      
      // Wait for the backend server to respond, then parse its raw response text back into a Javascript object.
      const data = await response.json();

      // Check two things to confirm total success:
      // 1. `response.ok` checks if the HTTP status code was broadly successful (200-299 standard).
      // 2. `data.success` checks our custom API architecture design to see if our controller explicitly flagged it true.
      if (response.ok && data.success) {
        // Trigger success state logic.
        setStatus("success");
        setMessage("Thank you for subscribing to our updates!");
        // Completely erase the input field visually since they successfully submitted it.
        setEmail(""); 
      } else {
        // The server caught a specific logical error (e.g. "Email already exists!").
        setStatus("error");
        // We print the exact custom message string the backend sent us inside `data.message`, or a fallback.
        setMessage(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      // Total network failure trap (e.g. DNS failure, server physically turned off).
      setStatus("error"); 
      // Output the generic javascript error message physically generated by the browser's failed fetch attempt.
      setMessage(err.message || "An error occurred. Please check your connection.");
    }
  };

  // Initialize GSAP animation sequences inside the protected hook.
  useGSAP(
    () => {
      // Create a staggered text reveal animation targeting CSS class `.footer-char`.
      // `.from()` defines the starting visual position, and animates it back to normally rendered CSS.
      gsap.from(".footer-char", {
        // Start characters 50 pixels lower in space.
        y: 50,
        // Start characters entirely invisible.
        opacity: 0,
        // Animation lasts 1 entire second.
        duration: 1,
        // The 'stagger' trick: Delay the animation of each letter specifically by 0.05 seconds creating a "typewriter flow" or cascading effect.
        stagger: 0.05, 
        // Ease function to slow down heavily near the end of the physics movement.
        ease: "power3.out",
        // The ScrollTrigger directive.
        scrollTrigger: {
          // Watch the `.footer-title` wrapper block.
          trigger: ".footer-title",
          // Wait to fire the staggered animation until the top of the title is 80% down the screen (almost fully visible).
          start: "top 80%", 
        },
      });

      // (Note: there is a commented out animation block here for accessibility quotes saved for future use).
      
    // Safely restrict all of the GSAP queries above (e.g. querying for ".footer-char") to ONLY search inside this Footer.
    }, { scope: container },
  );

  // Return the JSX markup to render.
  return (
    // The master outer div container. We assign `ref={container}` here so GSAP's scope knows what to look inside.
    // 'z-10' guarantees the footer stacks visually above underlying parallax layers.
    <div
      ref={container}
      className="bg-brand-beige pt-24 pb-12 w-full overflow-hidden relative z-10"
    >
      
      {/* -------------------- */}
      {/* Top Newsletter Panel */}
      {/* -------------------- */}
      
      {/* Visual wrapper for the subscribe box. Features backdrop-blur for a glassy effect over any background patterns. */}
      <div className="border border-brand-red mx-8 p-12 mb-20 relative bg-brand-beige/50 backdrop-blur-sm rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          
          {/* Main Title. We attach the `.footer-title` class here which GSAP is actively spying on to trigger the Scroll effect. */}
          <h2 className="footer-title text-brand-light text-4xl md:text-5xl lg:text-6xl font-sans uppercase leading-tight max-w-3xl drop-shadow-lg">
            {/* SplitText is a custom React Component defined at the absolute bottom of this file. */}
            {/* It physically shreds the word into separate letter <span> tags so GSAP can animate them individually. */}
            <SplitText>Stay </SplitText> <br />
            <SplitText>Connected </SplitText> <br />
            <SplitText>For Updates </SplitText> <br />
          </h2>
          
          <div className="mt-8 md:mt-0 lg:w-1/3 flex flex-col justify-end space-y-4 text-brand-red">
            {/* A hidden social link kept in code for potential later use. */}
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
            
            {/* The physical HTML Form for the Newsletter list. */}
            {/* When the user strikes 'Enter' or clicks the submit button, it instantly fires our `handleSubscribe` React function. */}
            <form onSubmit={handleSubscribe} className="w-full flex flex-col sm:flex-row gap-3">
              
              {/* Email Text Input Field */}
              <input 
                // HTML5 type 'email' enforces a strict string check in the browser (e.g. requires an '@' symbol).
                type="email" 
                placeholder="Enter your email address"
                // The input is "controlled" by linking its physical value directly to our `email` State variable.
                value={email}
                // When typing occurs, `onChange` captures it and writes it strictly back to state.
                onChange={(e) => setEmail(e.target.value)}
                // Dynamic prop: If our React state `status` equals 'loading', we completely lock out the input so they can't spam typing.
                disabled={status === 'loading'}
                className="flex-grow bg-[#2a2420] text-[#f0e6d2] px-4 py-3 rounded-md border border-[#c5a059]/30 focus:outline-none focus:border-[#c5a059] placeholder-[#f0e6d2]/40 transition-colors disabled:opacity-50"
                aria-label="Email address for newsletter"
                // HTML5 `required` flag prevents them submitting a totally empty box before it even hits our Javascript.
                required
              />
              
              {/* Form Submission Button */}
              <button 
                // A type of 'submit' guarantees clicking this fires the parent <form>'s `onSubmit` logic.
                type="submit" 
                // Lock the button dynamically during the network latency phase.
                disabled={status === 'loading'}
                className="bg-[#c5a059] text-[#1a1614] px-6 py-3 rounded-md font-bold hover:bg-[#a68444] transition-colors whitespace-nowrap disabled:opacity-70 flex items-center justify-center"
              >
                {/* Visual Logic Check: Are we loading right now? */}
                {status === 'loading' ? (
                  // YES: Render this spinning SVG wheel animation to visually satisfy the user.
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  // NO: Render the basic text string normally.
                  "Subscribe"
                )}
              </button>
            </form>

            {/* Conditional Rendering Block: If the `message` state variable is NOT totally empty... */}
            {message && (
               // Render a div containing the dynamic message string.
               // We use a Template Literal styling approach to change the box strictly Green or Red depending on if the form `status` was 'success'.
               <div className={`text-sm px-2 py-1 rounded w-full line-clamp-2 ${status === 'success' ? 'text-green-800 bg-green-200/50 border border-green-500/30' : 'text-red-800 bg-red-200/50 border border-red-500/30'}`}>
                 {message}
               </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------- */}
      {/* Bottom Contact Detail Information Panel */}
      {/* -------------------- */}
      
      {/* Flex container wrapping the three text columns below. Splits evenly on large screens (`md:flex-row`). */}
      <div className="px-8 flex flex-col md:flex-row justify-between items-start border-t border-brand-red/30 pt-12">
        
        {/* Email Chunk */}
        <div className="mb-8 md:mb-0">
          <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">
            Email
          </h4>
          {/* Using `href="mailto:..."` allows native email clients (like Apple Mail) to automatically format a new email when clicked. */}
          <a href="mailto:jonahchowri95@gmail.com" className="text-brand-red font-serif hover:text-brand-dark transition-colors cursor-pointer block">
            jonahchowri95@gmail.com
          </a>
        </div>

        {/* Phone Chunk */}
        <div className="mb-8 md:mb-0">
          <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">
            Phone
          </h4>
          {/* Using `href="tel:..."` forces Safari/Chrome on mobile devices to bring up the dialing keypad instantly. */}
          <a href="tel:+919008469800" className="text-brand-red font-serif hover:text-brand-dark transition-colors cursor-pointer block">
            +91-90084 69800
          </a>
        </div>

        {/* Location Chunk */}
        <div className="max-w-xs text-right">
          <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">
            Our Location
          </h4>
          <p className="text-brand-red font-serif">#839 HSR Layout Bengaluru, Karnataka</p>
        </div>
      </div>

      {/* Quick shortcut router link physically hidden down at the very bottom strictly to reach the Admin Panel securely. */}
      {/* Notice we use `<Link>` rather than standard `<a>` tag so the browser doesn't flash. */}
      <div className="mt-12 text-center pb-8 border-t border-brand-red/10 pt-8">
        <Link to="/admin" className="text-brand-red/60 hover:text-brand-red text-sm font-sans transition-colors cursor-pointer tracking-widest">
          ADMIN LOGIN
        </Link>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------ //
// HELPER COMPONENT: <SplitText>                                                                    //
// ------------------------------------------------------------------------------------------------ //
// This is an inline mini-component created specifically to power the GSAP character stagger effect at the top.
// It accepts properties: 'children' (the actual string placed inside it like `Stay`) and 'className'.
const SplitText = ({ children, className }) => {
  return (
    // Outer wrap span to hold the entire word.
    <span className={`inline-block ${className}`}>
      
      {/* Core Logic Step: 
          1. We take `children` (e.g. "Stay")
          2. `.split("")` forcefully shreds it into an array of isolated letters: ['S', 't', 'a', 'y'].
          3. `.map()` iterates strictly over that array, producing one individual <span> block per individual letter. */}
      {children.split("").map((char, index) => (
        // The individual letter span block.
        <span
          // React strictly requires unique `key` props when mapping arrays to prevent DOM confusion.
          key={index} 
          // CRUCIAL: We tag EVERY letter with the specific `.footer-char` CSS class that GSAP was spying on globally earlier.
          // `whitespace-pre` ensures an actual Space character (" ") is rendered as physical blank width, otherwise HTML naturally collapses empty spaces.
          className="footer-char inline-block min-w-[0.2em] whitespace-pre" 
        >
          {/* Physically inject the actual letter here (e.g. 'S') */}
          {char}
        </span>
      ))}
    </span>
  );
};

// Expose Footer module globally.
export default Footer;
