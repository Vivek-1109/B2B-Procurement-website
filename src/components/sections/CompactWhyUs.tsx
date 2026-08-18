import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Package, Truck, Headphones } from 'lucide-react';

const advantages = [
  {
    icon: ShieldCheck,
    title: 'Verified Vendors',
    desc: 'Pre-qualified global manufacturers and certified aerospace suppliers.',
  },
  {
    icon: Package,
    title: 'Bulk Sourcing',
    desc: 'High-volume procurement with customized enterprise contract pricing.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Pan-India logistics networks with real-time consignment tracking.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'Direct technical account managers with 4-hour SLA response times.',
  },
];

const CompactWhyUs: React.FC = () => {
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
    <section ref={ref} className="py-14 md:py-18 bg-[#F4F8FC] border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left max-w-2xl mb-10">
          <span className="inline-block text-xs font-semibold text-[#1557B0] uppercase tracking-[0.15em] mb-2">
            Enterprise Advantage
          </span>
          <div className="w-8 h-0.5 bg-[#1557B0] mb-3" />
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-3 font-serif"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Why Partner With APR Services
          </h2>
          <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
            Reliable end-to-end supply solutions tailored for aerospace manufacturers, commercial airlines, and defense MRO facilities.
          </p>
        </div>

        {/* 4 Advantage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs hover:shadow-md hover:border-[#1557B0]/30 transition-all duration-500 flex flex-col justify-between ${
                  inView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#1557B0]/10 text-[#1557B0] flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5 mb-2">
                    <span className="text-[#1557B0]">✓</span> {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CompactWhyUs;
