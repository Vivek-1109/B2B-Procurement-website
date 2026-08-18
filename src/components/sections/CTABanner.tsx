import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

const CTABanner: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-20 bg-[#F4F8FC] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-2xl bg-gradient-to-br from-[#1557B0] via-[#103E70] to-[#0B2A4A] p-8 sm:p-12 md:p-14 text-white shadow-xl overflow-hidden transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Subtle geometric background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-[#1557B0]/30 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-bold text-[#93C5FD] uppercase tracking-[0.2em] mb-3 px-3 py-1 bg-white/10 rounded-full border border-white/15 backdrop-blur-xs">
              Fast Aerospace Sourcing
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-serif text-white tracking-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Ready to Source Your Next Consumables Order?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed font-normal">
              Connect with our procurement specialists for bulk pricing, guaranteed OEM documentation, and expedited delivery timelines.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#1557B0] hover:bg-slate-100 hover:text-[#0B2A4A] font-bold shadow-md"
                >
                  Browse Products <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-white/80 text-white hover:bg-white/10 flex items-center justify-center gap-2 font-semibold bg-transparent"
                >
                  Request a Quote <MessageSquare size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
