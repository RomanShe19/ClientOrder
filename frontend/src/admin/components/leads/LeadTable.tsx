import { format } from 'date-fns';
import type { LeadItem } from '../../types/admin';
import { TEMPERATURE_LABELS } from '../../types/admin';

interface LeadTableProps {
  leads: LeadItem[];
  onViewDetail: (id: number) => void;
}

const TEMP_STYLES: Record<string, string> = {
  hot: 'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-amber-100 text-amber-700 border-amber-200',
  cold: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onViewDetail }) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Заявки не найдены
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 pr-3 font-semibold text-gray-600">Приоритет</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">ID</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Имя</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Телефон</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Ниша</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Бюджет</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Отдел</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Дата</th>
            <th className="pb-3 font-semibold text-gray-600"></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => {
            const analysis = lead.analysis;
            const temp = analysis?.temperature ?? 'cold';
            const label = analysis ? TEMPERATURE_LABELS[temp] : '—';
            const style = TEMP_STYLES[temp] ?? TEMP_STYLES.cold;

            return (
              <tr
                key={lead.id}
                className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="py-3 pr-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${style}`}>
                      {analysis ? `${label} (${analysis.score})` : label}
                    </span>
                    {analysis?.personal_manager_needed && (
                      <span className="text-[10px] text-amber-600">👤 ПМ</span>
                    )}
                    {analysis && !analysis.worth_time && (
                      <span className="text-[10px] text-slate-500">⏱ низкий</span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-500">#{lead.id}</td>
                <td className="py-3 pr-4 font-medium text-gray-900">
                  {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="py-3 pr-4 text-gray-700">{lead.contact_phone}</td>
                <td className="py-3 pr-4 text-gray-700 max-w-[160px] truncate">{lead.business_niche}</td>
                <td className="py-3 pr-4">
                  <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium max-w-[140px] truncate" title={lead.budget}>
                    {lead.budget}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs max-w-[120px] truncate" title={analysis?.department}>
                  {analysis?.department ?? '—'}
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs">
                  {lead.created_at ? format(new Date(lead.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => onViewDetail(lead.id)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
