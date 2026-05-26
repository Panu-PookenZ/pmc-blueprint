"""
Sync runner skeleton — Sheets `_Update Log` → Airtable PMC base.

This is a **portable skeleton** showing the shape of a runner that
drains the change feed produced by `sheet-change-tracker.gs` and
upserts the changes into Airtable. In production the same pattern
runs inside a Claude Code skill plugin (private), but the logic is
identical and the skeleton is a reasonable starting point for any
sync stack — cron + Python, Cloud Run job, GitHub Action, etc.

Inputs
------
- Google Sheets API access to the Producer Dashboard Sheet
  (`_Update Log` tab, columns: timestamp, tab, cell, row, col,
  field_name, old_value, new_value, editor, status)
- Airtable PAT with read+write to the demo / your PMC base
- markStatus web app URL + secret (Keychain entries from setup)

What this skeleton intentionally leaves out
-------------------------------------------
- Field-level routing rules (which Sheet column → which Airtable field)
  — see `docs/03-data-model.md` for the full mapping table.
- Per-table mutation policy (overwrite vs append vs match-key).
- Crack-chain dispatch (when a Brief URL appears → kick off downstream
  enrichment; when a Cost Sheet URL appears → kick off budget sync).

For the production house version these are all in the Claude skill.
For your own version they're per-business decisions — adapt the
`route_change()` function below.
"""

from __future__ import annotations
import json
import os
import ssl
import urllib.request
from dataclasses import dataclass
from typing import Iterable


# ── Config (replace with your own) ───────────────────────────────────────────
AIRTABLE_BASE_ID    = os.environ.get("AIRTABLE_BASE_ID", "<DEMO_BASE_ID>")
AIRTABLE_PAT        = os.environ["AIRTABLE_PAT"]
MARKSTATUS_URL      = os.environ["MARKSTATUS_URL"]      # from Keychain
MARKSTATUS_SECRET   = os.environ["MARKSTATUS_SECRET"]   # from Keychain
SHEETS_API_TOKEN    = os.environ["SHEETS_API_TOKEN"]    # OAuth/service-account


# ── Models ───────────────────────────────────────────────────────────────────
@dataclass
class UpdateLogRow:
    sheet_row: int        # 1-indexed row number in the _Update Log tab
    timestamp: str
    tab: str              # e.g. "PD Producer A", "All Projects", "Dir. Director B"
    cell: str             # A1 notation, e.g. "F19"
    row: int              # the row in the source tab (e.g. 19)
    col: int              # the column in the source tab (e.g. 6)
    field_name: str       # the source column header, e.g. "Product Code"
    old_value: str        # may be empty for multi-cell paste edits
    new_value: str        # the recorded value (URL extracted if applicable)
    editor: str           # e.g. "producer@example.com"
    status: str           # "pending" | "deferred" — we only read these


# ── Step 1 — drain the change feed ──────────────────────────────────────────
def read_update_log() -> Iterable[UpdateLogRow]:
    """Read all _Update Log rows with status ∈ {pending, deferred}.

    NB: NOT a watermark scan. We re-evaluate deferred rows every run because
    the blocking condition (e.g. a duplicate Episode ID) may have cleared.
    See docs/05-design-patterns/status-based-gate-not-watermark.md.
    """
    # TODO: replace stub with real Sheets API call (sheets.values.get on the
    # `_Update Log!A:J` range), then filter status ∈ {pending, deferred}.
    raise NotImplementedError


# ── Step 2 — route each change to an Airtable mutation ──────────────────────
def route_change(row: UpdateLogRow) -> "Mutation | None":
    """Map (tab, field_name) → which Airtable table + field gets the value.

    Returns None if the change is not actionable (header diff, unknown field,
    skip-tab, etc.) — caller will mark these as `skipped`.
    """
    # TODO: implement per the field mapping in docs/03-data-model.md.
    # The production house's mapping has 50+ rules — start with 5-10 fields
    # and expand as needed.
    raise NotImplementedError


# ── Step 3 — apply mutations to Airtable ────────────────────────────────────
def apply_mutation(m: "Mutation") -> "MutationResult":
    """PATCH the Airtable record. Use typecast=true so singleSelect options
    auto-create on first use (see docs/05-design-patterns/airtable-typecast.md).
    Returns synced / skipped (no-op) / failed.
    """
    # TODO: PATCH via pyairtable or raw requests
    raise NotImplementedError


# ── Step 4 — flip status via markStatus web app ─────────────────────────────
def flip_statuses(updates: list[tuple[int, str]]) -> dict:
    """POST a batched update to the markStatus Apps Script web app.

    ⚠️ Must use Python `urllib.request`, NOT curl. Apps Script web apps
    return a 302 redirect that curl mishandles — drops the POST body,
    leading to 411 Length Required. Python urllib follows the redirect
    correctly with the body intact.

    See docs/05-design-patterns/markstatus-web-app-pattern.md for the
    full failure-mode analysis.
    """
    ctx = ssl.create_default_context()
    # Disable verify for local dev; in CI/prod use certifi properly.
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    payload = {
        "secret": MARKSTATUS_SECRET,
        "rows":   [{"row": r, "newStatus": s} for r, s in updates],
    }
    req = urllib.request.Request(
        MARKSTATUS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ── Main runner loop ─────────────────────────────────────────────────────────
def run():
    pending = list(read_update_log())
    flips: list[tuple[int, str]] = []

    for row in pending:
        mutation = route_change(row)
        if mutation is None:
            flips.append((row.sheet_row, "skipped"))
            continue
        try:
            result = apply_mutation(mutation)
            flips.append((row.sheet_row, result.status))
        except Exception as e:
            print(f"ERROR row {row.sheet_row}: {e}")
            flips.append((row.sheet_row, "failed"))

    # One batched POST per run — NOT one per row (Apps Script URL Fetch quota).
    if flips:
        print(f"Flipping {len(flips)} statuses via markStatus…")
        result = flip_statuses(flips)
        print(f"  {result}")
    else:
        print("Nothing pending — clean exit.")


if __name__ == "__main__":
    run()
