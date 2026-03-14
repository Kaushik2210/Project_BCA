import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import heroBg from '../assets/hero-church-epic.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const AppointmentPage = () => {
  const container = useRef();
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    appointmentMode: 'in-person',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (date) {
      fetchSlots();
    }
  }, [date]);

  const fetchSlots = async () => {
    setFetchingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlotId('');
    try {
      const response = await fetch(`${backendURL}/api/v1/slots?date=${date}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setSlots([]); // No slots available
          return;
        }
        throw new Error('Failed to fetch slots');
      }

      const data = await response.json();
      if (data.success) {
        setSlots(data.data);
      }
    } catch (err) {
      setError('Failed to fetch available slots. Please try again.');
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific field error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors in the form before submitting.');
      return;
    }

    if (!selectedSlotId) {
      setError('Please select an available pastoral session time.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendURL}/api/v1/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlotId,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Reset form
        setDate('');
        setSlots([]);
        setSelectedSlotId('');
        setFormData({
          name: '',
          email: '',
          phone: '',
          appointmentMode: 'in-person',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    // Reveal hero text
    gsap.fromTo(
      '.hero-text',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
    );

    // Parallax background image
    gsap.to('.parallax-bg', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.form-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Form card reveal
    gsap.fromTo(
      '.form-card',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.form-section',
          start: 'top 80%',
        },
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#1a1614] text-[#f0e6d2] overflow-hidden">
      <Navbar />
      
      {/* Hero Section (Solid Background) */}
      <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#14110f]">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-text-container">
          <h1 className="hero-text text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-[#c5a059] mb-6 drop-shadow-lg leading-tight">
            Meet With a Pastor
          </h1>
          <p className="hero-text max-w-2xl mx-auto text-xl md:text-2xl text-[#f0e6d2]/80 italic font-serif">
            "For where two or three are gathered in my name, there am I among them."
          </p>
          <p className="hero-text max-w-2xl mx-auto text-lg text-[#f0e6d2]/60 mt-6">
            Schedule a dedicated time with our pastoral staff for spiritual guidance, prayer, pre-marital counseling, or a general visit.
          </p>
        </div>
      </div>

      {/* Form Section with Wallpaper Behind */}
      <div className="relative form-section py-16 lg:py-24">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 parallax-bg z-0"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
        ></div>
        <div className="absolute inset-0 bg-[#14110f]/85 z-10 backdrop-blur-sm"></div>

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="form-card bg-[#2a2420]/95 rounded-2xl shadow-2xl border border-[#c5a059]/20 overflow-hidden backdrop-blur-md">
          <div className="p-8 sm:p-12">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#c5a059]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c5a059]/40">
                  <svg className="w-10 h-10 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-4xl font-serif font-bold text-[#c5a059] mb-4">Session Confirmed</h2>
                <p className="text-xl text-[#f0e6d2]/80 mb-8 max-w-lg mx-auto leading-relaxed">
                  Praise God! Your session with the pastor has been scheduled. We have sent a confirmation email with the details. We look forward to seeing you.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-[#c5a059] text-[#1a1614] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a68444] transition-all transform hover:-translate-y-1 shadow-md uppercase tracking-wider"
                >
                  Schedule Another Visit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Date Selection */}
                <div className="border-b border-[#c5a059]/20 pb-8">
                  <h3 className="text-2xl font-serif font-semibold text-[#c5a059] mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1614] border border-[#c5a059]/50 text-sm">1</span>
                    Select a Date
                  </h3>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 text-[#f0e6d2] rounded-md focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none transition-all color-scheme-dark"
                  />
                </div>

                {/* Time Slots */}
                {date && (
                  <div className="border-b border-[#c5a059]/20 pb-8 fade-in">
                    <h3 className="text-2xl font-serif font-semibold text-[#c5a059] mb-4 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1614] border border-[#c5a059]/50 text-sm">2</span>
                      Select a Session Time
                    </h3>
                    {fetchingSlots ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : slots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {slots.map((slotObj, index) => {
                          const slotId = Object.keys(slotObj)[0];
                          const timeRange = slotObj[slotId];
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedSlotId(slotId)}
                              className={`py-3 px-4 rounded-md border text-center font-medium transition-all duration-300 ${
                                selectedSlotId === slotId
                                  ? 'bg-[#c5a059] border-[#c5a059] text-[#1a1614] shadow-lg transform scale-105'
                                  : 'bg-[#1a1614] border-[#c5a059]/30 text-[#f0e6d2]/80 hover:border-[#c5a059] hover:text-[#c5a059]'
                              }`}
                            >
                              {timeRange}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[#f0e6d2]/60 italic bg-[#1a1614] p-6 rounded-lg border border-[#c5a059]/20 text-center">No pastoral sessions available on this date. Please select another date.</p>
                    )}
                  </div>
                )}

                {/* User Details */}
                <div className={`transition-opacity duration-500 pt-4 ${selectedSlotId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <h3 className="text-2xl font-serif font-semibold text-[#c5a059] mb-6 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1614] border border-[#c5a059]/50 text-sm">3</span>
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-[#1a1614] border rounded-md text-[#f0e6d2] focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none transition-colors ${formErrors.name ? 'border-red-500/50 focus:ring-red-500' : 'border-[#c5a059]/30'}`}
                        placeholder="e.g. John Doe"
                      />
                      {formErrors.name && <p className="mt-2 text-sm text-red-400">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-[#1a1614] border rounded-md text-[#f0e6d2] focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none transition-colors ${formErrors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-[#c5a059]/30'}`}
                        placeholder="john@example.com"
                      />
                      {formErrors.email && <p className="mt-2 text-sm text-red-400">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-[#1a1614] border rounded-md text-[#f0e6d2] focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none transition-colors ${formErrors.phone ? 'border-red-500/50 focus:ring-red-500' : 'border-[#c5a059]/30'}`}
                        placeholder="+1 (555) 000-0000"
                      />
                      {formErrors.phone && <p className="mt-2 text-sm text-red-400">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">Meeting Preference</label>
                      <select
                        name="appointmentMode"
                        value={formData.appointmentMode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 rounded-md text-[#f0e6d2] focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                      >
                        <option value="in-person">In Person (At Church)</option>
                        <option value="virtual">Virtual (Zoom/Phone)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-10">
                    <label className="block text-sm font-medium text-[#f0e6d2]/80 mb-2">Purpose of Meeting (Optional)</label>
                    <textarea
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1614] border border-[#c5a059]/30 rounded-md text-[#f0e6d2] focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none resize-none"
                      placeholder="e.g. Premarital counseling, prayer request, general discussion..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedSlotId}
                    className="w-full bg-[#c5a059] text-[#1a1614] text-lg font-bold py-4 rounded-md hover:bg-[#a68444] transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider flex justify-center items-center gap-3"
                  >
                    {loading && (
                      <div className="w-5 h-5 border-2 border-[#1a1614] border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {loading ? 'Confirming Session...' : 'Confirm Session'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
