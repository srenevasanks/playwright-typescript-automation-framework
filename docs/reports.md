# Published report snapshot

The repository's GitHub Pages site has one Playwright HTML report and one Allure report. Both represent the same real eleven-case Chromium/API smoke run with two workers, recorded on 17 October 2026: 11 passed, 0 failed, 0 skipped, 0 flaky, 22.7 seconds. The landing page links to both formats and the complete regression findings.

This is a saved portfolio snapshot. The full 61-case regression remains 58 passed and three failed, with the same failures using one and two workers. Those failures are retained in the suite and documented in [execution-summary.md](execution-summary.md). A passing smoke report is not a claim of a passing full regression.

## Public files and private artifacts

The `main` branch contains the complete framework, documentation, sanitized evidence and a `reports/` folder with one Playwright report and one Allure report. The `gh-pages` branch serves a copy of that report folder as a browsable site. Generated local report directories, authentication state, raw results and failure artifacts stay ignored by Git.

Before publication, `scripts/prepare-public-reports.py` copies the chosen native report and Allure results to a new directory, redacts generated synthetic emails/passwords, bearer tokens, local workspace paths and Allure machine labels, and preserves test outcomes, durations and steps. The Playwright embedded report ZIP is decoded, redacted and rebuilt; it is not replaced with a hand-written report. Allure HTML is generated from the sanitized real results. Unexpected attachment types stop publication for review.

Python 3 is optional and used only by this publication helper; running the TypeScript framework does not require Python. Java 17+ is needed to generate Allure HTML.

```bash
python scripts/prepare-public-reports.py /path/to/new-report-publication
npx allure generate /path/to/new-report-publication/allure-sanitized-results --clean -o /path/to/new-report-publication/allure
```

The helper expects the preserved `playwright-report-followup-smoke`, `allure-results-followup-smoke`, and matching `evidence/parallel-smoke-followup.json`. Those local raw directories are intentionally not committed. For a new snapshot, run the suite with those output-directory overrides, verify the scope and results, and review attachments before publishing. Remove the sanitized raw-result staging directory before committing the static site. The helper does not create or push a GitHub repository.

CI artifacts are separate run-specific diagnostics retained for seven days. They can contain generated test credentials in failure traces and should be reviewed before redistribution. They do not automatically overwrite the public portfolio snapshot.
