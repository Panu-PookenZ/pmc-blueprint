/**
 * Producer Dashboard - Change Tracker
 * Sheet: Dashboard: Production Project 2026
 * ID:    <PRODUCER_DASHBOARD_SHEET_ID>
 *
 * Purpose:
 *   Capture every cell edit on producer/director tabs into a single
 *   `_Update Log` tab so that pmc-sheet-sync skill only has to read
 *   that one tab to know what changed (instead of re-diffing the
 *   whole spreadsheet every morning).
 *
 * Bootstrap (run once after first paste):
 *   1. Run `bootstrap` from the Apps Script editor
 *      -> creates _Update Log tab + installs onEdit trigger
 *   2. Authorize when prompted (script needs spreadsheet + trigger
 *      permissions on this Sheet only)
 *   3. Edit any cell on a producer/director tab to verify
 *
 * Maintenance:
 *   - `removeTrigger`  -> uninstall onEdit trigger (emergency stop)
 *   - `clearSyncedRows` -> archive rows where status == synced
 *   - `resetUpdateLog`  -> wipe & recreate the tab (DESTRUCTIVE)
 */

// Spreadsheet to track. Used as a fallback when the script is not
// container-bound (i.e. created at script.google.com instead of via
// Extensions -> Apps Script). With this constant, the script works in
// both modes.
const SHEET_ID = '<PRODUCER_DASHBOARD_SHEET_ID>';

const UPDATE_LOG_TAB = '_Update Log';
const HEADER_ROW = [
  'timestamp',
  'tab',
  'cell',
  'row',
  'col',
  'field_name',
  'old_value',
  'new_value',
  'editor',
  'status'
];

// Tabs we never want to log (helper / system tabs).
const SKIP_TABS = ['_Update Log', '_EPs', '_Users'];

// Keep at most this many rows in the log (excluding header).
const MAX_LOG_ROWS = 500;

// Asia/Bangkok timezone for log timestamps.
const TZ = 'Asia/Bangkok';

// Header keywords that indicate a URL column. When the edited cell sits in
// a URL column, the handler tries to recover the actual URL behind a
// HYPERLINK formula or rich-text link instead of the cell's display text.
// Substring match (case-sensitive) — keeps tolerant of header variants
// like '[Pre-production]\nTemplate: Video Storytelling Canvas'.
const URL_FIELD_KEYWORDS = [
  'Brief',
  'Cost Sheet',
  'Timeline',
  'Breakdown',
  'Footage Folder',
  'Publish Link',
  'Storytelling Canvas',
  'Shooting Script',
  'Rough Cut',
  'Final Video'
];

/* -------------------------------------------------------------------------- */
/* Bootstrap & Trigger Management                                              */
/* -------------------------------------------------------------------------- */

function getSpreadsheet_() {
  const active = SpreadsheetApp.getActive();
  if (active) return active;
  if (!SHEET_ID) {
    throw new Error(
      'Script is not container-bound and SHEET_ID is empty. ' +
      'Set SHEET_ID at the top of the file or open via Extensions -> Apps Script.'
    );
  }
  return SpreadsheetApp.openById(SHEET_ID);
}

function bootstrap() {
  const ss = getSpreadsheet_();
  ensureUpdateLogTab_(ss);
  installTrigger();
  Logger.log('Bootstrap done. Edit any cell on a producer/director tab to test.');
}

function installTrigger() {
  const ss = getSpreadsheet_();
  // remove any pre-existing onEditHandler triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onEditHandler') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('onEditHandler')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  Logger.log('onEdit installable trigger installed.');
}

function removeTrigger() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onEditHandler') {
      ScriptApp.deleteTrigger(t);
      removed += 1;
    }
  });
  Logger.log('Removed ' + removed + ' onEditHandler trigger(s).');
}

/* -------------------------------------------------------------------------- */
/* The actual edit handler                                                     */
/* -------------------------------------------------------------------------- */

