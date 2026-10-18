# Hosted application findings — 18 October 2026

The latest follow-up rechecked all three retained scenarios and completed all 61 tests with one worker. Focused results were one pass (CHE-03) and three failures; the complete run was 54 passed / seven failed, including additional service/data failures. [Current execution and seven-failure breakdown](execution-summary.md). Earlier results below are retained with their original evidence.

I reproduced the three historical checks on the real public application using Windows, Node 24.11.1, Playwright 1.64.1 and bundled headless Chromium 156.0.8078.4 (1280×720). The focused run used one worker, zero retries and traces. All three failed. None is skipped, marked expected-failure or replaced by a mock. [Sanitized observations](../evidence/review-2026-10-18/failure-observations.json) retain the actual payment/PDF responses and local evidence paths. The [previous analysis](history/hosted-application-blockers-2026-10-17.md) is preserved as history; its proposed owner-side implementation fixes were not deployed by this repository.

## CAR-06 — Empty cart

- **Reproduce:** open /checkout in a fresh browser context without creating a cart.
- **Expected:** “The cart is empty.” is visible and proceed-1 is not visible.
- **Actual:** the first assertion times out after the existing 12-second expect limit. The checkout shell appears without the empty message. Browser diagnostics record TypeError: Cannot read properties of null (reading 'cart_items'). The fresh trace has no cart API request, so this is not evidence of a failing GET /carts response.
- **Classification:** reproducible application rendering defect. A missing local cart is a valid empty-state precondition. Pre-creating one would conceal the failure.
- **Evidence:** [safe screenshot](../evidence/review-2026-10-18/car-06.png); ignored local test-results-review-focused/ui-cart-cart-Cart-regression-CAR-06-Empty-cart-chromium/trace.zip. Full regression retains its own failure screenshot/video/trace.
- **Status:** open; unchanged test retained. The proceed assertion is not reached after the first failure.

## CHE-04 — Credit card required fields

- **Reproduce:** create a unique authenticated customer, add a product, complete billing, select Credit Card and click Check payment with all card fields empty. No real payment data is supplied.
- **Expected:** useful field feedback; the existing assertions require “Credit card number is required.” and “Card holder name is required.”
- **Actual:** POST /payment/check returns HTTP 422 with required-field errors for credit_card_number, expiration_date, cvv and card_holder_name. The UI displays **Unknown error** instead of field feedback. The first existing UI assertion times out; the second is not reached. This is not a successful payment or missing backend validation.
- **Classification:** reproducible application error-presentation defect, supported by the mismatch between the real validation response and displayed generic error. Exact copy remains the existing test expectation, not a newly invented requirement.
- **Evidence:** [safe screenshot](../evidence/review-2026-10-18/che-04.png), actual non-sensitive response in [failure observations](../evidence/review-2026-10-18/failure-observations.json), and ignored local test-results-review-focused/ui-checkout-checkout-Check-31c2a-Credit-card-required-fields-chromium/trace.zip.
- **Status:** open; existing assertions unchanged.

## E2E-01 — Invoice PDF generation

- **Reproduce:** register, log in, search, add to cart, complete billing and synthetic Cash on Delivery payment, confirm the order, open its invoice and observe the PDF status.
- **Expected:** final HTTP 200 + COMPLETED within the existing 60-second poll, enabled download, a real .pdf download with %PDF- signature and size greater than 1000 bytes.
- **Actual focused execution:** payment check succeeds (200), invoice creation succeeds (201), and invoice retrieval succeeds (200). Status begins with HTTP 400 + NOT_INITIATED and then HTTP 200 + INITIATED. It does not reach COMPLETED within 60 seconds. The download/signature assertions are not reached. No substitute file was generated.
- **Classification:** observed unavailable/degraded PDF-generation behavior within the tested deadline. Queue/worker/storage cause and a product-level completion SLA are **inconclusive** without the owner's service logs; the trace alone does not prove a specific backend implementation defect.
- **Evidence:** lifecycle responses in [failure observations](../evidence/review-2026-10-18/failure-observations.json); ignored local test-results-review-focused/e2e-journeys-E2E-01-Regist-51c65-der-confirmation-regression-chromium/trace.zip and its screenshot/video. The invoice screenshot contains generated customer details and is deliberately not committed.
- **Status:** retained failure; no retry or polling timeout increase. See [latest execution](execution-summary.md) for the full rerun.

## Confirmed automation setup race fixed

