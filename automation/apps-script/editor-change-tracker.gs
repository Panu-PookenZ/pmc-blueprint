/**
 * Editor's Calendar - Change Tracker
 * Sheet: Editor's Calendar 2026
 * ID:    <EDITOR_CALENDAR_SHEET_ID>
 *
 * Purpose:
 *   Capture every cell edit on the source tab "Q1-Q2 Data" into a single
 *   `_Update Log` tab so that the pmc-editor-sync skill only has to read
 *   that one tab to know what changed (instead of recomputing from
 *   the whole sheet every morning).
 *
 *   This is the QUEUE side of the new model. It REPLACES the per-day
 *   full-sheet sync that sync-post-production.gs does. Once verified,
 *   disable the daily trigger of sync-post-production.gs.
 *
 * Bootstrap (run once after first paste):
 *   1. Run `bootstrap` from the Apps Script editor
 *      -> creates _Update Log tab + installs onEdit trigger
 *   2. Authorize when prompted
 *   3. Edit any cell on the Q1-Q2 Data tab to verify
 *
 * Maintenance:
 *   - `removeTrigger`   -> uninstall onEdit trigger (emergency stop)
 *   - `clearSyncedRows` -> drop rows where status == synced
 *   - `resetUpdateLog`  -> wipe & recreate the tab (DESTRUCTIVE)
 *
 * Pattern source: automation/sheet-change-tracker.gs (Producer Dashboard,
 * deployed 2026-05-07). Same shape, adapted for Editor's Calendar.
 */

const SHEET_ID = '<EDITOR_CALENDAR_SHEET_ID>';

const UPDATE_LOG_TAB = '_Update Log';
const HEADER_ROW = [
  'timestamp',
  'tab',
  'cell',
  'row',
  'col',
  'project',     // forward-filled from col B at edit time (so daily skill knows which project)
  'field_name',  // header cell value
  'old_value',
  'new_value',
  'editor',      // = google account that made the edit (not the Editor field!)
  'status'
];

// Tabs we DO want to log. Anything else (Mapping, Sync Log, _Update Log,
// Q3-Q4 Data future, etc.) is ignored.
const WATCH_TABS = ['Q1-Q2 Data'];

// Skip header rows. Row 1 = title "Editor's Calendar 2026", Row 2 = column header.
const SOURCE_HEADER_ROW = 2;

// Keep at most this many rows in the log (excluding header).
const MAX_LOG_ROWS = 500;

// Asia/Bangkok timezone for log timestamps.
const TZ = 'Asia/Bangkok';

// Project column in Q1-Q2 Data (zero-indexed in code, "B" = column 2 in Sheet).
// The sheet "forward-fills" — only first row of a project has the name.
// We must walk upward to find the most recent non-empty cell.
const PROJECT_COL = 2; // column B

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
  Logger.log('Bootstrap done. Edit any cell on the Q1-Q2 Data tab to test.');
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
    if (WATCH_TABS.indexOf(tabName) < 0) return;

    const startRow = e.range.getRow();
    const startCol = e.range.getColumn();
    const numRows = e.range.getNumRows();
    const numCols = e.range.getNumColumns();

    // Skip edits entirely above the body. Allow row 2 edits to update headers
    // intentionally? No — header row should be stable. Body starts at row 3.
    const firstBodyRow = Math.max(startRow, SOURCE_HEADER_ROW + 1);
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

    // Header values from row 2 (the real column headers).
    const headerValues = sheet
      .getRange(SOURCE_HEADER_ROW, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    // Read the new values for the entire edited range (handles paste).
    const newValues = e.range.getValues();
    const isSingleCell = numRows === 1 && numCols === 1;
    const singleOldValue = isSingleCell ? (e.oldValue == null ? '' : e.oldValue) : '';

    // We need to forward-fill project name once per edited row. Cache by row.
    const projectByRow = {};
    function resolveProject_(absRow) {
      if (projectByRow[absRow] !== undefined) return projectByRow[absRow];
      // Walk upward from absRow until we find a non-empty cell in PROJECT_COL.
      // Stop at SOURCE_HEADER_ROW + 1 (first body row).
      const minBody = SOURCE_HEADER_ROW + 1;
      let r = absRow;
      let val = '';
      while (r >= minBody) {
        const cell = sheet.getRange(r, PROJECT_COL).getValue();
        if (cell !== '' && cell !== null && cell !== undefined) {
          val = String(cell).trim();
          break;
        }
        r -= 1;
      }
      projectByRow[absRow] = val;
      return val;
    }

    const rowsToAppend = [];
    for (let r = 0; r < numRows; r += 1) {
      const absRow = startRow + r;
      if (absRow <= SOURCE_HEADER_ROW) continue;
      for (let c = 0; c < numCols; c += 1) {
        const absCol = startCol + c;
        const fieldName = headerValues[absCol - 1] || ('col_' + absCol);
        const cellA1 = sheet.getRange(absRow, absCol).getA1Notation();
        const newVal = newValues[r][c];
        const newValStr = newVal == null ? '' : String(newVal);

        // For single-cell edits, use e.oldValue. For multi-cell paste,
        // we cannot recover the old value from the event - record blank.
        const oldVal = isSingleCell ? singleOldValue : '';

        // If the edit is in the project column itself, the "project" of THIS
        // edit is the new value (not the old forward-filled one) so the skill
        // knows the rename happened.
        const isProjectColEdit = absCol === PROJECT_COL;
        const projectName = isProjectColEdit
          ? (newValStr || resolveProject_(absRow))
          : resolveProject_(absRow);

        rowsToAppend.push([
          ts,
          tabName,
          cellA1,
          absRow,
          absCol,
          projectName,
          fieldName,
          oldVal,
          newValStr,
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

function ensureUpdateLogTab_(ss) {
  ss = ss || getSpreadsheet_();
  let tab = ss.getSheetByName(UPDATE_LOG_TAB);
  if (!tab) {
    tab = ss.insertSheet(UPDATE_LOG_TAB);
    tab.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
    tab.setFrozenRows(1);
    tab.getRange(1, 1, 1, HEADER_ROW.length).setFontWeight('bold');
    // Sensible widths
    tab.setColumnWidth(1, 160); // timestamp
    tab.setColumnWidth(2, 120); // tab
    tab.setColumnWidth(3, 70);  // cell
    tab.setColumnWidth(4, 50);  // row
    tab.setColumnWidth(5, 50);  // col
    tab.setColumnWidth(6, 240); // project
    tab.setColumnWidth(7, 180); // field_name
    tab.setColumnWidth(8, 220); // old_value
    tab.setColumnWidth(9, 220); // new_value
    tab.setColumnWidth(10, 220); // editor (account)
    tab.setColumnWidth(11, 90); // status
    tab.hideSheet(); // helper tab — out of producers' way
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
  if (overflow > 0) {
    tab.deleteRows(2, overflow); // delete oldest body rows
  }
}
