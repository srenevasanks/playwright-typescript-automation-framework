# Execution evidence

All JSON files contain sanitized runner counts, test titles, project names and durations. They do not contain request credentials, response bodies or authentication state.

- `workers-1.json`: latest complete 61-case Chromium/API regression with one worker.
- `workers-2.json`: latest complete regression with two workers (created after that run finishes).
- `parallel-smoke-followup.json`: latest eleven-case Chromium/API smoke with two workers (created after execution).
- `followup-revalidation.json`: unchanged five-case failure reproduction before the follow-up fixes.
- `followup-repeated-fixes.json`: two repetitions each of address validation and PDF completion checks.
- `final-regression.json` and `final-distinct-outcomes.json`: **historical initial delivery**, before this follow-up; see execution-summary-initial.md for their scope. They are retained rather than overwritten to conceal earlier failures.
- `diagnostic-regression.json`, `initial-regression.json` and intermediate run files: historical debugging runs.
- `cross-browser-smoke.json` and `webkit-recheck.json`: previous Firefox/WebKit smoke validation; full browser regression was not claimed.
- `parallel-smoke.json` and `headed-attachment.json`: previous worker/headed checks.

The current outcomes and links to genuine HTML reports are in [execution-summary.md](../docs/execution-summary.md). Public catalog and report overview screenshots contain no account credentials. Generated full reports, screenshots, videos and traces remain ignored by Git.
