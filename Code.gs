/**
 * Google Apps Script backend for Pragyan Singh's portfolio contact form.
 *
 * WHAT THIS DOES
 * - Stores every contact-form submission as a row in a Google Sheet
 *   (acting as the database, in place of localStorage).
 * - Serves those messages back to the admin panel as JSON.
 * - Checks the admin password on the server, so it is never exposed
 *   in the page's JavaScript (unlike the localStorage demo mode).
 *
 * SETUP
 * 1. Create a new Google Sheet (sheets.new).
 * 2. Extensions -> Apps Script. Delete any starter code and paste this
 *    whole file in.
 * 3. Change ADMIN_PASSWORD below to your own password.
 * 4. Deploy -> New deployment -> type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the deployment's Web app URL (ends in /exec) and paste it
 *    into APPS_SCRIPT_URL near the top of index.html's <script>.
 * 6. Re-run "Deploy" (as a new version) any time you edit this file.
 */

const SHEET_NAME = "Messages";
const ADMIN_PASSWORD = "admin123";

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Email", "Message"]);
  }
  return sheet;
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === "list") {
    return jsonResponse({ messages: listMessages() });
  }

  if (action === "login") {
    const password = e.parameter.password || "";
    return jsonResponse({ success: password === ADMIN_PASSWORD });
  }

  return jsonResponse({ error: "Unknown action" });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: "Invalid JSON body" });
  }

  if (body.action === "add") {
    if (!body.message) {
      return jsonResponse({ error: "Message is required" });
    }
    addMessage(body.name, body.email, body.message, body.timestamp);
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: "Unknown action" });
}

function listMessages() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1); // drop header row
  return rows
    .filter(r => r[1] || r[3]) // skip fully blank rows
    .map(r => ({
      timestamp: r[0] instanceof Date ? r[0].toISOString() : r[0],
      name: r[1],
      email: r[2],
      message: r[3],
    }));
}

function addMessage(name, email, message, timestamp) {
  const sheet = getSheet();
  sheet.appendRow([timestamp || new Date().toISOString(), name || "", email || "", message]);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
