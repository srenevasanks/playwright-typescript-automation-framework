# Playwright + TypeScript Automation Framework

I built this project to test a complete shopping journey on [Practice Software Testing](https://practicesoftwaretesting.com/), from registration and product search through cart updates and checkout. It includes UI tests, API tests, and tests that check the same data across both layers.

My focus was on tests I could run, investigate, and maintain: clear page objects, isolated test data, useful assertions, and reports that explain a failure without having to rerun everything first.

**[Open Playwright HTML report](https://srenevasanks.github.io/playwright-typescript-automation-framework/playwright/) · [Open Allure report](https://srenevasanks.github.io/playwright-typescript-automation-framework/allure/)**

## Latest PR #1 follow-up — 18 October 2026

I kept all 61 scenarios and their intended assertions, investigated the remaining failures, and separated static checks, API execution and browser execution in CI. Passing checks are visible independently; the workflow still fails when browser access is blocked.

| Execution                                | Workers | Total | Passed | Failed | Skipped | Flaky | Duration |
| ---------------------------------------- | ------: | ----: | -----: | -----: | ------: | ----: | -------: |
| Local four affected checks               |       1 |     4 |      1 |      3 |       0 |     0 |  127.1 s |
| Local complete Chromium + API regression |       1 |    61 |     54 |      7 |       0 |     0 |  336.9 s |
| Hosted API smoke                         |       1 |     2 |      2 |      0 |       0 |     0 |    2.1 s |
| Hosted Chromium smoke                    |       1 |     9 |      7 |      2 |       0 |     0 |   55.1 s |

The latest full regression is **54 passed / 7 failed / 0 skipped**. CAR-06 and CHE-04 still expose UI failures. E2E-01 still cannot complete PDF generation and encountered an API 500 in the full run. That run also encountered three registration 500s and a 422 rejecting a product the API had just served. I retained those results; I did not rerun until the count looked better. CHE-03 passed both new checks including cleanup, but its original connection timeout remains recorded.

[Current results and root-cause limits](docs/execution-summary.md) · [Known application findings](docs/hosted-application-blockers.md) · [CI access policy review](docs/ci-access-policy.md).

[GitHub Actions run 39099043227](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39099043227) has **green static checks and API smoke (2/2)**, with **browser smoke still failed (7/9)** on AUT-01 and REG-01 Cloudflare 403 challenges. Local AUT-01 and REG-01 passed with the same locked browser build. This is not a fully passing hosted suite.

The report links above are the **historical 17 October smoke snapshot**: 11 passed, zero failed/skipped, Chromium + API, two workers, 22.7 seconds. They are not a live status badge or a passing 61-case regression. Earlier same-day local smoke passed 11/11, Firefox 9/9 and WebKit 9/9; these were not rerun as broad browser suites in this follow-up. The earlier 57/61 full run, its cleanup timeout, and all original evidence remain preserved. [Report scope and retention](docs/reporting.md).

## What this project demonstrates

- **UI automation:** registration, login, product search/filter/sort, cart calculations, checkout, profile changes, favorites, and contact file selection.
- **API testing:** product contracts, search, authentication, authorization, registration, and owned-cart updates using `APIRequestContext`.
- **UI/API integration:** retrieve a product through the API, find it in the UI, compare the price, add it to the cart, then verify that cart through the API.
- **Test architecture:** focused page objects and reusable components, strongly typed fixtures, data factories, and strict TypeScript.
- **Session handling:** a separate account per authenticated test, in-memory `storageState`, and a two-user browser-context isolation check.
- **Debugging:** real network inspection, web-first assertions, failure screenshots/videos, retry traces, and separate handling of automation problems and application problems.
- **Delivery:** locked dependencies, linting, formatting, bounded parallel execution, GitHub Actions, and two report formats.

There is one separately tagged network-mocking example. It demonstrates interception and is not counted as proof of backend integration. File selection is tested without sending a contact message. The invoice download check still fails when the hosted PDF service does not finish generating the document.

## Stack

Node.js 24 LTS · Playwright Test 1.64.1 · TypeScript 5.9 · dotenv · ESLint · Prettier · Allure · GitHub Actions

I used Playwright for its isolated browser contexts, API client, auto-waiting assertions, and debugging tools. TypeScript helps keep page objects, fixtures, and API models consistent as the suite grows.

## Project layout

```text
.github/workflows/     CI smoke run and manual regression
src/api/               typed API client, models and auth helpers
src/components/        shared address, header, navigation and product-card behavior
src/data/              unique user factories and scenario data
src/fixtures/          page objects, API clients and authenticated sessions
src/pages/             application page objects
tests/ui/              authentication, registration, catalog, cart, checkout, account, contact
tests/api/             documented API checks
tests/integration/     real UI/API comparisons
tests/e2e/             complete shopping and account journeys
docs/                  architecture, strategy, coverage and execution notes
evidence/              sanitized run summaries and screenshots
scripts/               sanitized execution summary helper
```

The catalog is also the homepage, so it uses one page object. I kept the structure close to the application instead of adding a base class for every interaction.

[Architecture and diagram](docs/architecture.md) · [Test strategy](docs/test-strategy.md) · [Initial access validation](docs/phase-0.md)

## Run it locally

Use Node.js 24 LTS. From the project folder:

```bash
npm ci
npx playwright install
npm run typecheck
npm run lint
npm run test:smoke:parallel
```

On Linux, install browser system dependencies with `npx playwright install --with-deps`.

The default configuration points to the public demo and needs no shared account or secret. To change settings, copy `.env.example` to `.env`. Tests create synthetic users; do not replace the factory data with personal information.

| Command                                     | What it runs                                    |
| ------------------------------------------- | ----------------------------------------------- |
| `npm run test:serial`                       | Complete Chromium + API suite, one worker       |
| `npm run test:parallel`                     | Same complete suite, two workers                |
| `npm run test:smoke:parallel`               | Eleven Chromium + API smoke checks, two workers |
| `npm run test:smoke`                        | Smoke checks across configured projects         |
| `npm run test:regression`                   | Regression across configured projects           |
| `npm run test:api`                          | API tests only                                  |
| `npm run test:chromium`                     | Chromium UI/integration/E2E tests               |
| `npm run test:firefox`                      | Firefox UI/integration/E2E tests                |
| `npm run test:webkit`                       | WebKit UI/integration/E2E tests                 |
| `npm run test:headed -- --project=chromium` | Visible Chromium execution                      |
| `npm test`                                  | All configured projects                         |
| `npm run format:check`                      | Formatting validation                           |

For a single scenario, append `-- --grep CAT-14` to a test command. Tags are `@smoke`, `@regression`, `@upload`, and `@mock`. Use `--grep-invert '@mock'` to exclude the interception example.

This is a shared public application, so routine checks use the small smoke suite. The full all-project run expands to 167 cases; I do not run it on every push.

## How setup and parallel execution work

Authenticated tests register a unique user through the API and load that user's token into a fresh browser context. Tests specifically covering login still use the login screen. There is no shared mutable login file or test-order dependency.

The default worker count is one. Two workers were validated against the same complete suite and produced the same failure set, in about half the elapsed time. `WORKERS` accepts one or two; CLI overrides should stay within that limit for this public site. I do not run multiple full suites at the same time.

Owned carts and favorites are cleaned up through supported endpoints. The demo does not provide customer-side account or invoice deletion, so those records remain until its next reset. Tests use simulated payment options and no real financial credentials.

## Open the reports

```bash
npm run report
npm run allure:generate
npm run allure:open
```

Playwright writes `playwright-report/index.html` automatically after execution. Allure writes raw results to `allure-results/`; its HTML generator requires Java 17 or later and outputs `allure-report/`.

Failures retain screenshots and videos. CI retains failure traces with zero retries; local default tracing starts on the first retry. For a focused investigation use `--trace=on --retries=0`, then open it with `npx playwright show-trace path/to/trace.zip`.

The `reports/` folder contains one Playwright HTML report and one Allure report from the same smoke snapshot. Generated credentials and machine identifiers were redacted; results and timings are unchanged. The links at the top open each report directly in the browser. GitHub Pages serves only these report files; there is no separate portfolio or landing page. For local viewing, serve the repository with `npx http-server .` and open `/reports/playwright/` or `/reports/allure/`. New test runs generate reports in the usual output directories described above.

## GitHub Actions

The workflow has three visible jobs: static checks (npm ci, TypeScript, ESLint and formatting), API execution, and Chromium execution. API and browser run sequentially with **one worker and zero retries**. Browser challenges remain failed tests and keep the workflow red; successful static/API jobs are not presented as a green browser suite. A manual input selects regression instead of smoke without changing any scenarios.

Each execution job uses locked dependencies, Java 17 for Allure, separate scope-labelled HTML/Allure/JSON artifacts and seven-day retention. Chromium is installed only for the browser job. Failure traces, screenshots and videos upload after test failures. The current hosted run and response evidence are in [the execution summary](docs/execution-summary.md).

The owner's public API examples include GitHub Actions, but I found no explicit assurance of challenge-free GitHub-hosted UI access in the guidance reviewed. [Access review and authorized execution options](docs/ci-access-policy.md). I use normal browser settings and do not solve or disguise challenges. Reliable unattended UI execution needs an owner-approved test environment or access policy; no alternate environment was deployed here.

There is no scheduled public-demo traffic. CI artifacts belong to their execution and never silently replace the frozen published smoke snapshot. Environment secrets belong in GitHub Actions secrets.

## Browser coverage and current limits

Earlier Chromium, Firefox, and WebKit smoke checks each passed 9/9 on 18 October 2026; the separate API smoke passed 2/2. Actual bundled browser versions and dates are recorded in the execution summary. The latest full one/two-worker comparison was Chromium + API. I have not claimed a full passing regression across all three browsers.

Product IDs and shared demo data can change. If a test fails, I check the live response and report before changing the expectation. The application also has no separate shipping-selection step in the inspected checkout flow, so there is no invented shipping test.

For missing browsers, run `npx playwright install`. For Allure startup problems, check `java -version` and `JAVA_HOME`. For a test failure, start with the screenshot, error context, and request diagnostics. Access restrictions are reported rather than bypassed.

Next improvements I would make with a dedicated environment are account cleanup, a pinned API schema, accessibility checks, and wider cross-browser regression. Those are future work, not features already implemented here.