function onEditHandler(e) {
  if (!e || !e.range) return;

  try {
    const sheet = e.range.getSheet();
    const tabName = sheet.getName();
    if (SKIP_TABS.indexOf(tabName) >= 0) return;

    const startRow = e.range.getRow();
    const startCol = e.range.getColumn();
    const numRows = e.range.getNumRows();
    const numCols = e.range.getNumColumns();

    // Skip header-row edits (row 1 only).
    // For multi-row paste that includes row 1, log only the body rows.
    const firstBodyRow = Math.max(startRow, 2);
    if (firstBodyRow > startRow + numRows - 1) return;

    const ss = e.source || SpreadsheetApp.getActive();
    const logTab = ensureUpdateLogTab_(ss);
    const ts = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');

    let editor = 'unknown';
    try {
      const u = Session.getActiveUser();
      if (u && u.getEmail) {
        editor = u.getEmail() || 'unknown';
      }
    } catch (_) {
      editor = 'unknown';
    }

    // Resolve header values once for this tab so we can name fields.
    const headerValues = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    // Read the new values for the entire edited range (handles paste).
    const newValues = e.range.getValues();
    // e.oldValue is only populated for single-cell edits; multi-cell edits
    // give us no old values from the event object.
    const isSingleCell = numRows === 1 && numCols === 1;
    const singleOldValue = isSingleCell ? (e.oldValue == null ? '' : e.oldValue) : '';

    // For URL columns we want the underlying URL, not the HYPERLINK display
    // text. Pull formulas + rich text values for the whole edited range in
    // bulk (cheaper than per-cell calls during multi-cell paste).
    const formulas = e.range.getFormulas();
    let richValues = null;
    try {
      richValues = e.range.getRichTextValues();
    } catch (_) {
      richValues = null;
    }

    const rowsToAppend = [];
    for (let r = 0; r < numRows; r += 1) {
      const absRow = startRow + r;
      if (absRow < 2) continue; // skip header
      for (let c = 0; c < numCols; c += 1) {
        const absCol = startCol + c;
        const fieldName = headerValues[absCol - 1] || ('col_' + absCol);
        const cellA1 = sheet.getRange(absRow, absCol).getA1Notation();
        const newVal = newValues[r][c];
        const newValStr = newVal == null ? '' : String(newVal);

        // Recover URL behind a HYPERLINK formula or rich-text link.
        // onEdit's e.value (and getValues()) only return the display text,
        // which loses the URL — pmc-sheet-sync downstream needs the URL.
        let recordedNewVal = newValStr;
        if (isUrlField_(fieldName)) {
          const formula = formulas[r] && formulas[r][c] ? formulas[r][c] : '';
          const richText = richValues && richValues[r] ? richValues[r][c] : null;
          recordedNewVal = extractUrl_(formula, richText, newValStr);
        }

        // For single-cell edits, use e.oldValue. For multi-cell paste,
        // we cannot recover the old value from the event - record blank.
        const oldVal = isSingleCell ? singleOldValue : '';

        rowsToAppend.push([
          ts,
          tabName,
          cellA1,
          absRow,
          absCol,
          fieldName,
          oldVal,
          recordedNewVal,
          editor,
          'pending'
        ]);
      }
    }

    if (rowsToAppend.length === 0) return;

    // Bulk append for performance. Use setValues at lastRow+1.
    const startAt = logTab.getLastRow() + 1;
    logTab
      .getRange(startAt, 1, rowsToAppend.length, HEADER_ROW.length)
      .setValues(rowsToAppend);

    // Truncate excess rows (oldest first) to keep MAX_LOG_ROWS.
    truncateLog_(logTab);
  } catch (err) {
    // Never throw out of an onEdit handler - it would surface as
    // a popup to the editing user. Log instead.
    Logger.log('onEditHandler error: ' + (err && err.stack ? err.stack : err));
  }
}

/* -------------------------------------------------------------------------- */
/* Maintenance helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * One-shot diagnostic: log the schema of the `_EPs` tab to the
 * Execution log. For each column shows:
 *   - the header name
 *   - whether row 2 is a formula (and what formula) or a static value
 *
 * Run this once after bootstrap so we know if `_EPs` is auto-computed
 * (formulas) or manually maintained (static cells). The pmc-sheet-sync
 * skill needs to know whether it can safely write into the
 * `Airtable Deliverable ID` column.
 */
