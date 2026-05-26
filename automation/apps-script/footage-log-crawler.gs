/**
 * Footage Log Crawler — PMC blueprint
 * Crawls a Shared Drive footage tree and upserts one row per shoot folder
 * into a "Footage Log" Sheet.
 *
 * Design: docs/04-sync-pipeline.md  ·  Rev 1
 *
 * SETUP (Apps Script editor):
 *   1. Services (+) → add the "Drive API" advanced service (identifier: Drive, v3)
 *   2. Run footageLogCrawl once → authorize scopes
 *   3. Triggers (clock) → add time-driven trigger: footageLogCrawl, daily 3am-4am
 *
 * Notes:
 *   - Single-writer: this script fully owns the Sheet. Any downstream
 *     match/sync skill reads it only. Match-state lives in Airtable, not here.
 *   - Incremental: a shoot folder is deep-scanned only when new / changed /
 *     previously skipped. Stops deep-scanning near the 6-min limit and resumes
 *     next run (rows with blank File Count are re-scanned).
 */

// Replace with the ID of the Shared Drive containing your footage tree.
// Google Shared Drive IDs start with `0A` and are 19 characters long.
var SHARED_DRIVE_ID = '<SHARED_DRIVE_ID>';

// Replace with the ID of the destination Sheet (the "Footage Log" sheet).
// Google Sheet IDs are 44 characters of [A-Za-z0-9_-].
var SHEET_ID        = '<FOOTAGE_LOG_SHEET_ID>';

// Level-1 Outlet folders to crawl. These are the content brands / channels
// your production house ships to. Output buckets (e.g. "FOR CLIENTS",
// "FINAL VIDEO FOR SOCIAL") and non-standard folders are intentionally
// excluded — only crawl what produces footage worth indexing.
//
// Anonymized for the blueprint as OUTLET_A..OUTLET_K. Adapt to your
// own outlet folder names.
var OUTLET_WHITELIST = [
  '1.OUTLET_A',  // e.g. NEWS, daily desk
  '2.OUTLET_B',  // e.g. POP / lifestyle short-form
  '3.OUTLET_C',  // e.g. PODCAST / talk
  '4.OUTLET_D',  // e.g. branded vertical
  '5.OUTLET_E',  // e.g. signature long-form show
  '6.OUTLET_F',  // e.g. WEALTH / finance
  '7.OUTLET_G',  // e.g. LIFE / wellbeing
  '8.OUTLET_H',  // e.g. SPORT
  '9.OUTLET_I',  // e.g. ADVERTORIAL
  '10.OUTLET_J', // e.g. EVENT capture
  '11.OUTLET_K', // e.g. NOW / breaking
  '14.OUTLET_L'  // e.g. FREELANCE FOOTAGE pool
];

var HEADERS = ['Folder ID','Footage Folder','Folder URL','Outlet','Show','Shoot Date',
  'Name Pattern','Production ID','Created','Last Updated','File Count','Total Size (GB)',
  'Uploaded By','Logged At'];

var DATE_RE   = /(20\d{2})[.\-\/ ](\d{1,2})[.\-\/ ](\d{1,2})/;     // 2026.05.12
var EP_RE     = /^EP\s?\d+/i;                                       // EP86
var PRODID_RE = /\b([A-Z]{2,3}-\d{6}-[A-Z]{3}-\d{2})\b/;            // future Episode ID
var MEDIA_RE  = /\.(mp4|mov|mxf|avi|mts|m2ts|braw|r3d|wav|mp3|jpe?g|png|arw|cr[23]|dng)$/i;
var TIME_BUDGET_MS = 4.5 * 60 * 1000;
var START = Date.now();
function timeLeft_() { return (Date.now() - START) < TIME_BUDGET_MS; }

function footageLogCrawl() {
  var sheet   = getSheet_();
  var prior   = readExisting_(sheet);          // folderId -> {row, loggedAt, modified, fileCount, ...}
  var nowIso  = new Date().toISOString();
  var results = [];
  var deep = 0, skippedDeep = 0;

  listFolders_(SHARED_DRIVE_ID).forEach(function (outlet) {
    if (OUTLET_WHITELIST.indexOf(outlet.name) === -1) return;
    var outletName = outlet.name.replace(/^\d+\.\s*/, '').trim();

    findShootFolders_(outlet.id, []).forEach(function (sf) {
      var p = prior[sf.id];
      var needDeep = !p || p.modified !== sf.modifiedTime || p.fileCount === '';
      var fileCount, totalGB, uploadedBy;

      if (needDeep && timeLeft_()) {
        var stat = scanContents_(sf.id);
        fileCount  = stat.fileCount;
        totalGB    = Math.round(stat.totalBytes / 1073741824 * 100) / 100;
        uploadedBy = stat.uploadedBy;
        deep++;
      } else if (needDeep) {                   // out of time — leave blank, re-scan next run
        fileCount = ''; totalGB = ''; uploadedBy = ''; skippedDeep++;
      } else {
        fileCount = p.fileCount; totalGB = p.totalSize; uploadedBy = p.uploadedBy;
      }

      var dm      = sf.name.match(DATE_RE);
      var pattern = dm ? 'date' : (EP_RE.test(sf.name) ? 'EP##' : 'freeform');
      var shoot   = dm ? pad_(dm[1]) + '-' + pad_(dm[2]) + '-' + pad_(dm[3])
                       : isoDay_(sf.createdTime);
      var pid     = sf.name.match(PRODID_RE);

      results.push([
        sf.id, sf.name, sf.url, outletName, sf.parentName, shoot, pattern,
        pid ? pid[1] : '', isoDay_(sf.createdTime), isoDay_(sf.modifiedTime),
        fileCount, totalGB, uploadedBy, p ? p.loggedAt : nowIso
      ]);
    });
  });

  writeRows_(sheet, prior, results);
  Logger.log('Footage Log crawl: %s rows, %s deep-scanned, %s deferred (time)',
             results.length, deep, skippedDeep);
}

