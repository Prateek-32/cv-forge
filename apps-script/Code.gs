/**
 * Fieldcraft — brief intake endpoint.
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
 * {"ok":true,"message":"Fieldcraft endpoint is live"}.
 *
 * After editing this file you must Deploy → Manage deployments → edit →
 * Version: New version → Deploy, or the site keeps hitting the old code.
 */

var SHEET_NAME    = 'Briefs';
var ISSUE_SHEET   = 'Issues';
var UPLOAD_FOLDER = 'CV Forge uploads';        // the pre-rename name, kept so uploads stay in one folder
var NOTIFY_EMAIL  = 'prateek.32gupta@gmail.com';   // blank sends nothing

var HEADERS = ['Received', 'Name', 'Email', 'Field', 'Career stage',
               'Needs', 'Targets', 'Notes', 'Attachment', 'Template'];
var ISSUE_HEADERS = ['Received', 'Name', 'Email', 'Type', 'Page', 'Details', 'Status'];
var PORTFOLIO_SHEET = 'Portfolio briefs';
var PORTFOLIO_HEADERS = ['Received', 'Name', 'Email', 'WhatsApp', 'Field', 'Headline', 'Look',
                         'Sections', 'Work links', 'Projects', 'Web address', 'Domain',
                         'Hosting account email', 'Colours and references', 'Add-ons', 'Notes', 'Attachment'];


function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Honeypot: real people never fill a hidden field. Answer politely and drop it.
    if (p.website) return json({ ok: true });

    // Issues raised from the site assistant (the chat button).
    if (p.kind === 'issue') return handleIssue_(p);

    var fileUrl = saveUpload_(p);

    // Portfolio briefs (the second form on start.html) have their own tab.
    if (p.kind === 'portfolio') return handlePortfolio_(p, fileUrl);

    var sheet = getSheet_(SHEET_NAME, HEADERS);

    var row = [
      new Date(),
      p.name || '',
      p.email || '',
      p.field || '',
      p.stage || '',
      p.needs || '',
      p.target || '',
      p.notes || '',
      fileUrl,
      p.template || ''
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
            'Template: ' + (p.template || '—'),
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
  return json({ ok: true, message: 'Fieldcraft endpoint is live' });
}


/* The uploaded file, saved to Drive; a bad file never loses the brief. */
function saveUpload_(p) {
  if (!(p.fileData && p.fileName)) return '';
  try {
    var blob = Utilities.newBlob(
      Utilities.base64Decode(p.fileData),
      p.fileType || 'application/octet-stream',
      sanitise_(p.fileName)
    );
    return getFolder_(UPLOAD_FOLDER).createFile(blob).getUrl();
  } catch (fileErr) {
    return 'upload failed: ' + fileErr;
  }
}


/* One row on the Portfolio briefs tab, and an email you can answer with Reply. */
function handlePortfolio_(p, fileUrl) {
  var field = String(p.field || '').replace(/^PORTFOLIO:\s*/, '');
  getSheet_(PORTFOLIO_SHEET, PORTFOLIO_HEADERS).appendRow([
    new Date(), p.name || '', p.email || '', p.whatsapp || '', field, p.headline || '',
    p.style || '', p.sections || '', p.links || '', p.projects || '', p.domain || '',
    p.domainName || '', p.hostingEmail || '', p.lookFeel || '', p.addons || '',
    p.ownNotes || '',   // "notes" carries extras folded in for older scripts; this is the visitor's text
    fileUrl
  ]);

  if (NOTIFY_EMAIL) {
    try {
      var mail = {
        to: NOTIFY_EMAIL,
        subject: 'New portfolio brief — ' + (p.name || 'unnamed') + ' (' + (field || 'no field') + ')',
        body: [
          'Name:      ' + (p.name || '—'),
          'Email:     ' + (p.email || '—'),
          'WhatsApp:  ' + (p.whatsapp || '—'),
          'Field:     ' + (field || '—'),
          'Headline:  ' + (p.headline || '—'),
          'Look:      ' + (p.style || '—'),
          'Sections:  ' + (p.sections || '—'),
          'Web:       ' + (p.domain || '—') + (p.domainName ? ' (' + p.domainName + ')' : ''),
          'Hosting:   ' + (p.hostingEmail || '—'),
          'Add-ons:   ' + (p.addons || 'none'),
          '',
          'Projects:', p.projects || '—', '',
          'Work links:', p.links || '—', '',
          'Colours and references:', p.lookFeel || '—', '',
          fileUrl ? 'Attachment: ' + fileUrl : 'No attachment', '',
          'Row added to: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
        ].join('\n')
      };
      if (p.email) mail.replyTo = p.email;
      MailApp.sendEmail(mail);
    } catch (mailErr) {
      // Notification failure must not fail the submission.
    }
  }
  return json({ ok: true });
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
  } else if (sheet.getLastColumn() < headers.length) {
    // a sheet made before a column was added (e.g. Template): label the new ones
    var from = sheet.getLastColumn() + 1;
    sheet.getRange(1, from, 1, headers.length - from + 1)
         .setValues([headers.slice(from - 1)]).setFontWeight('bold');
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
