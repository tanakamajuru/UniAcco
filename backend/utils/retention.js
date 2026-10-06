/**
 * Data minimization: payer details are only needed to start a payment.
 * Once a payment is settled (paid or failed), or an attempt is abandoned,
 * the payer's email and phone are cleared. The payment row itself is kept
 * for reconciliation, but without personal data.
 */

const ABANDONED_AFTER = "interval '1 day'";

// Clears payer email/phone on settled or abandoned payments. Idempotent.
async function purgePayerDetails(pool) {
  const { rowCount } = await pool.query(
    `UPDATE payments
        SET email = NULL, phone = NULL
      WHERE (email IS NOT NULL OR phone IS NOT NULL)
        AND (status <> 'pending' OR created_at < now() - ${ABANDONED_AFTER})`
  );
  return rowCount;
}

// Clears the student's personal copy (name, email, phone, message) on applications
// that are declined or withdrawn after 30 days, or any application older than 180 days.
// The row is kept so the landlord's history still counts. Idempotent.
async function purgeApplicationDetails(pool) {
  const { rowCount } = await pool.query(
    `UPDATE applications
        SET full_name = NULL, email = NULL, phone = NULL, message = NULL
      WHERE (full_name IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL OR message IS NOT NULL)
        AND ((status IN ('declined', 'withdrawn') AND created_at < now() - interval '30 days')
          OR created_at < now() - interval '180 days')`
  );
  return rowCount;
}

// Clears the name and phone on a viewing request 30 days after the viewing date.
// The row stays so the landlord's history still counts. Idempotent.
async function purgeViewingDetails(pool) {
  const { rowCount } = await pool.query(
    "UPDATE viewing_requests SET full_name = NULL, phone = NULL " +
    "WHERE (full_name IS NOT NULL OR phone IS NOT NULL) AND requested_at < now() - interval '30 days'"
  );
  return rowCount;
}

// Removes roommate profiles past their 30-day expiry. Idempotent.
async function purgeRoommateProfiles(pool) {
  const { rowCount } = await pool.query('DELETE FROM roommate_profiles WHERE expires_at <= now()');
  return rowCount;
}

// Runs the purge at boot and then once a day. Errors are logged, never thrown,
// so a failed cleanup can't take the API down.
function schedulePayerPurge(pool, intervalMs = 24 * 60 * 60 * 1000) {
  const run = () =>
    Promise.all([purgePayerDetails(pool), purgeApplicationDetails(pool), purgeViewingDetails(pool), purgeRoommateProfiles(pool)])
      .then(([p, a]) => (p || a) && console.log(`Retention: cleared payer details on ${p} payment(s), application details on ${a} application(s)`))
      .catch((err) => console.error('Retention purge failed:', err.message));

  run();
  const timer = setInterval(run, intervalMs);
  timer.unref();
  return timer;
}

module.exports = { purgePayerDetails, purgeApplicationDetails, purgeViewingDetails, purgeRoommateProfiles, schedulePayerPurge };
