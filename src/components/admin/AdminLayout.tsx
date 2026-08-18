import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Mail, Award, LogOut,
  Menu, X, ChevronRight, Layers, Handshake
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Clients', href: '/admin/clients', icon: Handshake },
  { label: 'Leads & Enquiries', href: '/admin/leads', icon: Mail },
  { label: 'Certifications', href: '/admin/certifications', icon: Award },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { admin, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-[#E5E7EB] z-40 flex flex-col',
          'transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1557B0] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">PS</span>
            </div>
            <div>
              <div className="font-bold text-[#1F2937] text-sm">APR Services</div>
              <div className="text-[0.6rem] text-[#1557B0] uppercase tracking-wider font-semibold">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'admin-sidebar-link',
                  active && 'active'
                )}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-7 h-7 rounded-full bg-[#1557B0] flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#1F2937] truncate">{admin?.email}</div>
              <div className="text-[0.6rem] text-[#6B7280] capitalize">{admin?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5E7EB] px-5 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-sm text-[#1F2937] hover:bg-[#F4F8FC] transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div>
            <h1 className="text-base font-bold text-[#1F2937]">{title}</h1>
            {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-[#1557B0] hover:underline font-medium"
            >
              View Website →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
