import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

const navLinks = [
  { label: 'Home', href: '/', isRoute: true },
  { label: 'Products', href: '/products', isRoute: true },
  { label: 'Contact Us', href: '/contact', isRoute: true },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isRoute?: boolean) => {
    if (isRoute) return;
    if (href === '/') {
      e.preventDefault();
      if (location.pathname !== '/') navigate('/');
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      setMobileOpen(false);
      return;
    }
  };

  if (isAdminPage) return null;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-[#E5E7EB] shadow-2xs group-hover:border-[#1557B0]/40 group-hover:scale-105 transition-all duration-300">
              <img
                src="/apr-logo.jpg"
                alt="APR Services Logo"
                className="w-full h-full object-contain p-0.5"
                loading="eager"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1F2937] leading-none group-hover:text-[#1557B0] transition-colors">
                APR Services
              </span>
              <span className="text-[9px] tracking-[0.22em] uppercase font-bold text-[#1557B0] mt-0.5">
                Enterprise Sourcing
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.href;
              return link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                    isActive
                      ? 'text-[#1557B0] bg-[#F4F8FC] shadow-2xs'
                      : 'text-[#4B5563] hover:text-[#1557B0] hover:bg-[#F4F8FC]'
                  )}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => handleNavClick(e, link.href, link.isRoute)}
                  className="px-4 py-2 text-sm font-semibold text-[#4B5563] hover:text-[#1557B0] hover:bg-[#F4F8FC] rounded-lg transition-all duration-200"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#1557B0] hover:bg-[#0B2A4A] text-white font-bold shadow-xs px-4 py-2 text-xs uppercase tracking-wider rounded-md"
              >
                Request Quote
                <ArrowRight size={13} className="ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#1F2937] hover:bg-[#F4F8FC] transition-colors border border-[#E5E7EB]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-[#E5E7EB] shadow-lg',
          mobileOpen ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0 border-none'
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  'block px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors',
                  isActive
                    ? 'text-[#1557B0] bg-[#F4F8FC]'
                    : 'text-[#4B5563] hover:text-[#1557B0] hover:bg-[#F4F8FC]'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#E5E7EB]">
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center bg-[#1557B0] text-white">
                Request Quote
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
