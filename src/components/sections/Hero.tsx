import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface HeroSlide {
  id: number;
  image: string;
  alt: string;
  tag: string;
  headline: string;
  description: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    image: '/hero-bg.jpg',
    alt: 'Aviation and industrial procurement supply chain facility',
    tag: 'B2B Sourcing & Supply',
    headline: 'Industrial & Aviation Procurement Solutions',
    description: 'Reliable sourcing of quality products for industrial, engineering and aviation requirements.',
  },
  {
    id: 2,
    image: '/hero-bg-2.jpg',
    alt: 'Commercial aircraft turbine maintenance and aerospace consumables',
    tag: 'Aerospace & Aviation Consumables',
    headline: 'Certified Aerospace & Industrial Supplies',
    description: 'High-performance adhesives, lubricants, sealants, and coatings delivered with full quality compliance.',
  },
  {
    id: 3,
    image: '/hero-bg-3.jpg',
    alt: 'Industrial chemical and materials procurement logistics',
    tag: 'Enterprise Bulk Procurement',
    headline: 'Streamlined Sourcing for Large Enterprises',
    description: 'Direct access to verified global manufacturers with transparent bulk pricing and on-time logistics.',
  },
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto advance every 4.5 seconds reliably
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, currentSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide(); // swipe left -> next slide
    } else if (distance < -minSwipeDistance) {
      prevSlide(); // swipe right -> previous slide
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      id="home"
      className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-4.5rem)] min-h-[580px] flex items-center justify-center overflow-hidden bg-[#0B2A4A] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Section"
    >
      {/* Background Slides with smooth fade transition */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Subtle dark navy overlay for crisp text readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to right, rgba(11, 42, 74, 0.88) 0%, rgba(11, 42, 74, 0.75) 50%, rgba(11, 42, 74, 0.65) 100%)',
        }}
      />

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="max-w-3xl">
          {/* Tag / Category Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1557B0]/20 border border-[#1557B0]/40 rounded-sm mb-5 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="text-xs font-semibold text-[#93C5FD] tracking-widest uppercase">
              {slides[currentSlide].tag}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.18] mb-5 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {slides[currentSlide].headline}
          </h1>

          {/* Short Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed mb-8 max-w-2xl font-normal">
            {slides[currentSlide].description}
          </p>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link to="/products">
              <Button
                variant="primary"
                size="lg"
                className="group w-full sm:w-auto justify-center bg-[#1557B0] hover:bg-[#0F448C] text-white font-semibold shadow-md"
              >
                Explore Products
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform ml-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto justify-center border-2 border-white/80 text-white hover:bg-white hover:text-[#0B2A4A] font-semibold bg-transparent transition-all"
              >
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all shadow-sm"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all shadow-sm"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Carousel Dots / Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-7 h-2 bg-[#1557B0] shadow-xs'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
