import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, ZoomIn } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';


const FeaturedProducts: React.FC = () => {
  const { products, loadingProducts } = useAdmin();

  // Show first 4 active products as featured
  const featured = products.slice(0, 4);

  return (
    <section className="pt-10 md:pt-14 pb-20 md:pb-28 bg-white border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left max-w-2xl">
            <span className="inline-block text-xs font-semibold text-[#1557B0] uppercase tracking-[0.15em] mb-3">
              Premium Sourcing
            </span>
            <div className="w-8 h-0.5 bg-[#1557B0] mb-4" />
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-4 font-serif"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Featured Products
            </h2>
            <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
              Explore some of our highest-demand aviation and aerospace consumables, trusted by operators and MROs.
            </p>
          </div>

          <Link
            to="/products"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1557B0] hover:text-[#0B2A4A] transition-colors group/cta whitespace-nowrap md:mb-1"
          >
            View Full Catalogue
            <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading State */}
        {loadingProducts && products.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#F4F8FC] rounded-xl h-80 animate-pulse border border-[#E5E7EB]" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-xl hover:border-[#1557B0]/30 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#F4F8FC]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag size={36} className="text-[#1557B0]/20" />
                    </div>
                  )}
                  {/* Category */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] px-2.5 py-0.5 bg-[#1557B0] text-white rounded-full font-semibold">
                      {product.category}
                    </span>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#1557B0]/0 group-hover:bg-[#1557B0]/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-[#1557B0] text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                      <ZoomIn size={12} /> View Product
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 bg-white">
                  <h3 className="font-bold text-[#1F2937] text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-[#1557B0] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3 flex-1">
                    {product.description}
                  </p>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-xs text-[#1557B0] font-semibold flex items-center gap-1">
                      Specifications <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] text-white bg-[#1557B0] px-2.5 py-1 rounded-full font-semibold group-hover:bg-[#0B2A4A] transition-colors">
                      Get Quote
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#6B7280] text-sm">
            No products available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
