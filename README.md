# Playwright + TypeScript Automation Framework

I built this project to test a complete shopping journey on [Practice Software Testing](https://practicesoftwaretesting.com/), from registration and product search through cart updates and checkout. It includes UI tests, API tests, and tests that check the same data across both layers.

My focus was on tests I could run, investigate, and maintain: clear page objects, isolated test data, useful assertions, and reports that explain a failure without having to rerun everything first.

**[Open Playwright HTML report](https://srenevasanks.github.io/playwright-typescript-automation-framework/playwright/) · [Open Allure report](https://srenevasanks.github.io/playwright-typescript-automation-framework/allure/)**

## Verified review — 18 October 2026

I kept all 61 existing scenarios and their assertions, reproduced the three historical failures, and fixed a separate address setup race exposed by the new full run.

| Execution                          | Browser/API scope | Workers | Passed | Failed | Skipped |
| ---------------------------------- | ----------------- | ------: | -----: | -----: | ------: |
| Current smoke                      | Chromium + API    |       2 |     11 |      0 |       0 |
| Current smoke                      | Firefox           |       1 |      9 |      0 |       0 |
| Current smoke                      | WebKit            |       1 |      9 |      0 |       0 |
| Full regression before address fix | Chromium + API    |       2 |     58 |      3 |       0 |
| Full regression after address fix  | Chromium + API    |       2 |     57 |      4 |       0 |

The current full regression is **not green**. Fresh-cart rendering and credit-card feedback still fail, and the invoice PDF remains INITIATED within the existing deadline. The fourth failure was a connection timeout during owned-cart cleanup; its separate one-case check passed without replacing the full-run failure. I kept the genuine failures visible. [Investigation](docs/hosted-application-blockers.md) · [Actual execution and environment](docs/execution-summary.md).

The report links above open the **historical 17 October 2026 Chromium + API smoke snapshot**: 11 passed, zero failed/skipped, two workers, 22.7 seconds. They are not a live badge or a passing 61-case regression. New local reports and hosted artifacts belong to their own executions. [Report scope and retention](docs/reporting.md).

The older one/two-worker regression comparison remains in the execution history: both passed 58/61 with the same three failures, taking 372.7 s and 182.7 s respectively. Today's outcomes are listed separately above.

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

Pushes and pull requests run type checking, linting, formatting, and Chromium + API smoke with **one worker and zero retries**. Java 17 is installed explicitly for Allure. Failure traces do not depend on a retry. A manual workflow input runs the broader Chromium + API regression. The workflow installs locked dependencies and Chromium, generates both reports plus a scope-labelled runtime summary, and uploads reports and failure artifacts for seven days, including when tests fail. Jobs queue rather than interrupting active cleanup. Failures keep the job red.

The earlier hosted smoke encountered Cloudflare verification pages during login/registration. The updated [PR workflow](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39098291041) completed with **9 passed, 2 failed, 0 skipped**: AUT-01 and REG-01 received HTTP 403 Cloudflare challenge pages. Type/lint/format checks, report generation and artifact upload passed. [CI evidence and limits](docs/execution-summary.md); this is not a hosted green run. There is no scheduled traffic against the demo. CI reports belong to that particular workflow run; they do not replace the checked-in report snapshot. Secrets for a separately authorized environment should go in GitHub Actions secrets, not `.env` files in Git.

## Browser coverage and current limits

Chromium, Firefox, and WebKit smoke checks each passed 9/9 on 18 October 2026; the separate API smoke passed 2/2. Actual bundled browser versions and dates are recorded in the execution summary. The latest full one/two-worker comparison was Chromium + API. I have not claimed a full passing regression across all three browsers.

Product IDs and shared demo data can change. If a test fails, I check the live response and report before changing the expectation. The application also has no separate shipping-selection step in the inspected checkout flow, so there is no invented shipping test.

For missing browsers, run `npx playwright install`. For Allure startup problems, check `java -version` and `JAVA_HOME`. For a test failure, start with the screenshot, error context, and request diagnostics. Access restrictions are reported rather than bypassed.

Next improvements I would make with a dedicated environment are account cleanup, a pinned API schema, accessibility checks, and wider cross-browser regression. Those are future work, not features already implemented here.
