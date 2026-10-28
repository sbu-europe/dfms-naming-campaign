/**
 * DFMS naming campaign: receives submissions from index.html and writes them to this Google Sheet.
 *
 * One row per proposed name. Nothing is ever deleted or overwritten:
 * - When a person submits again, their earlier rows are marked "Replaced" and the new picks are added.
 *   Their latest submission is the one that counts, and the full history stays in the sheet.
 * - "Proposed since" keeps the time a person first sent a name while they keep it in every resubmission.
 *   A name dropped and added back later starts a new time.
 * - "First to propose" is "Yes" when no one else had an active entry for that name earlier.
 * - A confirmation email goes to the address used, so a person notices if someone submits in their name.
 * Setup: see ../README.md.
 */

const SHEET_NAME = 'Entries';
const MAX_PICKS = 3;
// Submissions close at the end of Friday 6 November 2026, Dhaka time.
const CLOSES_AT = new Date('2026-11-06T23:59:59+06:00');
const SEND_CONFIRMATION = true;
const CAMPAIGN_PAGE = ''; // optional: the hosted page URL, shown in the confirmation email

const EMAIL_RE = /^[^@\s]+@brainstation-?23\.com$/i;
const DOMAIN_RE = /^[a-z]{3,63}\.com$/; // letters only, same rule as the page
const HEADERS = [
  'Submitted at', 'Proposed since', 'Full name', 'Email', 'Pick', 'Domain',
  'Why it fits', 'Availability', 'First to propose', 'Entry', 'Submission ID'
];
const COL = { submitted: 1, since: 2, email: 4, domain: 6, entry: 10 };
const ACTIVE = 'Active';

function doPost(e) {
  if (new Date() > CLOSES_AT) {
    return reply({ ok: false, closed: true, error: 'Submissions closed on Friday 6 November 2026. Thank you for your interest.' });
  }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return reply({ ok: false, error: 'The sheet is busy. Please try again in a moment.' });
  }
  let result, confirmation;
  try {
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return reply({ ok: false, error: 'The submission could not be read.' });
    }

    const name = clean(data.name, 80);
    const email = String(data.email || '').trim().toLowerCase();
    if (!name) return reply({ ok: false, error: 'Enter your full name.' });
    if (!EMAIL_RE.test(email)) return reply({ ok: false, error: 'Use your Brain Station 23 email, ending in @brainstation-23.com.' });

    const seen = {};
    const picks = (Array.isArray(data.picks) ? data.picks : [])
      .map(p => ({ domain: cleanDomain(p && p.domain), why: clean(p && p.why, 160), status: clean(p && p.status, 20) }))
      .filter(p => p.domain && !seen[p.domain] && (seen[p.domain] = true))
      .slice(0, MAX_PICKS);
    if (!picks.length) return reply({ ok: false, error: 'Add at least one valid .com domain.' });

    const sheet = getSheet();
    const now = new Date();
    const last = sheet.getLastRow();
    const rows = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];

    // Earlier entries: this person's own first time per name, and other people's active entries.
    const mySince = {}, othersFirst = {};
    const myActiveRows = [];
    rows.forEach((r, i) => {
      const rEmail = String(r[COL.email - 1]).trim().toLowerCase();
      const rDomain = String(r[COL.domain - 1]).trim().toLowerCase();
      const rSince = r[COL.since - 1] instanceof Date ? r[COL.since - 1] : new Date(r[COL.submitted - 1]);
      if (r[COL.entry - 1] !== ACTIVE) return;
      if (rEmail === email) {
        // only names kept from the current entry keep their original time
        mySince[rDomain] = rSince;
        myActiveRows.push(i + 2);
      } else {
        if (!othersFirst[rDomain] || rSince < othersFirst[rDomain]) othersFirst[rDomain] = rSince;
      }
    });

    // Keep history: earlier active entries from this email become "Replaced".
    const replacedLabel = 'Replaced ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    myActiveRows.forEach(row => sheet.getRange(row, COL.entry).setValue(replacedLabel));

    const id = Utilities.getUuid().slice(0, 8);
    const earlierByOthers = [];
    const newRows = picks.map((p, i) => {
      const since = mySince[p.domain] || now;
      const first = !othersFirst[p.domain] || since <= othersFirst[p.domain];
      if (!first) earlierByOthers.push(p.domain);
      return [now, since, name, email, i + 1, p.domain, p.why, p.status, first ? 'Yes' : 'No', ACTIVE, id];
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, HEADERS.length).setValues(newRows);

    result = { ok: true, updated: myActiveRows.length > 0, earlierByOthers: earlierByOthers, id: id };
    confirmation = { name: name, email: email, picks: picks, updated: result.updated, id: id };
  } finally {
    lock.releaseLock();
  }

  if (SEND_CONFIRMATION) {
    try {
      sendConfirmation(confirmation);
      result.emailed = true;
    } catch (err) {
      result.emailed = false; // e.g. daily email quota reached; the entry is still saved
    }
  }
  return reply(result);
}

/** Health check: open the web app URL in a browser to confirm it is live. */
function doGet() {
  return reply({ ok: true, service: 'dfms-naming-campaign', open: new Date() <= CLOSES_AT });
}

/** Run this once from the Apps Script editor to grant email permission and check the daily quota. */
function testEmail() {
  const me = Session.getEffectiveUser().getEmail();
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
  MailApp.sendEmail(me, 'DFMS naming campaign: email test', 'Confirmation emails are working.');
  Logger.log('Test email sent to ' + me);
}

function sendConfirmation(c) {
  const list = c.picks.map((p, i) => (i + 1) + '. ' + p.domain + (p.why ? ' - ' + p.why.replace(/^'/, '') : '')).join('\n');
  const body = [
    'Hi ' + c.name.replace(/^'/, '') + ',',
    '',
    (c.updated ? 'Your DFMS naming entry was updated. These names replace your earlier ones:' : 'Thank you for taking part in the DFMS naming campaign. We received these names:'),
    '',
    list,
    '',
    'Reference: ' + c.id,
    'You can change your names until Friday 6 November 2026 by submitting again with this email. Your latest submission counts.',
    'The winner will be announced on Friday 13 November 2026.',
    CAMPAIGN_PAGE ? 'Campaign page: ' + CAMPAIGN_PAGE : '',
    '',
    'Did not submit this? Reply to this email so we can remove the entry.',
    '',
    'DFMS team, Brain Station 23'
  ].filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n');
  MailApp.sendEmail({ to: c.email, subject: 'Your DFMS naming entry' + (c.updated ? ' (updated)' : ''), body: body, name: 'DFMS Naming Campaign' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME, 0);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** Trim, cap length, and stop text being read as a spreadsheet formula. */
function clean(value, max) {
  let s = String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function cleanDomain(value) {
  const d = String(value || '').trim().toLowerCase();
  return DOMAIN_RE.test(d) ? d : '';
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
