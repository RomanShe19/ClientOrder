const PHONE_REGEX = /^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePhone(value: string): string | true {
  if (!value) return 'Укажите номер телефона';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 11) return 'Номер телефона должен содержать 11 цифр';
  if (digits.length > 15) return 'Номер телефона слишком длинный';
  if (!PHONE_REGEX.test(value) && digits.length !== 11) {
    return 'Неверный формат телефона';
  }
  return true;
}

export function validateEmail(value: string): string | true {
  if (!value) return true;
  if (!EMAIL_REGEX.test(value)) return 'Неверный формат email';
  return true;
}

export function validateRequired(fieldName: string) {
  return (value: string): string | true => {
    if (!value || !value.trim()) return `Поле «${fieldName}» обязательно`;
    return true;
  };
}

export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('8') && digits.length > 1) {
    digits = '7' + digits.slice(1);
  }
  if (!digits.startsWith('7') && digits.length > 0) {
    digits = '7' + digits;
  }

  if (digits.length === 0) return '+7 ';
  if (digits.length <= 1) return '+7 ';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

export function sanitizeInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    })
    .trim();
}
