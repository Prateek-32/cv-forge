/**
 * CV Forge — brief intake endpoint.
 *
 * Receives the form on your website and writes one row per enquiry into the
 * spreadsheet this script is attached to. Nothing leaves your Google account.
 *
 * SETUP (about five minutes)
 *   1. Create a blank Google Sheet. Name it whatever you like.
 *   2. Extensions → Apps Script. Delete the sample code, paste this file in.
 *   3. Set NOTIFY_EMAIL below to your address if you want an email per brief.
 *   4. Deploy → New deployment → gear icon → Web app.
 *        Execute as:        Me
 *        Who has access:    Anyone            <-- must be "Anyone", not
 *                                                 "Anyone with Google account"
 *   5. Authorise when prompted. Google will warn that the app is unverified
 *      because you wrote it yourself — Advanced → Go to (project name).
 *   6. Copy the Web app URL it gives you (ends in /exec) and paste it into
 *      start.html, replacing [YOUR APPS SCRIPT URL].
 *
 * To test it: open the /exec URL in a browser. You should see
 * {"ok":true,"message":"CV Forge endpoint is live"}.
 *
 * After editing this file you must Deploy → Manage deployments → edit →
 * Version: New version → Deploy, or the site keeps hitting the old code.
 */

var SHEET_NAME    = 'Briefs';
var ISSUE_SHEET   = 'Issues';
var UPLOAD_FOLDER = 'CV Forge uploads';
var NOTIFY_EMAIL  = 'prateek.32gupta@gmail.com';   // blank sends nothing

var HEADERS = ['Received', 'Name', 'Email', 'Field', 'Career stage',
               'Needs', 'Targets', 'Notes', 'Attachment'];
var ISSUE_HEADERS = ['Received', 'Name', 'Email', 'Type', 'Page', 'Details', 'Status'];


function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Honeypot: real people never fill a hidden field. Answer politely and drop it.
    if (p.website) return json({ ok: true });

    // Issues raised from the site assistant (the chat button).
    if (p.kind === 'issue') return handleIssue_(p);

    var sheet = getSheet_(SHEET_NAME, HEADERS);
    var fileUrl = '';

    if (p.fileData && p.fileName) {
      try {
        var blob = Utilities.newBlob(
          Utilities.base64Decode(p.fileData),
          p.fileType || 'application/octet-stream',
          sanitise_(p.fileName)
        );
        fileUrl = getFolder_(UPLOAD_FOLDER).createFile(blob).getUrl();
      } catch (fileErr) {
        // A bad attachment must never lose the enquiry itself.
        fileUrl = 'upload failed: ' + fileErr;
      }
    }

    var row = [
      new Date(),
      p.name || '',
      p.email || '',
      p.field || '',
      p.stage || '',
      p.needs || '',
      p.target || '',
      p.notes || '',
      fileUrl
    ];
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: 'New brief — ' + (p.name || 'unnamed') + ' (' + (p.field || 'no field') + ')',
          body: [
            'Name:    ' + (p.name || '—'),
            'Email:   ' + (p.email || '—'),
            'Field:   ' + (p.field || '—'),
            'Stage:   ' + (p.stage || '—'),
            'Needs:   ' + (p.needs || '—'),
            '',
            'Targeting:',
            p.target || '—',
            '',
            'Notes:',
            p.notes || '—',
            '',
            fileUrl ? 'Attachment: ' + fileUrl : 'No attachment',
            '',
            'Row added to: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
          ].join('\n')
        });
      } catch (mailErr) {
        // Notification failure must not fail the submission.
      }
    }

    return json({ ok: true });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}


function doGet() {
  return json({ ok: true, message: 'CV Forge endpoint is live' });
}


/* One row on the Issues tab, and an email you can answer with Reply. */
function handleIssue_(p) {
  var type = p.issueType || 'Issue';
  getSheet_(ISSUE_SHEET, ISSUE_HEADERS).appendRow([
    new Date(), p.name || '', p.email || '', type, p.page || '', p.details || '', 'New'
  ]);

  if (NOTIFY_EMAIL) {
    try {
      var mail = {
        to: NOTIFY_EMAIL,
        subject: 'Issue — ' + type + ' — ' + (p.name || 'unnamed'),
        body: [
          'Name:    ' + (p.name || '—'),
          'Email:   ' + (p.email || '—'),
          'Type:    ' + type,
          'Page:    ' + (p.page || '—'),
          '',
          p.details || '—',
          '',
          'Reply to this email to answer them directly.',
          'Logged on the Issues tab: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
        ].join('\n')
      };
      if (p.email) mail.replyTo = p.email;
      MailApp.sendEmail(mail);
    } catch (mailErr) {
      // The row is saved; a failed notification must not fail the request.
    }
  }
  return json({ ok: true });
}


/* ---------- helpers ---------- */

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFolder_(name) {
  var existing = DriveApp.getFoldersByName(name);
  return existing.hasNext() ? existing.next() : DriveApp.createFolder(name);
}

function sanitise_(filename) {
  return String(filename).replace(/[^\w .\-()]/g, '_').slice(0, 120);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
