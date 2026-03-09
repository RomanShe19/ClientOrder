import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { adminService } from '../../services/adminService';
import type { LeadDetail as LeadDetailType } from '../../types/admin';
import { TEMPERATURE_LABELS } from '../../types/admin';

interface LeadDetailProps {
  leadId: number;
  onClose: () => void;
}

const TEMP_STYLES: Record<string, string> = {
  hot: 'bg-red-50 border-red-200 text-red-800',
  warm: 'bg-amber-50 border-amber-200 text-amber-800',
  cold: 'bg-slate-50 border-slate-200 text-slate-700',
};

export const LeadDetail: React.FC<LeadDetailProps> = ({ leadId, onClose }) => {
  const [lead, setLead] = useState<LeadDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getLeadDetail(leadId)
      .then(setLead)
      .catch(() => setLead(null))
      .finally(() => setLoading(false));
  }, [leadId]);

  const getPhoneLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return `tel:${clean.startsWith('7') ? '+' : ''}${clean}`;
  };

  const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    const num = clean.startsWith('7') ? clean : `7${clean}`;
    return `https://wa.me/${num}`;
  };

  const getTelegramLink = (method: string) => {
    if (method !== 'telegram') return null;
    const phone = lead?.contact_phone?.replace(/\D/g, '') ?? '';
    return phone ? `https://t.me/+${phone}` : null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-red-600">Заявка не найдена</p>
          <button onClick={onClose} className="mt-4 text-sm text-blue-600 hover:underline">Закрыть</button>
        </div>
      </div>
    );
  }

  const analysis = lead.analysis;
  const temp = analysis?.temperature ?? 'cold';
  const tempStyle = TEMP_STYLES[temp] ?? TEMP_STYLES.cold;

  const fields: [string, string | null][] = [
    ['Имя', lead.first_name],
    ['Фамилия', lead.last_name],
    ['Отчество', lead.middle_name],
    ['Телефон', lead.contact_phone],
    ['Email', lead.contact_email],
    ['Ниша', lead.business_niche],
    ['Размер компании', lead.company_size],
    ['Объём задач', lead.task_volume],
    ['Роль клиента', lead.client_role],
    ['Бюджет', lead.budget],
    ['Способ связи', lead.preferred_contact_method],
    ['Время связи', lead.preferred_contact_time],
    ['Интерес к продукту', lead.product_interest],
    ['Тип задачи', lead.task_type],
    ['Дедлайн', lead.result_deadline],
    ['Комментарии', lead.comments],
    ['Создана', lead.created_at ? format(new Date(lead.created_at), 'dd.MM.yyyy HH:mm') : null],
    ['Обновлена', lead.updated_at ? format(new Date(lead.updated_at), 'dd.MM.yyyy HH:mm') : null],
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Заявка #{lead.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Анализ и контакты */}
        <div className="p-5 space-y-4 border-b border-gray-100 bg-gray-50/50">
          {analysis && (
            <div className={`rounded-xl border p-4 ${tempStyle}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">
                  {TEMPERATURE_LABELS[temp]} · {analysis.score}/100
                </span>
                <span className="text-sm">{analysis.department}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {analysis.personal_manager_needed && (
                  <span className="px-2 py-1 bg-white/60 rounded">Нужен персональный менеджер</span>
                )}
                {analysis.worth_time ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Стоит времени</span>
                ) : (
                  <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded">Низкий приоритет</span>
                )}
              </div>
              {analysis.reason_summary && (
                <p className="text-xs mt-2 opacity-90">{analysis.reason_summary}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Связаться</p>
            <div className="flex flex-wrap gap-2">
              {lead.contact_phone && (
                <a
                  href={getPhoneLink(lead.contact_phone)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  Позвонить
                </a>
              )}
              {lead.contact_phone && (
                <a
                  href={getWhatsAppLink(lead.contact_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  WhatsApp
                </a>
              )}
              {lead.preferred_contact_method === 'telegram' && lead.contact_phone && (
                <a
                  href={getTelegramLink('telegram') ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Telegram
                </a>
              )}
              {lead.contact_email && (
                <a
                  href={`mailto:${lead.contact_email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {fields.map(([label, value]) => (
            <div key={label} className="flex text-sm">
              <span className="w-40 flex-shrink-0 text-gray-500">{label}</span>
              <span className="text-gray-900 font-medium break-words">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
