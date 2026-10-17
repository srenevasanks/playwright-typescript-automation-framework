# Actual execution summary

Executed on **17 October 2026 (Asia/Calcutta / IST)** against the publicly hosted application, without installing the application locally. Phase 0 passed before framework development; see [access validation](phase-0.md).

## Final outcome and scope

The delivered source contains **61 unique scenarios**: 53 browser scenarios and eight API scenarios. The three configured browser projects plus the single API project discover **167 project-expanded tests in 11 files**. Seven functional feature areas are covered: authentication, registration, catalog, cart, checkout, account and Contact attachment selection. API, integration, E2E and mocking are additional test categories.

Final unique Chromium/API scenario outcomes are **56 passed, 5 failed, 0 skipped, 0 flaky**. This combines the final 60-case core regression with the supplemental CON-01 attachment case. The headed check also repeated CAT-01; that duplicate is not counted twice. One passed scenario is explicitly mocked and is not backend evidence.

The native and Allure core reports each contain the genuine **60-case core run: 55 passed, 5 failed, 0 skipped**. CON-01 was added after that run began and executed separately in the two-case headed report; these partitions were not fabricated or rewritten into a synthetic native report.

| Executed scope                        | Tests | Passed | Failed | Skipped | Flaky | Runner duration |
| ------------------------------------- | ----: | -----: | -----: | ------: | ----: | --------------: |
| Core Chromium + API regression        |    60 |     55 |      5 |       0 |     0 |         305.7 s |
| Firefox + initial WebKit smoke        |    18 |     14 |      4 |       0 |     0 |          89.0 s |
| WebKit smoke recheck                  |     9 |      9 |      0 |       0 |     0 |          43.7 s |
| Chromium smoke, two workers           |     9 |      9 |      0 |       0 |     0 |          19.6 s |
| Chromium headed: attachment + catalog |     2 |      2 |      0 |       0 |     0 |           6.6 s |

Core run started at 17/10/2026, 20:23:28 IST. Detailed sanitized test titles, attempt outcomes, timestamps and durations are under [evidence](../evidence/).

## Browser-wise evidence

| Project               | Executed coverage                                       | Passed | Failed | Notes                                                                                             |
| --------------------- | ------------------------------------------------------- | -----: | -----: | ------------------------------------------------------------------------------------------------- |
| Chromium 156.0.8078.4 | 52 core browser scenarios + one supplemental attachment |     48 |      5 | Full implemented Chromium coverage executed; headed checks 2/2 and parallel smoke 9/9             |
| API                   | Eight documented API tests                              |      8 |      0 | Browser-free APIRequestContext fixture                                                            |
| Firefox 157.0         | Smoke only, nine cases                                  |      9 |      0 | Full Firefox regression was not run                                                               |
| WebKit 27.2           | Initial nine-case smoke                                 |      5 |      4 | HTTP 500/422 from hosted services; original report retained                                       |
| WebKit 27.2           | Complete nine-case smoke recheck                        |      9 |      0 | All first attempts passed; unchanged code and normal identity; full WebKit regression was not run |

The WebKit failures did not reproduce. This supports a transient hosted-environment classification, not a claim that every WebKit workflow is validated. No browser identity changes, security bypasses, conditional skips or weakened assertions were used.

## Retained failures

- **E2E-01:** UI registration, login, search, cart, order confirmation, invoice API identity/payment and invoice detail all completed. The PDF-status endpoint returned **400** in the final run. Earlier diagnostics showed INITIATED and a disabled Download PDF button after 30 seconds. No successful PDF download is claimed; signature/size assertions remain implemented but were not reached.
- **CAR-06:** fresh checkout without a cart does not render the empty-cart state; diagnostics show null cart_items access. Removing the last item from an existing cart passes separately.
- **CHE-02:** a late postcode lookup repopulates the cleared city. The blank postcode still blocks Proceed; the failure does not mean invalid checkout was accepted. This is a timing/async edit limitation retained visibly.
- **CHE-04:** empty credit-card submission displays Unknown error instead of actionable required-field feedback.
- **CAT-13:** search does not preserve selected ascending price order. The documented search API does not expose sort; this is recorded as an unsupported combination assumption / possible UX defect requiring product clarification, rather than overstated as a confirmed backend defect.

See the [investigation log](issues.md) for evidence, classifications and resolved automation/test-data defects. No failing test was skipped, deleted or marked expected-failure to obtain green results.

## Verified engineering and API integration

