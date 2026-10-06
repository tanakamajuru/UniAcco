// Locally-held record of which accommodation contacts this browser has paid to
// unlock. Anonymous by design: we store the revealed contact here rather than
// tying it to a server-side account.
// Shape: { [accommodationId]: { contact, validUntil, reference } }.
// `reference` is the payment reference the server checks on each visit, so a
// lapsed or copied record can't keep revealing the contact.
const KEY = 'uniacco.unlocks';

function readAll() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

function writeAll(all) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

// Returns the stored contact only while the unlock is still valid. Lapsed entries
// are removed, and entries saved before expiry dates existed are treated as lapsed.
export function getUnlock(id) {
  if (!id) return null;
  const all = readAll();
  const entry = all[id];
  const expires = entry && entry.validUntil ? new Date(entry.validUntil).getTime() : NaN;
  if (!entry || !(expires > Date.now())) {
    if (entry) forgetUnlock(id);
    return null;
  }
  return entry.contact || null;
}

// The payment reference for a stored unlock, so the server can re-check it.
export function getUnlockReference(id) {
  if (!id) return null;
  const entry = readAll()[id];
  return entry && entry.reference ? entry.reference : null;
}

export function saveUnlock(id, contact, validUntil, reference) {
  if (!id || !contact || !validUntil) return;
  const all = readAll();
  all[id] = { contact, validUntil, reference: reference || null };
  writeAll(all);
}

export function forgetUnlock(id) {
  const all = readAll();
  if (!(id in all)) return;
  delete all[id];
  writeAll(all);
}
