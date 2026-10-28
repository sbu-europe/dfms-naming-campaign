# DFMS Naming Campaign ("Name It. Win It.")

A one-page campaign site where colleagues search `.com` domains live and submit up to three name ideas. Submissions go straight into a Google Sheet that you can export to Excel.

| File | Purpose |
|---|---|
| `index.html` | The campaign website. Host it on any static web server. |
| `google-apps-script/Code.gs` | Receives submissions and writes them to the Google Sheet. |
| `dfms-naming-campaign-a4.pdf` | Printable A4 poster with a QR code. |
| `qr-landing-page.png` | QR code image for slides and posts. |

## How it works

1. **Search.** The "Search & submit" section, just under the hero, checks each `.com` live against [DotSweep](https://dotsweep.com/docs/check), a free API with no key needed. The result shows as Available, Taken or Couldn't confirm, along with a typical yearly price. Names that break the naming rules are flagged before they are checked.
2. **Pick.** Each person keeps up to three domains and can add an optional "why it fits" line to each. Picks, name and email are saved on their device as they go, so a reload or closed tab loses nothing.
3. **Submit.** They add their full name and Brain Station 23 email, and all their picks are sent together. A confirmation email goes to that address.
4. **Sheet.** The Apps Script adds one row per proposed name and never deletes anything. If someone submits again, their earlier rows are marked "Replaced" and the new ones are "Active". If someone else submits with their email, they get an email about it and the original rows are still in the sheet.
5. **Deadline.** Submissions close at the end of Friday 6 November 2026 (Dhaka time); the winner is announced Friday 13 November. The page shows a countdown and locks the Submit button after the deadline, and the script refuses late entries. To change the date, edit `CLOSES_AT` in both `Code.gs` and `index.html`, plus the dates in the page text.

There is no external form: the Google Sheet (or the Excel option below) is the only place submissions are stored. Until `SUBMIT_URL` is set, the Submit button shows "Submissions aren't open yet" and keeps the person's picks on the page.

## One-time setup (about 10 minutes)

1. **Create the sheet.** In Google Drive, create a new Google Sheet, for example "DFMS Naming Submissions".
2. **Add the script.** In the sheet, open **Extensions → Apps Script**. Delete the sample code, paste in the full contents of `google-apps-script/Code.gs`, and save.
3. **Deploy it as a web app.** Click **Deploy → New deployment**. Choose the type **Web app** and set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   Click **Deploy** and approve the permission prompt. Google asks you to allow the script to edit your spreadsheet.
4. **Copy the web app URL.** It ends in `/exec`. Open it in a browser. You should see `{"ok":true,"service":"dfms-naming-campaign"}`.
5. **Connect the page.** In `index.html`, find `CONFIG` near the bottom and paste the URL:
   ```js
   var CONFIG = {
     SUBMIT_URL: "https://script.google.com/macros/s/XXXX/exec",
     MAX_PICKS: 3,
     CLOSES_AT: "2026-11-06T23:59:59+06:00"
   };
   ```
6. **Publish `index.html`** on your web host, then send one test submission and check that a row appears in the sheet.

If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**. This keeps the same URL. If Google asks for new permissions (for example to send email), approve them.

## The sheet

Submissions go to the **Entries** tab, one row per proposed name. The columns are: Submitted at, Proposed since, Full name, Email, Pick, Domain, Why it fits, Availability, First to propose, Entry, Submission ID.

- **To see the final entries,** filter **Entry** to `Active`. Rows marked `Replaced …` are history.
- **Proposed since** is when the person first sent that name. It carries over if they keep the name when they resubmit, and starts again if they drop it and add it back later.
- **First to propose** is `Yes` when nobody else had an active entry for that name earlier. If two people send the same name, the earliest submission gets the credit. The page tells the later person straight away, so they can swap in a different name.
- **Availability** is what DotSweep reported when the person searched: `available`, `likely` or `unverified`. Re-check the shortlisted names yourself before you buy.
- **Export:** choose **File → Download → Microsoft Excel (.xlsx)** at any time.
- The script only accepts `@brainstation-23.com` email addresses, keeps at most three valid `.com` domains (letters a–z only, no hyphens or numbers), removes duplicates, and stops text from being read as spreadsheet formulas.

## Limits to know

- **Emails are confirmed after the fact, not verified up front.** The endpoint is open so the page can reach it without a sign-in. Anyone could submit using a colleague's address, but that colleague gets a confirmation email, their earlier rows stay in the sheet, and the email asks them to reply if they did not submit. Review the sheet before you announce a winner.
- **Email quota.** Apps Script sends up to 100 emails a day from a personal Gmail account (1,500 from Google Workspace). Past the limit, entries are still saved, just without the email. Set `SEND_CONFIRMATION = false` in `Code.gs` to turn emails off.
- **DotSweep allows 120 checks per minute** for each visitor. People who search very fast see "Too many checks, wait a minute".
- **"Available" is a good guide, not a guarantee.** Premium domains can still cost more than the price shown, so check the final name at a registrar before you buy it.

## Using Excel (Microsoft 365) instead of Google Sheets

This needs Power Automate's **"When an HTTP request is received"** trigger, which is a premium connector. If your licence includes it:

1. Create a flow with that trigger, using the JSON shape below.
2. Add an **"Add a row into a table"** step for an Excel table in OneDrive.
3. Return a **Response** with the body `{"ok": true}`.
4. Paste the flow URL into `SUBMIT_URL`.

The page sends this JSON as `text/plain`:

```json
{ "name": "…", "email": "…@brainstation-23.com", "submittedAt": "ISO date",
  "picks": [ { "domain": "example.com", "why": "…", "status": "available" } ] }
```
