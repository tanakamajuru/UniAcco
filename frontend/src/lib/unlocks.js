// Locally-held record of which accommodation contacts this browser has paid to
// unlock. Anonymous by design: we store the revealed contact here rather than
// tying it to a server-side account. Shape: { [accommodationId]: { name, phone, email } }.
const KEY = 'uniacco.unlocks';

function readAll() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function getUnlock(id) {
  if (!id) return null;
  return readAll()[id] || null;
}

export function saveUnlock(id, contact) {
  if (!id || !contact) return;
  try {
    const all = readAll();
    all[id] = contact;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — contact stays visible for this session only */
  }
}
