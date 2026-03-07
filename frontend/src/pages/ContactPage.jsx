import React, { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import historyBg from '../assets/hero-church-epic.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
    const container = useRef();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    useGSAP(() => {
        // Hero Section Animation
        gsap.fromTo(".hero-text",
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", stagger: 0.2 }
        );

        // Contact Info & Form Reveal
        gsap.fromTo(".contact-reveal",
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".contact-section",
                    start: "top 80%",
                }
            }
        );

    }, { scope: container });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setStatus('Sending...');
        setTimeout(() => {
            setStatus('Thank you for reaching out. We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus(''), 5000);
        }, 1500);
    };

    return (
        <>
            <Navbar />
            <div ref={container} className="bg-[#1a1614] text-[#f0e6d2] overflow-hidden min-h-screen">
                
                {/* Hero Section */}
                <div className="h-[50vh] relative flex items-center justify-center overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30 parallax-bg"
                        style={{ backgroundImage: `url(${historyBg})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1614]/20 via-transparent to-[#1a1614]"></div>
                    
                    <div className="relative z-10 text-center px-4 mt-16">
                        <h1 className="hero-text text-5xl md:text-8xl font-serif text-[#c5a059] opacity-90 drop-shadow-2xl mb-4 uppercase tracking-wider">
                            Contact Us
                        </h1>
                        <p className="hero-text text-lg md:text-2xl font-serif max-w-2xl mx-auto italic opacity-80">
                            "We are here for you. Reach out to connect with our church family."
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="contact-section py-20 px-4 md:px-12 mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                        
                        {/* Contact Information */}
                        <div className="flex flex-col justify-center">
                            <h2 className="contact-reveal text-3xl md:text-5xl font-serif text-[#c5a059] mb-8">Get In Touch</h2>
                            <p className="contact-reveal text-lg text-[#f0e6d2]/80 leading-relaxed mb-12 font-serif">
                                Whether you have a question about our ministries, need prayer, or simply want to learn more about our church, we welcome you to reach out. Our doors and hearts are open.
                            </p>

                            <div className="space-y-8">
                                <div className="contact-reveal flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center shrink-0">
                                        <FiMapPin className="text-[#c5a059] text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-[#f0e6d2] mb-1">Our Location</h3>
                                        <p className="text-[#f0e6d2]/70">#839 HSR Layout<br/>Bengaluru, Karnataka</p>
                                    </div>
                                </div>
                                
                                <div className="contact-reveal flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center shrink-0">
                                        <FiPhone className="text-[#c5a059] text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-[#f0e6d2] mb-1">Phone Number</h3>
                                        <p className="text-[#f0e6d2]/70">90084 69800</p>
                                    </div>
                                </div>

                                <div className="contact-reveal flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center shrink-0">
                                        <FiMail className="text-[#c5a059] text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-[#f0e6d2] mb-1">Email Address</h3>
                                        <p className="text-[#f0e6d2]/70">jonahchowri95@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-reveal bg-[#f0e6d2]/5 border border-[#c5a059]/20 p-8 md:p-12 rounded-3xl backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-serif text-[#c5a059] mb-2 uppercase tracking-wide">Your Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required 
                                        className="w-full bg-transparent border-b border-[#c5a059]/30 py-3 text-[#f0e6d2] placeholder-[#f0e6d2]/30 focus:outline-none focus:border-[#c5a059] transition-colors duration-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-serif text-[#c5a059] mb-2 uppercase tracking-wide">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                        className="w-full bg-transparent border-b border-[#c5a059]/30 py-3 text-[#f0e6d2] placeholder-[#f0e6d2]/30 focus:outline-none focus:border-[#c5a059] transition-colors duration-300"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-serif text-[#c5a059] mb-2 uppercase tracking-wide">Subject</label>
                                    <input 
                                        type="text" 
                                        id="subject" 
                                        name="subject" 
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required 
                                        className="w-full bg-transparent border-b border-[#c5a059]/30 py-3 text-[#f0e6d2] placeholder-[#f0e6d2]/30 focus:outline-none focus:border-[#c5a059] transition-colors duration-300"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-serif text-[#c5a059] mb-2 uppercase tracking-wide">Message</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        value={formData.message}
                                        onChange={handleChange}
                                        required 
                                        rows="4"
                                        className="w-full bg-transparent border-b border-[#c5a059]/30 py-3 text-[#f0e6d2] placeholder-[#f0e6d2]/30 focus:outline-none focus:border-[#c5a059] transition-colors duration-300 resize-none"
                                        placeholder="Type your message here..."
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full bg-[#c5a059] text-[#1a1614] font-serif font-bold py-4 rounded-xl hover:bg-[#d8b571] transition-colors duration-300 mt-4 active:scale-[0.98]"
                                >
                                    SEND MESSAGE
                                </button>
                                
                                {status && (
                                    <p className={`text-center font-serif mt-4 ${status.includes('Thank') ? 'text-green-400' : 'text-[#c5a059]'}`}>
                                        {status}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Optional Map Placeholder */}
                <div className="contact-reveal h-64 md:h-96 w-full bg-[#0d0b0a] mt-12 flex items-center justify-center opacity-80">
                    <p className="text-[#f0e6d2]/40 font-serif text-xl">Interactive Map Placeholder</p>
                </div>

            </div>
            <Footer />
        </>
    );
};

export default ContactPage;
