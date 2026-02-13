import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const container = useRef();

  useGSAP(() => {
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
      }
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
      }
    });

  }, { scope: container });

  return (
    <div ref={container} className="bg-brand-beige pt-24 pb-12 w-full overflow-hidden relative z-10">
        {/* Top Section: Stay Connected */}
        <div className="border border-brand-red mx-8 p-12 mb-20 relative bg-brand-beige/50 backdrop-blur-sm rounded-3xl">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <h2 className="footer-title text-brand-light text-4xl md:text-5xl lg:text-6xl font-sans uppercase leading-tight max-w-3xl drop-shadow-lg">
                     <SplitText>Stay Connected</SplitText> <br/> 
                     <SplitText>For Updates </SplitText> <br/>
                 </h2>
                 <div className="mt-8 md:mt-0 max-w-sm text-brand-red">
                     <p className="font-serif text-lg leading-relaxed">
                         Stay connected with Resurrection Baptist Church for updates!
                     </p>
                 </div>
             </div>
        </div>

        {/* Accessibility Section */}
        <div className="px-8 max-w-5xl mb-24">
            <h3 className="access-quote text-brand-red text-3xl md:text-5xl font-serif leading-tight drop-shadow-md">
                <span className="access-line block">Our church is fully</span>
                <span className="access-line block">accessible, providing</span>
                <span className="access-line block">services for all individuals</span>
                <span className="access-line block">to ensure everyone</span>
                <span className="access-line block">can participate.</span>
            </h3>
        </div>

        {/* Bottom Contacts */}
        <div className="px-8 flex flex-col md:flex-row justify-between items-start border-t border-brand-red/30 pt-12">
            <div className="mb-8 md:mb-0">
                <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">Email</h4>
                <p className="text-brand-red font-serif hover:text-brand-dark transition-colors cursor-pointer">jonahchowri95@gmail.com</p>
            </div>
            
            <div className="mb-8 md:mb-0">
                <h4 className="text-brand-dark text-xl font-sans uppercase tracking-widest mb-4">Phone</h4>
                <p className="text-brand-red font-serif">+91-90084 69800</p>
            </div>

            <div className="max-w-xs text-right">
                 <p className="text-brand-dark/60 font-serif text-sm">
                     For assistance, please call our support line at +91-90084 69800, available 24/7.
                 </p>
            </div>
        </div>
    </div>
  );
};

const SplitText = ({ children, className }) => {
  return (
    <span className={`inline-block ${className}`}>
      {children.split('').map((char, index) => (
        <span key={index} className="footer-char inline-block min-w-[0.2em] whitespace-pre">
          {char}
        </span>
      ))}
    </span>
  );
};

export default Footer;
