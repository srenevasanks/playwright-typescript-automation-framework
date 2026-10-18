# PR #1 CI stability follow-up — 18 October 2026 (IST)

I continued the existing PR without changing the application, any of the 61 scenarios, or their intended assertions. The Selenium repository was not modified. The executable/workflow changes in commit **0841d74e1dc77ca22ee24b25bdc9fffd083e186a** were exercised locally and in [GitHub Actions run 39099043227](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39099043227).

## Actual latest results

| Execution                                | Workers | Total | Passed | Failed | Skipped | Flaky | Duration |
| ---------------------------------------- | ------: | ----: | -----: | -----: | ------: | ----: | -------: |
| Local four affected checks               |       1 |     4 |      1 |      3 |       0 |     0 |  127.1 s |
| Local complete Chromium + API regression |       1 |    61 |     54 |      7 |       0 |     0 |  336.9 s |
| Hosted API smoke                         |       1 |     2 |      2 |      0 |       0 |     0 |    2.1 s |
| Hosted Chromium smoke                    |       1 |     9 |      7 |      2 |       0 |     0 |   55.1 s |

The overall hosted workflow is **failed**, with static checks successful, API smoke successful, and browser smoke failed on two Cloudflare challenges. API and browser are separate reports, jointly covering the existing 11-test smoke scope. Their jobs executed sequentially; both configured and observed peak concurrency were one. All runs used zero retries. The new complete regression is **54/61 passed**, not the previous 57/61 result and not a green run. No fresh full Firefox/WebKit regression was attempted.

The [dated evidence](../evidence/pr1-ci-stability-2026-10-18/) records runner-derived counts, all test titles and outcomes, cleanup timings, original/follow-up findings, hosted headers and report verification. Previous [57/61 execution and CI history](history/execution-summary-pr1-first-review-2026-10-18.md), [review evidence](../evidence/review-2026-10-18/) and the 17 October history remain intact. The earlier local Chromium/API 11/11, Firefox 9/9 and WebKit 9/9 smoke results remain historical observations; they are not substituted for the latest failures.

## Hosted access investigation

AUT-01 /account and REG-01 /auth/login again returned **403**, `cf-mitigated: challenge`, server cloudflare, and HTML verification pages. [Actual current response and snapshot evidence](../evidence/pr1-ci-stability-2026-10-18/github-validation.json), [safe screenshot](../evidence/pr1-ci-stability-2026-10-18/hosted-challenge.png). These are confirmed challenges, not evidence that nav-menu or login-submit locators changed. The exact Cloudflare rule/reputation signal requires the site owner's logs and is unknown.

| Setting             | Local                           | GitHub-hosted browser job                                        |
| ------------------- | ------------------------------- | ---------------------------------------------------------------- |
| OS                  | Windows                         | Ubuntu 24.04, Linux 6.17.0-1022-azure                            |
| Node                | 24.11.1                         | 24.21.0                                                          |
| Playwright          | 1.64.1, locked                  | Same                                                             |
| Chromium            | 156.0.8078.4                    | Same                                                             |
| Headless / viewport | true / 1280×720                 | Same                                                             |
| Workers / retries   | 1 / 0 in this follow-up         | 1 / 0                                                            |
| Recorded capacity   | 12 logical CPUs / 31.75 GiB RAM | 4 logical CPUs / 15,989 MiB RAM; 14,470 MiB available at startup |

Capacity is not a renderer-load profile. The same browser build succeeded for local AUT-01/REG-01 in the new full run, whereas hosted navigations received security responses. OS and egress/network route differ, but no evidence isolates a specific fingerprint or IP rule. More workers, longer locator waits or browser disguises are not justified. [Published permission review and authorized execution strategy](ci-access-policy.md) distinguish supported API automation examples from the absence of a public UI runner-access guarantee.

## Cleanup investigation

The original CHE-03 trace contains one DELETE targeting exactly the cart created by that test. It failed with **connect ETIMEDOUT** before an HTTP response, after about **21,028 ms**, below the existing 30,000 ms request timeout. The trace's -1 response value is a no-response sentinel, not an HTTP status. [Original evidence](../evidence/pr1-ci-stability-2026-10-18/original-cleanup-analysis.json).

In the new focused run, CHE-03's cleanup returned **204 in 501 ms**. In the new complete single-worker run it returned **204 in 486 ms**. Fifteen recorded cleanup attempts used distinct cart IDs across tests: fourteen returned 204 and one returned 500 in E2E-01. No cross-test cart reuse was observed. [Current cleanup and failure evidence](../evidence/pr1-ci-stability-2026-10-18/serial-cleanup-and-failures.json).