function inspectEpsTab() {
  const ss = getSpreadsheet_();
  const tab = ss.getSheetByName('_EPs');
  if (!tab) {
    Logger.log('_EPs tab not found.');
    return;
  }
  const numCols = tab.getLastColumn();
  const numRows = Math.min(tab.getLastRow(), 4); // header + up to 3 sample rows
  const headers = tab.getRange(1, 1, 1, numCols).getValues()[0];
  Logger.log('_EPs has ' + (tab.getLastRow() - 1) + ' data rows, ' + numCols + ' columns.');
  Logger.log('=== Column inspection (row 2 sample) ===');
  for (let c = 1; c <= numCols; c += 1) {
    const header = headers[c - 1];
    const formula = tab.getRange(2, c).getFormula();
    if (formula) {
      Logger.log(c + '. [' + header + '] FORMULA: ' + formula);
    } else {
      const val = tab.getRange(2, c).getValue();
      Logger.log(c + '. [' + header + '] static value: ' + (val === '' ? '(empty)' : val));
    }
  }
  // also check for ARRAYFORMULA in row 1 (often used to generate the whole column)
  Logger.log('=== Row 1 (header) formulas (if any) ===');
  for (let c = 1; c <= numCols; c += 1) {
    const f1 = tab.getRange(1, c).getFormula();
    if (f1) Logger.log(c + '. [' + headers[c - 1] + '] header-row formula: ' + f1);
  }
}

/**
 * One-shot seed: fill the `_EPs` tab's `Airtable Deliverable ID`
 * column for every row whose (Project Name, EP.) matches a known
 * Airtable Deliverable. Skips rows that already have a value.
 *
 * Run once after Case A + Case D mutations on Airtable. After this
 * the pmc-sheet-sync skill can rely on this column to resolve
 * Sheet rows -> Airtable recIDs without having to fuzzy-match.
 *
 * Sport Icon is intentionally left empty (Case B - awaiting Producer
 * to fill EPs in the Sheet).
 */
