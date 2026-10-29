/**
 * Anjana & Nethmi – Wedding RSVP + Wishes backend.
 * Paste this whole file into Extensions > Apps Script of the target spreadsheet.
 * Sheets "RSVP" and "Wishes" are created automatically (with headers) on first use,
 * or immediately by running setup() once from the editor.
 */

const SPREADSHEET_ID = '1gPuURhgf2P7a12m772raIUOzKKeB0ItdK8mib4yosXw';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Name', 'Phone', 'Attendance', 'Guests', 'Message', 'Invited As'],
    row: function (p) {
      return [
        new Date(),
        clean_(p.name),
        clean_(p.phone),
        clean_(p.attendance),
        clean_(p.guests),
        clean_(p.message),
        clean_(p.invitedAs),
      ];
    },
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Timestamp', 'Name', 'Message'],
    row: function (p) {
      return [new Date(), clean_(p.name), clean_(p.message)];
    },
  },
};

/** Run once from the editor to authorize and create both sheets. */
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.keys(SHEETS).forEach(function (key) {
    getSheet_(ss, SHEETS[key]);
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = parsePayload_(e);
    const config = SHEETS[String(payload.sheet || '').toUpperCase()];
    if (!config) {
      return json_({ ok: false, error: 'Invalid sheet. Use RSVP or WISHES.' });
    }
    if (!clean_(payload.name)) {
      return json_({ ok: false, error: 'Name is required.' });
    }

    const sheet = getSheet_(SpreadsheetApp.openById(SPREADSHEET_ID), config);
    sheet.appendRow(config.row(payload));
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    lock.releaseLock();
  }
}

/** GET ?sheet=WISHES returns the latest wishes (newest first) for the guestbook. */
function doGet(e) {
  try {
    const key = String((e && e.parameter && e.parameter.sheet) || '').toUpperCase();
    if (key !== 'WISHES') {
      return json_({ ok: true, message: 'Wedding endpoint is running.' });
    }

    const sheet = getSheet_(SpreadsheetApp.openById(SPREADSHEET_ID), SHEETS.WISHES);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return json_({ ok: true, wishes: [] });

    const values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const wishes = values
      .filter(function (r) { return r[1] && r[2]; })
      .map(function (r) {
        return {
          timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
          name: String(r[1]),
          message: String(r[2]),
        };
      })
      .reverse()
      .slice(0, 200);

    return json_({ ok: true, wishes: wishes });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

/** Returns the sheet, creating it and writing a styled header row if missing. */
function getSheet_(ss, config) {
  let sheet = ss.getSheetByName(config.name);
  if (!sheet) sheet = ss.insertSheet(config.name);

  const width = config.headers.length;
  const current = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, width).getValues()[0].map(String)
    : [];
  const hasHeaders = config.headers.every(function (h, i) { return current[i] === h; });

  if (!hasHeaders) {
    if (sheet.getLastRow() > 0) sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, width)
      .setValues([config.headers])
      .setFontWeight('bold')
      .setBackground('#061e14')
      .setFontColor('#e5cd97');
    sheet.setFrozenRows(1);
    if (sheet.getMaxRows() > 1) {
      sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    }
    sheet.autoResizeColumns(1, width);
  }
  return sheet;
}

function parsePayload_(e) {
  const contents = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (contents) {
    try {
      return JSON.parse(contents);
    } catch (_err) {
      // fall through to form parameters
    }
  }
  return (e && e.parameter) || {};
}

// Strip leading formula characters so guest input can't inject spreadsheet formulas.
function clean_(value) {
  const s = String(value == null ? '' : value).trim().slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
