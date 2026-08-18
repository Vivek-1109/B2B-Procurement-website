import React, { useEffect, useState, useCallback } from 'react';
import { Mail, Trash2, ChevronLeft, ChevronRight, Eye, X, Phone } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import { fetchLeads, updateLeadStatusApi, deleteLeadApi } from '../../api/leads';
import type { ContactLead } from '../../types';
import { cn } from '../../utils/cn';

type StatusFilter = 'all' | 'new' | 'contacted' | 'closed';

const statusConfig = {
  new: { label: 'New', class: 'badge-new' },
  contacted: { label: 'Contacted', class: 'badge-contacted' },
  closed: { label: 'Closed', class: 'badge-closed' },
};

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { leads: data, pagination } = await fetchLeads({
        page,
        limit: 20,
        status: statusFilter,
      });
      setLeads(data);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleStatusChange = async (id: string, status: ContactLead['status']) => {
    setUpdatingId(id);
    try {
      const updated = await updateLeadStatusApi(id, status);
      setLeads(prev => prev.map(l => (l.id === id ? updated : l)));
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLeadApi(id);
      setConfirmDelete(null);
      loadLeads();
    } catch {
      alert('Failed to delete lead');
    }
  };

  const tabs: { label: string; value: StatusFilter; count?: number }[] = [
    { label: 'All', value: 'all', count: total },
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <AdminLayout title="Leads & Enquiries" subtitle="Manage procurement enquiries from the contact form">
      {/* Status filter tabs */}
      <div className="flex gap-1 mb-5 bg-[#E5E7EB] p-1 rounded-sm w-fit">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-sm transition-all',
              statusFilter === tab.value
                ? 'bg-white text-[#1557B0] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1557B0]'
            )}
          >
            {tab.label}
            {tab.count !== undefined ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[#1557B0] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center text-[#6B7280]">
            <Mail size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F8FC] border-b border-[#E5E7EB]">
                  {['Name & Company', 'Contact', 'Date', 'Status', 'Actions'].map(h => (
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
                {leads.map(lead => {
                  return (
                    <tr key={lead.id} className="hover:bg-[#F4F8FC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#1F2937]">{lead.name}</div>
                        <div className="text-xs text-[#6B7280]">{lead.company}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[#4B5563]">{lead.email}</div>
                        <div className="text-xs text-[#6B7280]">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={e =>
                            handleStatusChange(lead.id, e.target.value as ContactLead['status'])
                          }
                          className="text-xs border border-[#E5E7EB] rounded-sm px-2 py-1 bg-white text-[#1F2937] focus:border-[#1557B0] outline-none"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-sm text-[#1557B0] hover:bg-[#1557B0]/10 transition-colors"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 rounded-sm text-[#1557B0] hover:bg-[#1557B0]/10 transition-colors"
                            title="Send email"
                          >
                            <Mail size={14} />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-sm text-[#1557B0] hover:bg-[#1557B0]/10 transition-colors"
                            title="Call"
                          >
                            <Phone size={14} />
                          </a>
                          <button
                            onClick={() => setConfirmDelete(lead.id)}
                            className="p-1.5 rounded-sm text-red-400 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-sm border border-[#E5E7EB] disabled:opacity-40 hover:border-[#1557B0] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-sm border border-[#E5E7EB] disabled:opacity-40 hover:border-[#1557B0] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="font-bold text-[#1F2937]">Enquiry Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-sm hover:bg-[#F4F8FC] text-[#6B7280]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Name</div>
                  <div className="text-sm font-medium text-[#1F2937]">{selectedLead.name}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Company</div>
                  <div className="text-sm font-medium text-[#1F2937]">{selectedLead.company}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Email</div>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="text-sm text-[#1557B0] hover:underline"
                  >
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Phone</div>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="text-sm text-[#1557B0] hover:underline"
                  >
                    {selectedLead.phone}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] mb-2">Requirement</div>
                <p className="text-sm text-[#1F2937] bg-[#F4F8FC] p-3 rounded-sm border border-[#E5E7EB] leading-relaxed">
                  {selectedLead.message}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-sm font-medium ${statusConfig[selectedLead.status].class}`}
                >
                  {statusConfig[selectedLead.status].label}
                </span>
                <span className="text-xs text-[#6B7280]">
                  {new Date(selectedLead.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-[#1F2937] mb-2">Delete Enquiry?</h3>
            <p className="text-sm text-[#6B7280] mb-5">
              This will permanently remove this lead. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLeads;
