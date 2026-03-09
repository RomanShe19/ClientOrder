import { useCallback, useEffect, useState } from 'react';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadDetail } from '../components/leads/LeadDetail';
import { LeadFilters } from '../components/leads/LeadFilters';
import { adminService } from '../services/adminService';
import type { LeadItem } from '../types/admin';

const PAGE_SIZE = 20;

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    budget: '',
    date_from: '',
    date_to: '',
    sort: 'urgency' as 'urgency' | 'date',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        sort: filters.sort,
      };
      if (filters.budget) params.budget = filters.budget;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const data = await adminService.getLeads(params);
      setLeads(data.items);
      setTotal(data.total);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const exportCsv = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Имя', 'Фамилия', 'Телефон', 'Email', 'Ниша', 'Бюджет', 'Дата'];
    const rows = leads.map((l) => [
      l.id,
      l.first_name || '',
      l.last_name || '',
      l.contact_phone,
      l.contact_email || '',
      l.business_niche,
      l.budget,
      l.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Заявки</h1>
        <button
          onClick={exportCsv}
          disabled={leads.length === 0}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700
            hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Экспорт CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <LeadFilters filters={filters} onChange={handleFiltersChange} />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <LeadTable leads={leads} onViewDetail={setSelectedLead} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Показано {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} из {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700
                      hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    ←
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700
                      hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedLead !== null && (
        <LeadDetail leadId={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
};
