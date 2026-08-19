// Build tel: and WhatsApp links from a (usually Zimbabwean) phone number.
// Normalises local formats (07xx / +263 / 00263) to a bare international number.
export function normalizeZwPhone(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '263' + d.slice(1); // local 07xx -> 2637xx
  else if (d.startsWith('7')) d = '263' + d; // 7xx -> 2637xx
  return d.length >= 8 ? d : null;
}

export function telLink(raw) {
  const d = normalizeZwPhone(raw);
  return d ? `tel:+${d}` : null;
}

export function whatsappLink(raw, text) {
  const d = normalizeZwPhone(raw);
  if (!d) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${d}${q}`;
}
