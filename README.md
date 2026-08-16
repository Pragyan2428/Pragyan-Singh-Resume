# Pragyan Singh — Portfolio

A single-page resume/portfolio site with:
- Sticky nav linking to every section
- A working Contact Me form
- An admin login that shows/hides a live, timestamped list of received messages
- A light/dark theme toggle
- A storage layer that runs on `localStorage` out of the box, and upgrades to a real **Google Sheets** database with a couple of edits

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole site — structure, styling, and behavior in one file |
| `Code.gs` | Google Apps Script backend — turns a Google Sheet into the messages database |

## 1. Run it as-is (localStorage mode)

Nothing to configure. Open `index.html` in a browser, or push it to GitHub Pages (step 3). Messages submitted through the Contact form are stored in the visitor's own browser (`localStorage`), and the admin panel (password `admin123`, see the `DEMO_ADMIN_PASSWORD` constant near the top of the `<script>` tag) reads them back out.

This mode is genuinely useful for a live demo, but two things are worth knowing:
- Messages are stored **per browser**, not centrally — you as the site owner won't see messages visitors submit on their own machines.
- The admin password lives in the page's JavaScript, so anyone who views source can read it. Fine for a demo, not for real gatekeeping.

Both limitations go away once you switch on the Google Sheets backend below.

## 2. Switch to a Google Sheets database

### a. Create the sheet + script
1. Go to [sheets.new](https://sheets.new) to create a fresh Google Sheet. Name it something like "Portfolio Messages".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the placeholder `myFunction() {}` code, and paste in the entire contents of `Code.gs`.
4. Near the top of the script, change:
   ```js
   const ADMIN_PASSWORD = "REPLACE_WITH_YOUR_OWN_PASSWORD";
   ```
   to a password only you know.
5. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, and authorize the script when prompted (it needs permission to read/write the sheet).
6. Copy the **Web app URL** — it ends in `/exec`.

### b. Point the site at it
In `index.html`, find this line near the top of the `<script>` block:
```js
const APPS_SCRIPT_URL = "";
```
Paste your URL in between the quotes:
```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```
Save the file. The Contact form now writes to your Google Sheet, and the admin panel reads from it — the rest of the site's code doesn't change, since both modes share the same `DB.list()` / `DB.add()` / `DB.login()` functions.

### c. Redeploying after edits
Every time you edit `Code.gs`, go to **Deploy → Manage deployments → edit (pencil) → New version → Deploy** so the live URL picks up your changes.

## 3. Publish with GitHub Pages

I can't create the GitHub repo or push code on your behalf — that needs your own GitHub login. Here's the exact path:

1. Go to [github.com/new](https://github.com/new) and create a public repository, e.g. `portfolio`.
2. On your computer, in the folder containing `index.html` (and `Code.gs` if you want it in the repo for reference):
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/portfolio.git
   git push -u origin main
   ```
   (No command line? On the new repo's GitHub page, use **Add file → Upload files** and drag `index.html` in instead.)
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
6. GitHub gives you a live URL, typically:
   ```
   https://<your-username>.github.io/portfolio/
   ```
   It usually goes live within a minute or two.

From then on, any `git push` to `main` updates the live site automatically.

## Notes on security

- Server-side password checks (Apps Script mode) are safer than the client-side demo password, but the password still travels as a URL query parameter — fine for a personal portfolio's low-stakes admin panel, not for anything sensitive. For stronger protection, consider storing the password in the script's [Script Properties](https://developers.google.com/apps-script/guides/properties) instead of hardcoding it, and/or rate-limiting login attempts.
- The Contact form has no spam protection (e.g. a CAPTCHA). If the live site gets spammed, adding Google's reCAPTCHA to the form and verifying it in `doPost` is the usual next step.
