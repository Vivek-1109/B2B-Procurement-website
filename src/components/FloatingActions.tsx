import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

const FloatingActions: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 350);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <aside aria-label="Quick Actions" className="fixed bottom-6 right-5 z-40 flex flex-col gap-2.5 items-end select-none">
      {/* WhatsApp Quick Chat */}
      <a
        href="https://wa.me/919911394456?text=Hello%20APR%20Services,%20I%20would%20like%20to%20enquire%20about%20aviation/industrial%20procurement."
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full p-2.5 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 border border-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={18} className="fill-white stroke-none" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold tracking-wide group-hover:px-2 opacity-0 group-hover:opacity-100">
          WhatsApp Us
        </span>
      </a>

      {/* Quick Quote Floating Link */}
      <Link
        to="/contact"
        className="group flex items-center bg-[#1557B0] hover:bg-[#0B2A4A] text-white rounded-full p-2.5 shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/35 border border-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
        title="Request a Fast Quote"
        aria-label="Request a Quote"
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <Send size={16} />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold tracking-wide group-hover:px-2 opacity-0 group-hover:opacity-100">
          Request Quote
        </span>
      </Link>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          'w-9 h-9 rounded-full bg-white text-[#1F2937] border border-[#E5E7EB] shadow-md hover:bg-[#1557B0] hover:text-white hover:border-[#1557B0] transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5',
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
        )}
        title="Scroll to Top"
        aria-label="Scroll to top"
      >
        <ArrowUp size={15} />
      </button>
    </aside>
  );
};

export default FloatingActions;