- Clean **npm ci**, TypeScript strict compilation, ESLint 10 and Prettier checks completed successfully. All required npm scripts are defined. Matching Chromium, Firefox and WebKit binaries were installed and launched.
- Real API coverage: product list/schema and details, category filtering, no-result search, unauthorized profile, unique registration/login/profile lifecycle, duplicate registration 409 and owned-cart quantity persistence with cleanup.
- INT-01 passed in Chromium, Firefox and the WebKit recheck: API product data → UI search/details → UI cart → equivalent price/total and cart product-ID/quantity API assertions.
- E2E-02 placed a real simulated Cash on Delivery order and verified the persisted invoice total. E2E-03 cart modification and E2E-04 profile update/logout/login both passed after fixes.
- CON-01 passed in headed Chromium using an in-memory zero-byte text file; filename, MIME type, byte length and clearing were asserted. No contact message was submitted; server-side upload is not claimed.
- Two independent authenticated browser contexts verified different user emails. Per-test API tokens are injected through in-memory storageState; UI login tests use the real form.
- Default worker count is one; two-worker Chromium smoke passed 9/9 without shared accounts or mutable storage. No full multi-browser regression claim is made.

## Reports and artifacts

- [Native HTML core report](../playwright-report/index.html): generated automatically and opened through npm run report at localhost:9323. A real Chromium check verified HTTP 200, rendered test titles and the 60/55/5 counts. [Sanitized overview](../evidence/report-overview.png).
- [Allure HTML core report](../allure-report/index.html): generated successfully using Java 17. Allure summary JSON confirms total 60, passed 55, failed 5, skipped 0. Raw final results are in allure-results/.
- [Diagnostic HTML report](../playwright-report-diagnostic/index.html): preserves earlier retry traces, screenshots and videos; seven trace ZIP artifacts were copied into its report data. Its earlier 53 passed / 5 failed / 2 flaky outcome is historical, not the final fixed-code result.
- [Initial cross-browser report](../playwright-report-cross-browser/index.html), [WebKit recheck](../playwright-report-webkit-recheck/index.html), [parallel smoke](../playwright-report-parallel/index.html), and [headed attachment check](../playwright-report-headed/index.html) remain separate genuine reports.
- Failure screenshots/videos live under the respective test-results directories and report data. Retry traces record the first retry. Generated reports and authentication-bearing artifacts are ignored by Git and excluded from the source archive.

## Environment, CI and limitations

Node v24.11.1, npm 11.18.0, Playwright 1.64.1, Windows 10.0.26200 x64. Browser versions above were read from actual launches; [environment record](../evidence/environment.json). Tests used the default hosted URLs in .env.example, locale en-US, headless mode except the two-case headed check, and one worker except the explicit two-worker smoke run.

[GitHub Actions](../.github/workflows/playwright.yml) triggers on push/pull request, installs Node 24 and Chromium, runs npm ci/typecheck/lint plus bounded Chromium/API smoke, generates Allure, and always uploads reports/diagnostics for seven days. Failures retain job failure status. Manual Chromium/API regression is supported. The workflow has not been executed on hosted GitHub because no remote repository or push was requested.

Customer account deletion is administrator-only. Generated synthetic accounts and demo invoices remain until reset; owned carts/favorites are cleaned where supported. One transient WebKit cart cleanup returned 500 and was reported. There is no separate shipping selector or native dialog in the inspected shopping workflow. Contact server upload requires message creation and was not executed. Public resets, latency, queue availability and shared data can affect future runs. No CAPTCHA, Cloudflare challenge, 403 or 429 was observed during feasibility validation; no security controls were bypassed.

## Exact repeat commands

Run from the project folder with Node 24 LTS:

```bash
npm ci
npx playwright install
npm run typecheck
npm run lint
npm run format:check
npm run test:smoke -- --project=chromium
npm run test:regression -- --project=chromium --project=api
npm run test:api
npm run test:firefox -- --grep '@smoke'
npm run test:webkit -- --grep '@smoke'
npm run test:smoke -- --project=chromium --workers=2
npm run test:headed -- --project=chromium --grep 'CON-01|CAT-01'
npm run report
npm run allure:generate
```

These are ordinary repeat commands using default artifact paths. The recorded supplemental runs used REPORT_DIR/RESULTS_DIR/JSON_REPORT/ALLURE_RESULTS_DIR overrides to preserve each report. The core regression is expected to retain the documented application failures until the hosted application behavior changes. Do not treat a later successful smoke result as full regression success.