/* ---------- Drive traversal (advanced Drive service v3, Shared-Drive aware) ---------- */

function driveList_(query) {
  var out = [], token = null;
  do {
    var res = Drive.Files.list({
      q: query, pageToken: token, pageSize: 1000,
      corpora: 'drive', driveId: SHARED_DRIVE_ID,
      includeItemsFromAllDrives: true, supportsAllDrives: true,
      fields: 'nextPageToken,files(id,name,mimeType,webViewLink,createdTime,modifiedTime,size,lastModifyingUser(emailAddress))'
    });
    (res.files || []).forEach(function (f) { out.push(f); });
    token = res.nextPageToken;
  } while (token);
  return out;
}

function listFolders_(parentId) {
  return driveList_("'" + parentId + "' in parents and trashed=false and " +
                    "mimeType='application/vnd.google-apps.folder'")
    .map(function (f) {
      return { id: f.id, name: f.name, url: f.webViewLink,
               createdTime: f.createdTime, modifiedTime: f.modifiedTime };
    });
}

// Recurse under an outlet; a folder whose name matches the date or EP## pattern
// is a shoot folder (we do not recurse into it). Others are container folders.
function findShootFolders_(parentId, ancestors) {
  var found = [];
  listFolders_(parentId).forEach(function (f) {
    if (DATE_RE.test(f.name) || EP_RE.test(f.name)) {
      f.parentName = ancestors.length ? ancestors[ancestors.length - 1] : '(root)';
      found.push(f);
    } else {
      found = found.concat(findShootFolders_(f.id, ancestors.concat([f.name])));
    }
  });
  return found;
}

// Recurse a shoot folder: total files, total bytes, and the majority
// lastModifyingUser email across media files (uploader proxy). The uploader
// comes from the same list calls — no per-file Drive.Files.get.
function scanContents_(folderId) {
  var fileCount = 0, totalBytes = 0, tally = {}, calls = 0, media = 0;
  (function walk(id, depth) {
    if (calls >= 40 || media >= 10 || depth > 6) return;   // bound camera-card recursion
    calls++;
    driveList_("'" + id + "' in parents and trashed=false").forEach(function (f) {
      if (f.mimeType === 'application/vnd.google-apps.folder') { walk(f.id, depth + 1); return; }
      fileCount++;
      totalBytes += Number(f.size || 0);
      if (MEDIA_RE.test(f.name) && f.lastModifyingUser && f.lastModifyingUser.emailAddress) {
        media++;
        var em = f.lastModifyingUser.emailAddress;
        tally[em] = (tally[em] || 0) + 1;
      }
    });
  })(folderId, 0);
  var best = '', n = 0;
  Object.keys(tally).forEach(function (em) { if (tally[em] > n) { n = tally[em]; best = em; } });
  return { fileCount: fileCount, totalBytes: totalBytes, uploadedBy: best };
}

/* ---------- Sheet I/O (upsert by Folder ID) ---------- */

function getSheet_() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  var head  = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (head.join('') !== HEADERS.join('')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readExisting_(sheet) {
  var map = {};
  var last = sheet.getLastRow();
  if (last < 2) return map;
  var vals = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  vals.forEach(function (r, i) {
    if (!r[0]) return;
    map[r[0]] = { row: i + 2, loggedAt: r[13], modified: r[9],
                  fileCount: r[10], totalSize: r[11], uploadedBy: r[12] };
  });
  return map;
}

function writeRows_(sheet, prior, results) {
  var appends = [];
  results.forEach(function (row) {
    var p = prior[row[0]];
    if (p) sheet.getRange(p.row, 1, 1, HEADERS.length).setValues([row]);
    else   appends.push(row);
  });
  if (appends.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, HEADERS.length)
         .setValues(appends);
  }
}

/* ---------- helpers ---------- */
function pad_(n)      { n = String(n); return n.length < 2 ? '0' + n : n; }
function isoDay_(iso) { return iso ? String(iso).slice(0, 10) : ''; }