The old connection failure cannot be caused by a failed HTTP-status assertion because no response arrived. Cart ownership matches the UI creation, so there is no evidence of the wrong cart or a shared-account collision. Exact network/host cause is inconclusive; current server 500s separately demonstrate public-service errors. I did not claim to repair that service or add retry/timeout workarounds. The targeted improvement records timing, status, completion and safe failure codes, rethrows the original exception and disposes API contexts in finally. The existing 204/404 cleanup assertion, request timeout and business requests are unchanged. The E2E-01 cleanup 500 remains a genuine reported error.

## Seven latest regression failures

| Scenario | Actual failure                                                                            | Classification / limit                                               |
| -------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| E2E-01   | Focused PDF status remained INITIATED; full run returned PDF-status 500 and a cleanup 500 | Public PDF/service error; exact queue/database/storage cause unknown |
| E2E-02   | Registration fixture POST /users/register returned 500                                    | Backend precondition failure; journey assertions not reached         |
| E2E-03   | Same registration 500                                                                     | Backend precondition failure; journey assertions not reached         |
| E2E-04   | Same registration 500                                                                     | Backend precondition failure; journey assertions not reached         |
| INT-01   | Cart POST returned 422: selected product id is invalid                                    | Public data consistency failure observed; specific cause unconfirmed |
| CAR-06   | Fresh checkout has no empty-cart message and logs null cart_items TypeError               | Reproduced application rendering defect                              |
| CHE-04   | Payment 422 contains required-field errors, UI shows Unknown error                        | Reproduced application error-presentation defect                     |

For INT-01, the application/API served the same product ID successfully at 05:00:25 and 05:00:27 UTC, then rejected that ID in the UI's cart POST at 05:00:28. The ID was not hardcoded or replaced by the test. [Product consistency evidence](../evidence/pr1-ci-stability-2026-10-18/product-consistency.json). A reset, stale cache or other backend data change is possible but **not proven**. The original assertions remain active. The earlier 57/61 run is preserved rather than overwritten, and no further full run was used to chase a better number. [Reproduction and expectations](hosted-application-blockers.md).

## Reporting and CI verification

I generated and opened native HTML and Allure reports for all four scopes; [eight report-open checks](../evidence/pr1-ci-stability-2026-10-18/report-verification.json) confirm rendered counts agree. Runtime reports are ignored by Git:

| Scope                   | Playwright HTML                              | Allure HTML                              |
| ----------------------- | -------------------------------------------- | ---------------------------------------- |
| Focused four            | playwright-report-pr1-followup/index.html    | allure-report-pr1-followup/index.html    |
| Full 61                 | playwright-report-pr1-serial/index.html      | allure-report-pr1-serial/index.html      |
| Hosted API artifact     | playwright-report-pr1-ci-api/index.html      | allure-report-pr1-ci-api/index.html      |
| Hosted browser artifact | playwright-report-pr1-ci-chromium/index.html | allure-report-pr1-ci-chromium/index.html |

```bash
npx playwright show-report playwright-report-pr1-serial
npx allure open allure-report-pr1-serial
```

Allure's automatic categories are reporting groups, not confirmed root-cause findings. Use the table above to distinguish service errors, inconsistent shared demo data and observed UI behavior. Raw traces/screenshots/videos stay in ignored test-results-pr1-followup/ and test-results-pr1-serial/, or the hosted artifacts. Synthetic credentials and raw request bodies are not committed.

The real hosted run verified:

- **TypeScript, lint and formatting job: passed**, including npm ci.
- **API job: passed 2/2**, one worker, zero retries; both report generators and upload passed.
- **Chromium job: failed 2/9**, one worker, zero retries; both report generators and failure-artifact upload passed after test exit code 1.
- API finished before browser started, keeping hosted live-site concurrency at one. An API failure does not silently suppress browser evidence when static checks passed.
- Manual regression still selects API and Chromium scopes (eight + 53 = all 61). No hosted regression was dispatched against the observed browser restriction.

Local type checking, ESLint and formatting also passed. No new assertion, test retry, timeout increase, skip, security bypass, alternate application, public hosting or additional PR was introduced. The final documentation/evidence-only commit avoids rerunning identical traffic; no executable file changed after validated commit 0841d74. PR #1 remains open and unmerged.

Existing published Playwright and Allure URLs still serve the frozen 17 October 11-test smoke snapshot. Their 56 report files are unchanged; [report ownership](reporting.md) explains why that passing snapshot is not the latest full regression status.
