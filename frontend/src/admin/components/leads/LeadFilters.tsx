interface LeadFiltersProps {
  filters: {
    budget: string;
    date_from: string;
    date_to: string;
    sort: 'urgency' | 'date';
  };
  onChange: (filters: LeadFiltersProps['filters']) => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onChange }) => {
  const update = (field: string, value: string) => {
    onChange({ ...filters, [field]: value } as LeadFiltersProps['filters']);
  };

  const clear = () => {
    onChange({ budget: '', date_from: '', date_to: '', sort: 'urgency' });
  };

  const hasFilters = filters.budget || filters.date_from || filters.date_to;

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Сортировка</label>
        <select
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="urgency">По приоритету (срочные сверху)</option>
          <option value="date">По дате (новые сверху)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Бюджет</label>
        <input
          type="text"
          value={filters.budget}
          onChange={(e) => update('budget', e.target.value)}
          placeholder="Фильтр по бюджету"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Дата от</label>
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => update('date_from', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Дата до</label>
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => update('date_to', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {hasFilters && (
        <button
          onClick={clear}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Сбросить
        </button>
      )}
    </div>
  );
};
