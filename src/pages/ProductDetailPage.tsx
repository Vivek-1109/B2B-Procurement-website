import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag, Shield, CheckCircle, Package, Send, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { useSEO } from '../hooks/useSEO';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, loadingProducts } = useAdmin();

  // Find current product
  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  const seoData = useMemo(() => {
    if (!product) return null;

    const pSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': product.name,
      'image': product.imageUrl,
      'description': product.description,
      'category': product.category,
      'brand': {
        '@type': 'Brand',
        'name': 'APR Services Enterprise',
      },
      'offers': {
        '@type': 'AggregateOffer',
        'priceCurrency': 'INR',
        'offerCount': '1',
        'priceValued': 'Request Quote',
      },
    };

    const bSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://aprsvs.com/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Products',
          'item': 'https://aprsvs.com/products'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': product.category,
          'item': `https://aprsvs.com/products?category=${encodeURIComponent(product.category)}`
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': product.name,
          'item': `https://aprsvs.com/products/${product.id}`
        }
      ]
    };

    return {
      title: `${product.name} | B2B Procurement | APR Services Enterprise`,
      description: `Source ${product.name} in bulk. ${product.description.slice(0, 150)}... Request a fast wholesale proposal today.`,
      canonicalUrl: `https://aprsvs.com/products/${product.id}`,
      schemaMarkup: [pSchema, bSchema]
    };
  }, [product]);

  useSEO({
    title: seoData?.title || 'Product Detail | APR Services Enterprise',
    description: seoData?.description || 'Browse high-quality aviation and industrial consumables.',
    canonicalUrl: seoData?.canonicalUrl,
    schemaMarkup: seoData?.schemaMarkup || undefined
  });

  // Find related products in the same category (excluding current)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  if (loadingProducts) {
    return (
      <>
        <Navbar />
        <div className="bg-[#F4F8FC] min-h-screen flex items-center justify-center pt-20">
          <div className="w-8 h-8 border-2 border-[#1557B0] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="bg-[#F4F8FC] min-h-screen pt-24 pb-16 flex flex-col items-center justify-center">
          <Tag size={48} className="text-[#1557B0]/30 mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2 font-serif">Product Not Found</h2>
          <p className="text-[#6B7280] text-sm mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/products">
            <Button variant="primary" size="md">Back to Catalogue</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-[#F4F8FC] min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[#6B7280] mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="hover:text-[#1557B0] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link to="/products" className="hover:text-[#1557B0] transition-colors">Products</Link>
            <ChevronRight size={10} />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1557B0] transition-colors">
              {product.category}
            </Link>
            <ChevronRight size={10} />
            <span className="text-[#1F2937] font-medium truncate">{product.name}</span>
          </nav>

          {/* Product Detail Grid */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 bg-white border border-[#E5E7EB] rounded-xl p-5 md:p-8 shadow-xs mb-16">
            
            {/* Image Section - Left (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="h-80 md:h-[400px] bg-[#F4F8FC] rounded-lg overflow-hidden border border-[#E5E7EB] relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag size={64} className="text-[#1557B0]/15" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#1557B0] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                  {product.category}
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 p-3 bg-[#F4F8FC] rounded-lg border border-[#E5E7EB]">
                  <Shield size={16} className="text-[#1557B0]" />
                  <span className="text-xs font-semibold text-[#1F2937]">Verified OEM Grade</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#F4F8FC] rounded-lg border border-[#E5E7EB]">
                  <Package size={16} className="text-[#1557B0]" />
                  <span className="text-xs font-semibold text-[#1F2937]">Bulk Sourcing only</span>
                </div>
              </div>
            </div>

            {/* Info Section - Right (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1557B0] tracking-widest uppercase mb-2 block">
                  Product Details
                </span>
                <h1 
                  className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-4 font-serif"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {product.name}
                </h1>
                
                {/* Description */}
                <div className="border-t border-[#E5E7EB] pt-4 mb-6">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Procurement Specifications Info */}
                <div className="bg-[#F4F8FC] border border-[#E5E7EB] rounded-lg p-4 mb-6">
                  <h3 className="text-xs font-bold text-[#1557B0] uppercase tracking-wider mb-3">Procurement Conditions</h3>
                  <ul className="space-y-2 text-xs text-[#4B5563]">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-[#1557B0]" />
                      <span><strong>Minimum Order:</strong> Sourced in bulk packs / case lots only</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-[#1557B0]" />
                      <span><strong>Pricing:</strong> Custom pricing based on order volume & location</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-[#1557B0]" />
                      <span><strong>Compliance:</strong> Full COA (Certificate of Analysis) / OEM certification provided</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-[#1557B0]" />
                      <span><strong>Logistics:</strong> Pan-India shipping with regulatory compliance clearances</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E5E7EB]">
                <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="flex-1">
                  <Button variant="primary" size="lg" className="w-full justify-center gap-2 bg-[#1557B0] hover:bg-[#0F448C] text-white">
                    <Send size={15} /> Request Quote / Send Enquiry
                  </Button>
                </Link>
                <Link to="/contact" className="flex-shrink-0">
                  <Button variant="outline" size="lg" className="w-full justify-center">
                    Contact Procurement Team
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="text-left mb-8">
                <span className="inline-block text-xs font-semibold text-[#1557B0] uppercase tracking-[0.15em] mb-2">
                  Similar Items
                </span>
                <h2 
                  className="text-2xl font-bold text-[#1F2937] font-serif"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  Related Products
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-lg hover:border-[#1557B0]/30 transition-all duration-300"
                  >
                    <div className="h-40 bg-[#F4F8FC] relative overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag size={28} className="text-[#1557B0]/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <h3 className="font-bold text-[#1F2937] text-xs leading-snug line-clamp-2 mb-2 group-hover:text-[#1557B0] transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-[10px] text-[#1557B0] font-semibold flex items-center gap-1">
                        View Product <ChevronRight size={10} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetailPage;
