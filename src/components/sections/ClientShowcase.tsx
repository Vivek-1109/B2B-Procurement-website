import React, { useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Award } from 'lucide-react';

const ClientShowcase: React.FC = () => {
  const { clients_list } = useAdmin();

  // Filter only active clients
  const activeClients = useMemo(() => {
    return clients_list.filter((c) => c.isActive);
  }, [clients_list]);

  // Repeat the client list to ensure there are enough logos to fill the marquee track infinitely
  const marqueeItems = useMemo(() => {
    if (activeClients.length === 0) return [];

    const list = [...activeClients];
    const targetCount = 18;
    const repeatCount = Math.max(2, Math.ceil(targetCount / list.length));

    return Array(repeatCount)
      .fill(list)
      .flat()
      .map((client, index) => ({
        ...client,
        uniqueId: `${client.id}-${index}`,
      }));
  }, [activeClients]);

  if (activeClients.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-[#F4F8FC] via-[#F4F8FC]/60 to-white py-8 overflow-hidden relative border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-[#1557B0]" />
          <h2 className="text-xs sm:text-sm font-bold text-[#4B5563] uppercase tracking-[0.18em] font-sans">
            Authorized Brands & Strategic Supply Partners
          </h2>
        </div>
      </div>

      {/* Marquee container */}
      <div className="relative w-full flex overflow-x-hidden">
        {/* Soft edge gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#F4F8FC] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#F4F8FC] to-transparent z-10 pointer-events-none" />

        <div className="marquee-track marquee-left py-2">
          {marqueeItems.map((client) => {
            const firstLetter = client.name ? client.name.charAt(0).toUpperCase() : 'P';
            return (
              <div
                key={client.uniqueId}
                className="flex items-center justify-center bg-white border border-[#E5E7EB] rounded-xl py-3 px-6 shadow-2xs h-18 min-w-[220px] max-w-[260px] mx-4 hover:border-[#1557B0]/40 hover:shadow-md transition-all duration-300 group select-none cursor-pointer"
              >
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="max-h-12 max-w-[160px] object-contain group-hover:scale-105 transition-transform duration-300 filter contrast-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-[#1557B0]/10 text-[#1557B0] flex items-center justify-center font-serif text-sm font-extrabold group-hover:bg-[#1557B0] group-hover:text-white transition-colors duration-300">
                      {firstLetter}
                    </span>
                    <span className="font-sans font-bold text-xs tracking-wider text-[#4B5563] group-hover:text-[#1557B0] transition-colors duration-300 uppercase truncate">
                      {client.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClientShowcase;
