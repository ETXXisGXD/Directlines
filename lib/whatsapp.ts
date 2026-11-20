export function formatWhatsAppNumber(phone: string): string {
  let clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = `234${clean.slice(1)}`;
  } else if (!clean.startsWith('234') && clean.length === 10) {
    clean = `234${clean}`;
  }
  return clean;
}

export function createWhatsAppUrl(phone: string, text?: string): string {
  const number = formatWhatsAppNumber(phone);
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;
}