function populateAirtableIds() {
  const ss = getSpreadsheet_();
  const tab = ss.getSheetByName('_EPs');
  if (!tab) { Logger.log('_EPs tab not found.'); return; }

  // Mapping by EP_ID (col 1) exact match.
  // EP_ID = '{Project Name}|{Product Code}|{EP.}' as it appears in Sheet.
  // Keys are normalized via normKey() so trailing spaces / case differences
  // do not block matching.
  const M = {
    // ── Legacy EP_ID → Airtable Deliverable recID mapping ──
    //
    // This static lookup was used during the schema migration
    // (2026-04 → 2026-05) to map free-form Sheet keys (made of
    // `{Project Name}|{Product Code}|{EP. label}`) to Airtable
    // record IDs while the canonical `Episode ID` field was
    // backfilled.
    //
    // Once every Deliverable record has a populated `Episode ID`
    // (the immutable PP-YY-NNN-TNN form), this mapping becomes
    // redundant — the skill matches Episode ID exact + falls back
    // to the `_EPs` tab for fuzzy resolution.
    //
    // In the public blueprint we ship the table as an empty stub:
    // populate per your own migration if you build from a similar
    // legacy state.
    //
    //   'project name|product code|ep label': 'recXXXXXXXXXXXXXX',
    //   …
  };

  function normKey(s) {
    return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  const lastRow = tab.getLastRow();
  if (lastRow < 2) { Logger.log('No data rows in _EPs.'); return; }

  const numCols = tab.getLastColumn();
  const headers = tab.getRange(1, 1, 1, numCols).getValues()[0];
  const colEpId = headers.indexOf('EP_ID') + 1;
  const colRecId = headers.indexOf('Airtable Deliverable ID') + 1;

  if (!colEpId || !colRecId) {
    Logger.log('Required column missing. EP_ID=' + colEpId + ', RecId=' + colRecId);
    return;
  }

  // Read all in one batch for speed.
  const epIds = tab.getRange(2, colEpId, lastRow - 1, 1).getValues();
  const existings = tab.getRange(2, colRecId, lastRow - 1, 1).getValues();

  const updates = []; // { row, recId }
  const unmatched = [];
  let alreadyFilled = 0;

  for (let i = 0; i < epIds.length; i += 1) {
    const epId = epIds[i][0];
    const existing = existings[i][0];
    if (existing) { alreadyFilled += 1; continue; }
    const key = normKey(epId);
    const recId = M[key];
    if (recId) {
      updates.push({ row: i + 2, recId: recId });
    } else {
      unmatched.push('row ' + (i + 2) + ': EP_ID="' + epId + '" (key=' + key + ')');
    }
  }

  // Apply updates one by one (small data set; readability over speed).
  updates.forEach(function (u) {
    tab.getRange(u.row, colRecId).setValue(u.recId);
  });

  Logger.log('Filled: ' + updates.length + ' rows.');
  Logger.log('Already had recID: ' + alreadyFilled + ' rows.');
  Logger.log('Unmatched: ' + unmatched.length + ' rows.');
  unmatched.forEach(function (u) { Logger.log('  - ' + u); });
}

function clearSyncedRows() {
  const ss = getSpreadsheet_();
  const tab = ss.getSheetByName(UPDATE_LOG_TAB);
  if (!tab) return;
  const last = tab.getLastRow();
  if (last < 2) return;

  const statusCol = HEADER_ROW.indexOf('status') + 1;
  const values = tab.getRange(2, 1, last - 1, HEADER_ROW.length).getValues();
  const keep = values.filter(function (row) {
    return row[statusCol - 1] !== 'synced';
  });

  tab.getRange(2, 1, last - 1, HEADER_ROW.length).clearContent();
  if (keep.length > 0) {
    tab.getRange(2, 1, keep.length, HEADER_ROW.length).setValues(keep);
  }
  Logger.log('Removed ' + (values.length - keep.length) + ' synced row(s).');
}

function resetUpdateLog() {
  const ss = getSpreadsheet_();
  const existing = ss.getSheetByName(UPDATE_LOG_TAB);
  if (existing) ss.deleteSheet(existing);
  ensureUpdateLogTab_(ss);
  Logger.log('_Update Log tab reset.');
}

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                            */
/* -------------------------------------------------------------------------- */

function isUrlField_(fieldName) {
  if (!fieldName) return false;
  const f = String(fieldName);
  for (let i = 0; i < URL_FIELD_KEYWORDS.length; i += 1) {
    if (f.indexOf(URL_FIELD_KEYWORDS[i]) >= 0) return true;
  }
  return false;
}

function extractUrl_(formula, richText, displayText) {
  // Layer 1: HYPERLINK("url", "label") formula — most common case when
  // a producer pastes from Drive's "share" UI which writes a HYPERLINK.
  if (formula && /^=HYPERLINK\(/i.test(formula)) {
    const m = formula.match(/^=HYPERLINK\(\s*"([^"]+)"/i);
    if (m && m[1]) return m[1];
    const m2 = formula.match(/^=HYPERLINK\(\s*'([^']+)'/i);
    if (m2 && m2[1]) return m2[1];
  }
  // Layer 2: Rich-text link — when a producer pastes a link from a Doc/
  // Slack/email, Sheets often stores it as rich text with a URL attached
  // even though the display text is something else.
  if (richText) {
    try {
      const url = richText.getLinkUrl();
      if (url) return url;
      const runs = richText.getRuns ? richText.getRuns() : null;
      if (runs && runs.length > 0) {
        for (let i = 0; i < runs.length; i += 1) {
          const u = runs[i].getLinkUrl();
          if (u) return u;
        }
      }
    } catch (_) {
      // RichText API can throw on unusual cell values — fall through.
    }
  }
  // Layer 3: Display text already a URL.
  if (displayText && /^https?:\/\//i.test(displayText)) return displayText;
  // Fallback: keep display text so we don't lose information.
  return displayText;
}

function ensureUpdateLogTab_(ss) {
  ss = ss || getSpreadsheet_();
  let tab = ss.getSheetByName(UPDATE_LOG_TAB);
  if (!tab) {
    tab = ss.insertSheet(UPDATE_LOG_TAB);
    tab.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
    tab.setFrozenRows(1);
    tab.getRange(1, 1, 1, HEADER_ROW.length).setFontWeight('bold');
    // Sensible widths: timestamp wider, status narrow.
    tab.setColumnWidth(1, 160); // timestamp
    tab.setColumnWidth(2, 120); // tab
    tab.setColumnWidth(3, 70);  // cell
    tab.setColumnWidth(4, 50);  // row
    tab.setColumnWidth(5, 50);  // col
    tab.setColumnWidth(6, 180); // field_name
    tab.setColumnWidth(7, 240); // old_value
    tab.setColumnWidth(8, 240); // new_value
    tab.setColumnWidth(9, 220); // editor
    tab.setColumnWidth(10, 90); // status
    tab.hideSheet(); // helper tab - keep out of producers' way
  } else {
    // make sure header row matches in case someone renamed columns
    const current = tab.getRange(1, 1, 1, HEADER_ROW.length).getValues()[0];
    let needsReset = false;
    for (let i = 0; i < HEADER_ROW.length; i += 1) {
      if (current[i] !== HEADER_ROW[i]) { needsReset = true; break; }
    }
    if (needsReset) {
      tab.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
    }
  }
  return tab;
}

function truncateLog_(tab) {
  const last = tab.getLastRow();
  const overflow = last - 1 - MAX_LOG_ROWS; // exclude header
  if (overflow <= 0) return;

  // Status-aware truncation (Defect 1C fix, 2026-05-25):
  // Old behavior blindly deleted oldest N rows, including 'deferred'/'failed'
  // entries, silently stranding work that pmc-sheet-sync needs to retry.
  // DEMO-26-001 incident 2026-05-22→25: 4 deferred rows lost when log hit cap,
  // leaving skill with nothing to re-evaluate even after status-gate fix.
  //
  // New behavior: only delete rows whose status indicates the work is done
  // ('synced') or intentionally non-actionable ('skipped'). Preserve
  // 'pending', 'deferred', 'failed' so the skill's next run can pick them
  // up. If we can't free enough space without touching live rows, log a
  // high-water alert and stop (better to grow past MAX_LOG_ROWS than to
  // silently drop work).
  const statusCol = HEADER_ROW.indexOf('status') + 1;
  const statuses = tab.getRange(2, statusCol, last - 1, 1).getValues();
  const REMOVABLE = { synced: 1, skipped: 1 };

  // Walk oldest-first; collect 1-indexed sheet row numbers to delete.
  const toDelete = [];
  for (let i = 0; i < statuses.length && toDelete.length < overflow; i += 1) {
    if (REMOVABLE[statuses[i][0]]) toDelete.push(i + 2);
  }

  // Delete bottom-up so the remaining row numbers stay valid.
  toDelete.reverse();
  toDelete.forEach(function (rowNum) {
    tab.deleteRows(rowNum, 1);
  });

  if (toDelete.length < overflow) {
    const stuck = overflow - toDelete.length;
    Logger.log(
      '⚠️ _Update Log over MAX_LOG_ROWS by ' + stuck +
      ' rows, but no more synced/skipped rows to remove. ' +
      'Triage deferred/failed rows manually (Sheet → _Update Log tab) ' +
      'or raise MAX_LOG_ROWS. Skill will keep working — this is a hygiene alert.'
    );
  }
}

/* -------------------------------------------------------------------------- */
/* markStatus web app — pmc-sheet-sync skill writes back row status            */
/* -------------------------------------------------------------------------- */

/**
 * Web app endpoint. pmc-sheet-sync skill POSTs after applying mutations:
 *
 *   POST <deployment-url>
 *   Content-Type: application/json
 *   Body: {
 *     "secret": "<shared-secret-from-ScriptProperties>",
 *     "rows":   [ { "row": 42, "newStatus": "synced" }, ... ]
 *   }
 *
 *   - "row" is the Sheet row number (1-indexed) of the `_Update Log` tab,
 *     i.e. matches the value the skill saw in tab.getValues() + 2 / index+2.
 *   - "newStatus" ∈ { synced, deferred, failed, skipped }.
 *
 * Returns JSON:
 *   { "ok": true,  "flipped": N, "skipped": M }
 *   { "ok": false, "error":   "..." }                  on 4xx-equivalent
 *
 * `skipped` counts rows that already had the requested status (idempotent
 * re-run of a sync) plus rows whose Sheet status was no longer 'pending'
 * (someone else flipped them concurrently — don't clobber).
 *
 * Auth: shared secret stored in ScriptProperties under key MARK_STATUS_SECRET.
 * Set it once via `setMarkStatusSecret('<value>')` from the editor.
 *
 * Deploy:
 *   1. Click Deploy -> New deployment -> Web app
 *   2. Execute as: Me (editor@example.com)
 *   3. Who has access: Anyone with Google account
 *   4. Copy the /exec URL into macOS Keychain (pmc-sheet-sync / markstatus-url).
 *
 * Quota: one batched setValues per call. Skill should send one POST per run,
 * not one per row.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'missing body' });
    }
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (_) {
      return jsonOut_({ ok: false, error: 'invalid JSON' });
    }

    const props = PropertiesService.getScriptProperties();
    const expected = props.getProperty('MARK_STATUS_SECRET');
    if (!expected) {
      return jsonOut_({ ok: false, error: 'server not configured (MARK_STATUS_SECRET unset)' });
    }
    if (!body.secret || body.secret !== expected) {
      return jsonOut_({ ok: false, error: 'unauthorized' });
    }

    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      return jsonOut_({ ok: false, error: 'rows[] required (non-empty)' });
    }

    const ALLOWED = { synced: 1, deferred: 1, failed: 1, skipped: 1 };
    for (let i = 0; i < body.rows.length; i += 1) {
      const r = body.rows[i];
      if (!r || typeof r.row !== 'number' || r.row < 2) {
        return jsonOut_({ ok: false, error: 'rows[' + i + '].row must be integer >= 2' });
      }
      if (!r.newStatus || !ALLOWED[r.newStatus]) {
        return jsonOut_({ ok: false, error: 'rows[' + i + '].newStatus must be one of synced|deferred|failed|skipped' });
      }
    }

    const ss = getSpreadsheet_();
    const tab = ss.getSheetByName(UPDATE_LOG_TAB);
    if (!tab) return jsonOut_({ ok: false, error: '_Update Log tab missing' });

    const statusCol = HEADER_ROW.indexOf('status') + 1; // 1-indexed
    const lastRow = tab.getLastRow();

    // Read current status of all targeted rows in one round-trip.
    // Build row -> requested-status map first (dedup just in case).
    const requested = {};
    body.rows.forEach(function (r) { requested[r.row] = r.newStatus; });
    const targetRows = Object.keys(requested).map(function (k) { return parseInt(k, 10); });

    // Fetch each target row's status (one cell each; total = #rows reads).
    // For typical run (< 50 rows) this is cheap and avoids range gymnastics
    // when target rows aren't contiguous.
    const reads = [];
    targetRows.forEach(function (rowNum) {
      if (rowNum > lastRow) {
        reads.push({ row: rowNum, current: '__OUT_OF_RANGE__' });
      } else {
        reads.push({ row: rowNum, current: tab.getRange(rowNum, statusCol).getValue() });
      }
    });

    let flipped = 0;
    let skipped = 0;
    const writes = []; // { row, newStatus }
    reads.forEach(function (read) {
      const want = requested[read.row];
      if (read.current === '__OUT_OF_RANGE__') { skipped += 1; return; }
      if (read.current === want) { skipped += 1; return; }    // already at target
      // Only flip from 'pending' or 'deferred' — don't clobber a synced row.
      // (deferred -> synced/deferred/etc. is the normal re-eval transition.)
      if (read.current !== 'pending' && read.current !== 'deferred') {
        skipped += 1;
        return;
      }
      writes.push({ row: read.row, newStatus: want });
    });

    // Apply writes one cell each. Status column is sparse and rows aren't
    // necessarily contiguous, so per-cell setValue is simpler than
    // building an offsetted setValues range. For < 50 rows the cost is fine.
    writes.forEach(function (w) {
      tab.getRange(w.row, statusCol).setValue(w.newStatus);
      flipped += 1;
    });

    return jsonOut_({ ok: true, flipped: flipped, skipped: skipped });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.stack ? err.stack : err) });
  }
}

/**
 * Helper for setting the shared secret. Run once from the editor with
 * the value you stored in macOS Keychain under (pmc-sheet-sync / markstatus-secret).
 */
function setMarkStatusSecret(secret) {
  if (!secret || typeof secret !== 'string' || secret.length < 16) {
    throw new Error('Pass a string of length >= 16 (use openssl rand -hex 32).');
  }
  PropertiesService.getScriptProperties().setProperty('MARK_STATUS_SECRET', secret);
  Logger.log('MARK_STATUS_SECRET set (length=' + secret.length + ').');
}

/**
 * Diagnostic: confirms the secret is set and reports its length without
 * leaking the value. Run from the editor to verify deploy state.
 */
function checkMarkStatusSecret() {
  const v = PropertiesService.getScriptProperties().getProperty('MARK_STATUS_SECRET');
  if (!v) {
    Logger.log('MARK_STATUS_SECRET is NOT set. Run setMarkStatusSecret("...") first.');
  } else {
    Logger.log('MARK_STATUS_SECRET is set (length=' + v.length + ').');
  }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
