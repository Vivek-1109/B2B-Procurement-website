import React, { useEffect, useState, useMemo } from 'react';
import { Package, Mail, Award, TrendingUp, Clock, CheckCircle2, AlertCircle, Layers, Handshake } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Link } from 'react-router-dom';
import { fetchLeads } from '../../api/leads';
import type { ContactLead } from '../../types';

const AdminDashboard: React.FC = () => {
  const { products, certifications, categories_list, clients_list } = useAdmin();
  const [leads, setLeads] = useState<ContactLead[]>([]);

  useEffect(() => {
    fetchLeads({ limit: 100 })
      .then(r => setLeads(r.leads))
      .catch(console.error);
  }, []);

  const { newLeads, contactedLeads, closedLeads, recentLeads } = useMemo(() => {
    const newL = leads.filter(l => l.status === 'new');
    const contactedL = leads.filter(l => l.status === 'contacted');
    const closedL = leads.filter(l => l.status === 'closed');
    const recentL = [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    return {
      newLeads: newL,
      contactedLeads: contactedL,
      closedLeads: closedL,
      recentLeads: recentL,
    };
  }, [leads]);

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/products',
    },
    {
      label: 'Total Enquiries',
      value: leads.length,
      icon: Mail,
      color: 'bg-teal-50 text-teal-600',
      href: '/admin/leads',
    },
    {
      label: 'New Enquiries',
      value: newLeads.length,
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-600',
      href: '/admin/leads',
    },
    {
      label: 'Certifications',
      value: certifications.length,
      icon: Award,
      color: 'bg-purple-50 text-purple-600',
      href: '/admin/certifications',
    },
    {
      label: 'Categories',
      value: categories_list.length,
      icon: Layers,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/admin/categories',
    },
    {
      label: 'Clients',
      value: clients_list.length,
      icon: Handshake,
      color: 'bg-indigo-50 text-indigo-600',
      href: '/admin/clients',
    },
  ];

  const statusConfig = {
    new: { label: 'New', class: 'badge-new', icon: AlertCircle },
    contacted: { label: 'Contacted', class: 'badge-contacted', icon: Clock },
    closed: { label: 'Closed', class: 'badge-closed', icon: CheckCircle2 },
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your procurement portal">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            to={href}
            className="bg-white rounded-sm border border-[#E5E7EB] p-5 flex items-center gap-4 hover:shadow-md hover:border-[#1557B0]/30 transition-all"
          >
            <div className={`w-11 h-11 rounded-sm flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1F2937]">{value}</div>
              <div className="text-xs text-[#6B7280]">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Lead status breakdown */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-sm border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#1F2937]">Lead Pipeline</span>
            <TrendingUp size={16} className="text-[#1557B0]" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">New</span>
                <span className="font-medium text-[#1F2937]">{newLeads.length}</span>
              </div>
              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${leads.length ? (newLeads.length / leads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">Contacted</span>
                <span className="font-medium text-[#1F2937]">{contactedLeads.length}</span>
              </div>
              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${leads.length ? (contactedLeads.length / leads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">Closed</span>
                <span className="font-medium text-[#1F2937]">{closedLeads.length}</span>
              </div>
              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${leads.length ? (closedLeads.length / leads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-sm border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-3 bg-[#F4F8FC] rounded-sm border border-[#E5E7EB] hover:border-[#1557B0]/30 hover:shadow-xs transition-all text-sm font-medium text-[#1F2937]"
            >
              <Package size={16} className="text-[#1557B0]" />
              Add Product
            </Link>
            <Link
              to="/admin/leads"
              className="flex items-center gap-3 p-3 bg-[#F4F8FC] rounded-sm border border-[#E5E7EB] hover:border-[#1557B0]/30 hover:shadow-xs transition-all text-sm font-medium text-[#1F2937]"
            >
              <Mail size={16} className="text-[#1557B0]" />
              View Leads
            </Link>
            <Link
              to="/admin/certifications"
              className="flex items-center gap-3 p-3 bg-[#F4F8FC] rounded-sm border border-[#E5E7EB] hover:border-[#1557B0]/30 hover:shadow-xs transition-all text-sm font-medium text-[#1F2937]"
            >
              <Award size={16} className="text-[#1557B0]" />
              Manage Certs
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-3 bg-[#F4F8FC] rounded-sm border border-[#E5E7EB] hover:border-[#1557B0]/30 hover:shadow-xs transition-all text-sm font-medium text-[#1F2937]"
            >
              <Layers size={16} className="text-[#1557B0]" />
              Manage Categories
            </Link>
            <Link
              to="/admin/clients"
              className="flex items-center gap-3 p-3 bg-[#F4F8FC] rounded-sm border border-[#E5E7EB] hover:border-[#1557B0]/30 hover:shadow-xs transition-all text-sm font-medium text-[#1F2937]"
            >
              <Handshake size={16} className="text-[#1557B0]" />
              Manage Clients
            </Link>
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-3 bg-[#F4F8FC] rounded-sm border border-[#E5E7EB] hover:border-[#1557B0]/30 hover:shadow-xs transition-all text-sm font-medium text-[#1F2937]"
            >
              <TrendingUp size={16} className="text-[#1557B0]" />
              View Website
            </a>
          </div>
        </div>
      </div>

      {/* Recent leads table */}
      <div className="bg-white rounded-sm border border-[#E5E7EB]">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1F2937]">Recent Enquiries</h3>
          <Link to="/admin/leads" className="text-xs text-[#1557B0] hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#E5E7EB]">
                {['Name', 'Company', 'Email', 'Date', 'Status'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {recentLeads.map(lead => {
                const status = statusConfig[lead.status];
                return (
                  <tr key={lead.id} className="hover:bg-[#F4F8FC] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{lead.name}</td>
                    <td className="px-4 py-3 text-[#4B5563]">{lead.company}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{lead.email}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-sm font-medium ${status.class}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6B7280]">
                    No enquiries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
