import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Tag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const ProductShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const { categories_list, products } = useAdmin();

  // Compute product count per category
  const categoryCards = useMemo(() => {
    return categories_list.map(cat => {
      const count = products.filter(p => p.category === cat.name).length;
      return {
        name: cat.name,
        desc: cat.description,
        image: cat.imageUrl,
        count: `${count} Product${count !== 1 ? 's' : ''}`,
      };
    });
  }, [categories_list, products]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="categories" ref={containerRef} className="pt-10 md:pt-14 pb-14 md:pb-18 bg-[#F4F8FC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="text-left max-w-2xl">
            <span className="inline-block text-xs font-semibold text-[#1557B0] uppercase tracking-[0.15em] mb-2">
              Product Catalogue
            </span>
            <div className="w-8 h-0.5 bg-[#1557B0] mb-3" />
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-3 font-serif"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Browse by Category
            </h2>
            <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
              Find products by industry category. Select any category to explore our technical inventory and request bulk quotes.
            </p>
          </div>
          
          <Link
            to="/products"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1557B0] hover:text-[#0B2A4A] transition-colors group/cta whitespace-nowrap md:mb-1"
          >
            Explore All Products
            <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards Grid — Crisp Modern White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryCards.map((cat, idx) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-2xs hover:shadow-xl hover:border-[#1557B0]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${idx * 40}ms` }}
            >
              {/* Crisp, natural image frame without murky color overlays */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-102"
                  />
                ) : (
                  <Tag size={36} className="text-slate-300" />
                )}
                
                {/* Product Count Pill */}
                <div className="absolute top-3 right-3 bg-white/95 text-[#1557B0] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-slate-200 backdrop-blur-xs">
                  {cat.count}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-white border-t border-[#E5E7EB]">
                <div>
                  <h3
                    className="text-base sm:text-lg font-bold text-[#1F2937] group-hover:text-[#1557B0] transition-colors leading-snug mb-1.5 font-serif"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2 mb-4 font-normal">
                    {cat.desc}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-[#1557B0] group-hover:text-[#0B2A4A] transition-colors">
                  <span>View Catalogue</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-[#1557B0]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
