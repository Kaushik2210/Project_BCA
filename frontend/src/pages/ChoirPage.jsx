import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import choirBg from '../assets/schedule-church-atmosphere.png'; 
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ChoirPage = () => {
    const container = useRef();
    const calendarCard = useRef();
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [direction, setDirection] = useState(1);
    const [easterEggCount, setEasterEggCount] = useState(0);

    // Mock Backend Data
    const events = [
        { day: 5, type: 'practice', title: 'Vocal Warmups', time: '6:00 PM' },
        { day: 7, type: 'practice', title: 'Full Rehearsal', time: '7:30 PM' },
        { day: 9, type: 'event', title: 'Sunday Service', time: '9:00 AM' },
        { day: 12, type: 'practice', title: 'Sectionals: Altos', time: '6:30 PM' },
        { day: 16, type: 'event', title: 'Special Worship Night', time: '7:00 PM' },
        { day: 21, type: 'practice', title: 'Easter Prep', time: '7:00 PM' },
        { day: 23, type: 'event', title: 'Sunday Service', time: '9:00 AM' },
        { day: 28, type: 'practice', title: 'Dress Rehearsal', time: '5:00 PM' },
    ];

    // Calendar Logic
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (delta, e) => {
        if (e) e.stopPropagation(); // Prevent any parent handlers
        setDirection(delta);
        
        setCurrentDate(prevDate => {
             // Create new date set to the 1st of the next/prev month
             return new Date(prevDate.getFullYear(), prevDate.getMonth() + delta, 1);
        });
    };


    useGSAP(() => {
        // 1. Elastic Grid Transition
        gsap.fromTo(".calendar-cell",
            { y: direction * 50, opacity: 0, scale: 0.8 },
            { 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                duration: 0.8, 
                stagger: {
                    amount: 0.3,
                    grid: [7, 5],
                    from: direction > 0 ? "start" : "end"
                },
                ease: "elastic.out(1, 0.5)" 
            }
        );

    }, { scope: container, dependencies: [currentDate] });

    // 3D Tilt Effect
    useEffect(() => {
        const card = calendarCard.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 1000
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Easter Egg Logic
    const triggerEasterEgg = () => {
        if (easterEggCount + 1 >= 5) {
            // Crazy Animation
            gsap.to(".calendar-cell", {
                rotation: () => Math.random() * 360,
                scale: () => Math.random() * 1.5 + 0.5,
                x: () => (Math.random() - 0.5) * 500,
                y: () => (Math.random() - 0.5) * 500,
                duration: 1,
                stagger: 0.01,
                ease: "power4.in",
                yoyo: true,
                repeat: 1
            });
            setEasterEggCount(0); // Reset
        } else {
            setEasterEggCount(prev => prev + 1);
            // Hint Animation
            gsap.to(".header-title", {
                scale: 1.1,
                color: "#ff0000",
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                onComplete: () => gsap.to(".header-title", { color: "#c5a059", scale: 1 })
            });
        }
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-brand-red/10 bg-white/5 opacity-50"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const hasEvent = events.find(e => e.day === day);
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

            days.push(
                <div 
                    key={day} 
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`calendar-cell h-24 md:h-32 border border-brand-red/20 p-2 relative transition-all duration-300 hover:z-10 cursor-pointer group hover:bg-brand-red/20
                        ${isSelected ? 'bg-brand-red/20 shadow-[inset_0_0_20px_rgba(197,160,89,0.2)]' : 'bg-transparent'}
                        ${isToday ? 'border-brand-red' : ''}
                    `}
                >
                    <span className={`text-sm font-bold font-mono ${isToday ? 'text-brand-red' : 'text-brand-dark/50'}`}>{day}</span>
                    
                    {hasEvent && (
                        <div className={`mt-2 text-xs md:text-sm p-1 md:p-2 rounded-lg font-bold truncate transition-transform group-hover:scale-110 group-hover:-rotate-2
                            ${hasEvent.type === 'event' 
                                ? 'bg-brand-red text-brand-beige shadow-[0_0_15px_#c5a059]' 
                                : 'bg-brand-dark text-brand-beige opacity-80'
                            }
                        `}>
                            {hasEvent.title}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <>
            <Navbar />
            <div ref={container} className="bg-brand-beige text-brand-dark min-h-screen relative overflow-hidden perspective-[2000px]">
                
                {/* Background Decor */}
                <div 
                    className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url(${choirBg})` }}
                ></div>

                <div className="pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-brand-red/30 pb-8 select-none">
                        <div onClick={triggerEasterEgg} className="cursor-pointer">
                            <h1 className="header-title text-5xl md:text-7xl font-serif text-brand-red mb-4 transition-colors">Choir Schedule</h1>
                            <p className="text-xl text-brand-dark/70 italic">
                                "Sing to the Lord a new song." {easterEggCount > 0 && <span className="text-xs text-red-500 ml-2">({5 - easterEggCount} clicks...)</span>}
                            </p>
                        </div>
                    </div>

                    {/* Calendar Interface with 3D Tilt */}
                    <div ref={calendarCard} className="bg-brand-beige/50 backdrop-blur-xl border border-brand-red/20 rounded-3xl overflow-hidden shadow-2xl will-change-transform">
                        
                        {/* Calendar Header Controls */}
                        <div 
                            className="flex justify-between items-center p-8 bg-brand-red/5 border-b border-brand-red/20 relative z-50"
                            onMouseMove={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={(e) => changeMonth(-1, e)}
                                className="w-12 h-12 rounded-full border border-brand-red/30 flex items-center justify-center hover:bg-brand-red hover:text-brand-beige transition-all active:scale-90 cursor-pointer text-xl pb-1"
                            >
                                &larr;
                            </button>
                            <h2 className="text-3xl font-serif font-bold text-brand-dark">
                                {monthNames[currentDate.getMonth()]} <span className="text-brand-red">{currentDate.getFullYear()}</span>
                            </h2>
                            <button 
                                onClick={(e) => changeMonth(1, e)}
                                className="w-12 h-12 rounded-full border border-brand-red/30 flex items-center justify-center hover:bg-brand-red hover:text-brand-beige transition-all active:scale-90 cursor-pointer text-xl pb-1"
                            >
                                &rarr;
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 border-b border-brand-red/20 bg-brand-beige">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="p-4 text-center font-bold uppercase tracking-widest text-brand-red text-xs md:text-sm">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 bg-brand-beige overflow-hidden">
                            {renderCalendarDays()}
                        </div>

                    </div>

                    {/* Selected Day Details Panel */}
                    <div className="mt-12 p-8 border-t border-brand-red/20">
                         <h3 className="text-2xl font-serif text-brand-red mb-4">
                             {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                         </h3>
                         {events.find(e => e.day === selectedDate.getDate()) ? (
                             <div className="bg-brand-red/10 p-6 rounded-xl border-l-4 text-brand-red animate-pulse">
                                 <h4 className="text-xl font-bold text-brand-dark mb-2">{events.find(e => e.day === selectedDate.getDate()).title}</h4>
                                 <p className="text-brand-red font-mono">{events.find(e => e.day === selectedDate.getDate()).time}</p>
                             </div>
                         ) : (
                             <p className="text-brand-dark/40 italic">No events scheduled for this day.</p>
                         )}
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
};

export default ChoirPage;