The first new complete regression failed E2E-01 earlier, at AddressComponent.fill, rather than at PDF generation. Its trace shows country US, postcode 10001, empty house number; the helper fills 12, then a late saved-profile patch clears it before the debounced lookup. No matching checkout lookup request starts, and waitForResponse times out after 15 seconds. The failing page snapshot again shows an empty house number.

AddressComponent now settles pending profile traffic at the existing address-form boundary **before** reading/editing fields. The narrowly scoped networkidle condition is also already used after address lookups, which debounce independently. No fixed sleep, request interception, altered test data or longer timeout was added. The actual lookup status assertion and all business assertions remain. This fixes an observed setup race; it does not fix the hosted PDF service. The before-fix regression is retained separately from the post-fix run.

## GitHub-hosted access restrictions

The original hosted smoke [run 39047076592](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39047076592) failed AUT-01 and REG-01. Its screenshots and DOM snapshots show **Performing security verification** from Cloudflare where the account/login page was expected. [Sanitized screenshot](../evidence/review-2026-10-18/hosted-cloudflare-verification.png). These are environmental access restrictions, not proof of a broken nav-menu/login-submit selector. The ordinary local browser smoke passed both tests. The updated [PR run 39098291041](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39098291041) reproduced those two access failures with one worker and zero retries: AUT-01 /account and REG-01 /auth/login returned 403 with **cf-mitigated: challenge**, server cloudflare. All other nine smoke tests passed. [Current response/header evidence](../evidence/review-2026-10-18/github-smoke.json) · [current screenshot](../evidence/review-2026-10-18/hosted-cloudflare-current.png). Locked Playwright and Chromium builds match the passing local smoke. The site owner would need to authorize a suitable testing environment or approved access policy; this repository does not alter the protection. No full hosted regression was dispatched against the confirmed restriction. No stealth flags, proxies, cookie transfer, identity spoofing, challenge solving or security bypass is used.

## Earlier review network failure — CHE-03

The post-fix full regression retained one additional failure in **CHE-03 Payment selection supported**. Its payment selection/enabled-button assertions completed; the subsequent owned-cart DELETE in fixture teardown raised connect ETIMEDOUT 24.144.76.208:443. A separate targeted execution passed including cleanup. Classification: environmental connection failure observed in teardown; exact network/server cause inconclusive. The complete 57/61 passing result is retained, with no suppression, automatic retry or claim that the follow-up rewrote it. The original failure trace/video/screenshot remain in ignored test-results-review-final-regression/.

## Latest follow-up evidence

- **CAR-06:** unchanged empty-state/proceed assertions; empty message absent, browser null cart_items error remains. No cart is created to conceal the fresh-context case.
- **CHE-04:** unchanged required-feedback assertions; payment endpoint returns 422 with four required-field errors while the UI displays Unknown error. The second assertion is not reached after the first fails.
- **E2E-01:** focused order creation succeeds but PDF stays INITIATED for the existing 60-second poll. The later full run sees repeated NOT_INITIATED states followed by HTTP 500, and cleanup also returns 500. Final COMPLETED/download/%PDF-/size expectations remain unchanged and are not reached. Exact service-side cause remains unconfirmed.
- **CHE-03:** current cleanup returns 204 in both focused and full runs. Its original failing DELETE matched its own UI-created cart and never received an HTTP response. Diagnostics distinguish transport errors from HTTP-status assertion failures without retrying or suppressing either.
- **E2E-02/03/04:** the full follow-up fails during API registration on HTTP 500 before their journeys execute.
- **INT-01:** live API GET serves a product ID that the following UI cart POST rejects as invalid (422). Evidence supports an inconsistent public data observation, not a stale hardcoded ID; a server reset/cache cause is not proven.

[New focused observations](../evidence/pr1-ci-stability-2026-10-18/current-failure-observations.json), [original cleanup investigation](../evidence/pr1-ci-stability-2026-10-18/original-cleanup-analysis.json), [full cleanup/failure evidence](../evidence/pr1-ci-stability-2026-10-18/serial-cleanup-and-failures.json), [product consistency evidence](../evidence/pr1-ci-stability-2026-10-18/product-consistency.json).

The current hosted [run 39099043227](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39099043227) again has AUT-01 /account and REG-01 /auth/login Cloudflare 403 challenges. Static checks and API smoke pass independently; browser smoke fails. [Actual headers/snapshots](../evidence/pr1-ci-stability-2026-10-18/github-validation.json), [current safe screenshot](../evidence/pr1-ci-stability-2026-10-18/hosted-challenge.png), [owner-guidance review](ci-access-policy.md). Neither a broad prohibition nor a browser-runner access guarantee was established by the reviewed documentation. No challenge bypass or unapproved hosting is attempted.
