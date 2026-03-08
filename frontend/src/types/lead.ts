export interface LeadCreate {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  contact_phone: string;
  contact_email?: string;
  business_niche: string;
  company_size: string;
  task_volume: string;
  client_role: string;
  budget: string;
  preferred_contact_method: string;
  preferred_contact_time: string;
  product_interest: string;
  task_type: string;
  result_deadline: string;
  comments?: string;
}

export interface LeadResponse extends Required<Omit<LeadCreate, 'middle_name' | 'contact_email' | 'comments'>> {
  id: number;
  middle_name: string | null;
  contact_email: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  middle_name: string;
  contact_phone: string;
  contact_email: string;
  business_niche: string;
  company_size: string;
  task_volume: string;
  client_role: string;
  budget: string;
  preferred_contact_method: string;
  preferred_contact_time: string;
  product_interest: string;
  task_type: string;
  result_deadline: string;
  comments: string;
}

export const STEP_FIELDS: Record<number, (keyof LeadFormData)[]> = {
  1: ['first_name', 'last_name', 'middle_name', 'contact_phone', 'contact_email'],
  2: ['business_niche', 'company_size', 'task_volume', 'client_role'],
  3: ['budget', 'task_type', 'product_interest', 'result_deadline'],
  4: ['preferred_contact_method', 'preferred_contact_time', 'comments'],
};

export const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1–10 сотрудников' },
  { value: '11-50', label: '11–50 сотрудников' },
  { value: '51-200', label: '51–200 сотрудников' },
  { value: '200+', label: '200+ сотрудников' },
];

export const CLIENT_ROLE_OPTIONS = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Руководитель' },
  { value: 'owner', label: 'Владелец' },
];

export const DEADLINE_OPTIONS = [
  { value: '1_week', label: '1 неделя' },
  { value: '1_month', label: '1 месяц' },
  { value: '3_months', label: '3 месяца' },
  { value: '6_months+', label: '6 месяцев+' },
];

export const CONTACT_METHOD_OPTIONS = [
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export const DEFAULT_NICHES = [
  'IT и технологии',
  'E-commerce',
  'Финансы и банкинг',
  'Образование',
  'Здравоохранение',
  'Недвижимость',
  'Маркетинг и реклама',
  'Производство',
  'Логистика',
  'Другое',
];

export const DEFAULT_BUDGETS = [
  'до 100 000 ₽',
  '100 000 — 500 000 ₽',
  '500 000 — 1 000 000 ₽',
  '1 000 000 — 5 000 000 ₽',
  '5 000 000+ ₽',
];

export const DEFAULT_TASK_TYPES = [
  'Разработка сайта',
  'Мобильное приложение',
  'CRM / ERP система',
  'Автоматизация процессов',
  'Консалтинг',
  'Дизайн и брендинг',
  'SEO / Маркетинг',
  'Техническая поддержка',
  'Другое',
];
