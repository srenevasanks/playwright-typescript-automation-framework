# Execution review — 18 October 2026 (IST)

I reviewed the existing framework and preserved all 61 distinct Chromium/API scenarios and their assertions. The application remains the real public Practice Software Testing deployment. Node 24.11.1, Playwright 1.64.1, Windows, headless 1280×720; actual versions are in [environment evidence](../../evidence/review-2026-10-18/environment.json): Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2.

## Actual local execution

| Local execution                         | Workers | Total | Passed | Failed | Skipped | Flaky | Duration |
| --------------------------------------- | ------: | ----: | -----: | -----: | ------: | ----: | -------: |
| Focused historical-failure reproduction |       1 |     3 |      0 |      3 |       0 |     0 |  123.5 s |
| Complete regression before address fix  |       2 |    61 |     58 |      3 |       0 |     0 |  160.5 s |
| Complete regression after address fix   |       2 |    61 |     57 |      4 |       0 |     0 |  194.0 s |
| Chromium + API smoke                    |       2 |    11 |     11 |      0 |       0 |     0 |   21.2 s |
| Firefox + WebKit smoke                  |       1 |    18 |     18 |      0 |       0 |     0 |  120.1 s |
| Separate CHE-03 network check           |       1 |     1 |      1 |      0 |       0 |     0 |    9.9 s |

Each row is a separate execution, not additive coverage. The 61-case regression includes 53 browser cases and eight API tests. MOC-01 is one explicitly mocked browser case; it is not live backend proof. Sanitized runner summaries in [dated evidence](../../evidence/review-2026-10-18/) contain every title, outcome, attempt duration and configured/observed concurrency. All review runs used zero retries. No scenario is skipped or marked expected-failure.

The focused run reproduced CAR-06 (empty-cart rendering), CHE-04 (missing credit-card feedback) and E2E-01 (PDF status stayed INITIATED). The first full run also exposed an **automation address setup race** in E2E-01, before PDF generation. After the targeted synchronization fix, E2E-01 passed address setup and order creation and reached the same PDF completion failure as the focused execution. The current complete result is **57 passed / 4 failed / 0 skipped**, not a passing regression.

The fourth failure, CHE-03, is a teardown connection timeout on DELETE /carts/<owned-id> (ETIMEDOUT 24.144.76.208:443). Its business assertions completed before cleanup. A separate one-case diagnostic check passed including cleanup; that result does not replace the complete run's failure. The leftover cart from the failed cleanup may remain until the public demo resets. The precise network cause is unproven. [Failure investigation](../hosted-application-blockers.md) explains expected/actual behavior and evidence.

Chromium smoke passed 9/9 browser tests and API smoke passed 2/2, jointly 11/11 with two workers. Firefox and WebKit each passed 9/9 smoke cases with one worker. After changing address setup, I also rechecked its existing REG-01 scenario in both engines; the separate result is retained. No full Firefox/WebKit regression was run or claimed.

npm ci installed the lockfile successfully with zero audit findings. Type checking, ESLint and formatting validation passed. The test source files, assertions, API clients, page objects, test data, authentication/session setup and package lockfile remain unchanged. The only interaction change is settling asynchronous profile traffic before reading/editing the existing address form.

## Worker comparison

The preserved 17 October runs were 58/61 passed, three failed, zero skipped: one worker 372.7 s and two workers 182.7 s. Those are historical measurements, not today's results. Today's before-fix two-worker run took 160.5 s; the after-fix run took 194.0 s and included a full PDF wait plus a cleanup connection failure. They are not controlled performance benchmarks. Per-test UUID data, API contexts and authentication state remain independent, and concurrency stays bounded at 1–2. The default remains one; no higher concurrency was introduced.

## Reports and public links

I generated and opened the actual reports in Chromium:

- Current smoke: playwright-report-review-smoke/index.html and allure-report-review-smoke/index.html — 11 passed.
- Current complete regression: playwright-report-review-final-regression/index.html and allure-report-review-final-regression/index.html — 57 passed, four failed.
- Failure screenshots, videos, traces, JSON and diagnostic attachments: test-results-review-focused/ and test-results-review-final-regression/ (ignored runtime artifacts).
- [Report-open evidence](../../evidence/review-2026-10-18/report-open-check.json) records rendering and HTTP checks. Allure's default “Product defects” category is reporter grouping, not a confirmed root-cause classification; use the investigation above for the cleanup/network finding.

The existing [published Playwright](https://srenevasanks.github.io/playwright-typescript-automation-framework/playwright/) and [published Allure](https://srenevasanks.github.io/playwright-typescript-automation-framework/allure/) links still represent **17 October's 11/11 passing smoke**, two workers. They have not been replaced by the new regression. [Snapshot manifest](../../evidence/review-2026-10-18/published-snapshot-manifest.json), [report ownership](../reporting.md), [previous execution summary](../history/execution-summary-2026-10-17.md) and the original evidence remain preserved.

## GitHub Actions validation

The previous hosted smoke run [39047076592](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39047076592) completed with failed login/registration checks showing Cloudflare verification pages. Its access restriction is documented separately from the local application findings. The updated [PR workflow run 39098291041](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39098291041) actually executed **11 smoke tests: 9 passed, 2 failed, 0 skipped, 0 flaky**, one worker, zero retries, 55.5 seconds. API smoke passed 2/2; Chromium browser smoke passed 7/9. AUT-01 received HTTP 403 at /account and REG-01 received HTTP 403 at /auth/login. Their original response headers include **cf-mitigated: challenge**, server cloudflare, and content-type text/html; their snapshots show Performing security verification. [Actual sanitized CI summary and response evidence](../../evidence/review-2026-10-18/github-smoke.json) and [current screenshot](../../evidence/review-2026-10-18/hosted-cloudflare-current.png).

Hosted Node is 24.21.0 on Ubuntu 24.04; local Node is 24.11.1 on Windows. Both use locked Playwright 1.64.1, Chromium 156.0.8078.4, headless mode and a 1280×720 viewport. No browser-build mismatch is shown. CI uses one worker versus the local two-worker smoke. Its challenge pages are access restrictions, not evidence that higher local concurrency is required.

The real hosted job passed npm ci, browser installation, type checking, linting and formatting. Runtime summary generation, Allure generation and report/trace artifact upload all succeeded **after Playwright test exit code 1**; the job remains failed. The artifact is playwright-smoke-39098291041-1 with seven-day retention. Native runner JSON and Allure agree on 9 passed / 2 failed / 11 total. No hosted full regression was dispatched after this confirmed access restriction; no hosted passing regression is claimed.

The final documentation/evidence-only commit uses [skip ci] to avoid repeating identical public-demo traffic after the access restriction was confirmed. Run 39098291041 validates executable/workflow commit 16784b524026ad7cf975b4e54ff6b6c6bc72b020. No executable file changed after that run. Its failed outcome is retained, not converted to success.

The updated workflow uses Ubuntu 24.04, Node 24, npm ci, bundled Chromium, explicit Java 17, type checking, linting and formatting. Smoke runs with one worker, zero retries and retained failure traces. Both report formats and a scope-labelled JSON summary upload even after test failures; no continue-on-error or swallowed test exit status is used. Manual regression remains available. No public regression is scheduled, and no access/security bypass was introduced.
