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

    const MapEmbed = () => {
        return (
            <iframe
                src="https://www.google.com"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
            />
        );
    };



    return (
        <>
            <Navbar />
            <div ref={container} className="bg-brand-beige text-brand-dark overflow-hidden min-h-screen">
                
                {/* Hero Section */}
                <div className="h-[50vh] relative flex items-center justify-center overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30 parallax-bg"
                        style={{ backgroundImage: `url(${historyBg})` }}
                    ></div>
                    <div className="absolute inset-0 bg-linear-to-b from-brand-beige/20 via-transparent to-brand-beige"></div>
                    
                    <div className="relative z-10 text-center px-4 mt-16">
                        <h1 className="hero-text text-5xl md:text-8xl font-serif text-brand-red opacity-90 drop-shadow-2xl mb-4 uppercase tracking-wider">
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
                            <h2 className="contact-reveal text-3xl md:text-5xl font-serif text-brand-red mb-8">Get In Touch</h2>
                            <p className="contact-reveal text-lg text-brand-dark/80 leading-relaxed mb-12 font-serif">
                                Whether you have a question about our ministries, need prayer, or simply want to learn more about our church, we welcome you to reach out. Our doors and hearts are open.
                            </p>

                            <div className="space-y-8">
                                <div className="contact-reveal flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center shrink-0">
                                        <FiMapPin className="text-brand-red text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-[#f0e6d2] mb-1">Our Location</h3>
                                        <p className="text-[#f0e6d2]/70">#839 HSR Layout<br/>Bengaluru, Karnataka</p>
                                    </div>
                                </div>
                                
                                <div className="contact-reveal flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center shrink-0">
                                        <FiPhone className="text-brand-red text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-[#f0e6d2] mb-1">Phone Number</h3>
                                        <p className="text-[#f0e6d2]/70">90084 69800</p>
                                    </div>
                                </div>

                                <div className="contact-reveal flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center shrink-0">
                                        <FiMail className="text-brand-red text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-[#f0e6d2] mb-1">Email Address</h3>
                                        <p className="text-[#f0e6d2]/70">jonahchowri95@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-reveal bg-brand-dark/5 border border-brand-red/20 p-8 md:p-12 rounded-3xl backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-serif text-brand-red mb-2 uppercase tracking-wide">Your Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required 
                                        className="w-full bg-transparent border-b border-brand-red/30 py-3 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red transition-colors duration-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-serif text-brand-red mb-2 uppercase tracking-wide">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                        className="w-full bg-transparent border-b border-brand-red/30 py-3 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red transition-colors duration-300"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-serif text-brand-red mb-2 uppercase tracking-wide">Subject</label>
                                    <input 
                                        type="text" 
                                        id="subject" 
                                        name="subject" 
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required 
                                        className="w-full bg-transparent border-b border-brand-red/30 py-3 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red transition-colors duration-300"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-serif text-brand-red mb-2 uppercase tracking-wide">Message</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        value={formData.message}
                                        onChange={handleChange}
                                        required 
                                        rows="4"
                                        className="w-full bg-transparent border-b border-brand-red/30 py-3 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red transition-colors duration-300 resize-none"
                                        placeholder="Type your message here..."
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full bg-brand-red text-brand-beige font-serif font-bold py-4 rounded-xl hover:bg-[#d8b571] transition-colors duration-300 mt-4 active:scale-[0.98]"
                                >
                                    SEND MESSAGE
                                </button>
                                
                                {status && (
                                    <p className={`text-center font-serif mt-4 ${status.includes('Thank') ? 'text-green-400' : 'text-brand-red'}`}>
                                        {status}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Optional Map Placeholder */}
                <div className="contact-reveal h-64 md:h-96 w-full bg-[#0d0b0a] mt-12 flex items-center justify-center opacity-80">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8391726900445!2d77.65111089250834!3d12.91805625002827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae148233bb53d1%3A0x6c7efe0d29ccd384!2s839%2C%2010th%20Cross%20Rd%2C%201st%20Sector%2C%20HSR%20Layout%2C%20Bengaluru%2C%20Karnataka%20560102!5e0!3m2!1sen!2sin!4v1772863528854!5m2!1sen!2sin"
                        width="600"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps Location"
                    />
                </div>

            </div>
            <Footer />
        </>
    );
};

export default ContactPage;
