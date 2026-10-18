# Architecture

```mermaid
flowchart TD
  Specs[UI, API, integration and E2E specifications] --> Fixtures[Typed test fixtures]
  Fixtures --> Pages[Focused page objects]
  Pages --> Components[Header, navigation and product cards]
  Fixtures --> Api[Toolshop API client]
  Fixtures --> Factory[UUID test data factory]
  Auth[Per-test API authentication] --> State[In-memory storageState]
  State --> Context[Isolated browser context]
  Context --> Pages
  Components --> Public[Public Toolshop application]
  Api --> Backend[Documented public API]
  Specs --> Runner[Native Playwright Test runner]
  Runner --> Projects[Chromium, Firefox, WebKit and separate API project]
  Runner --> Report[HTML, JSON and Allure reporters]
  Mock[Explicit MOC-01 mock example] -. route.fulfill .-> Context
  CI[GitHub Actions one-worker smoke] --> Runner
  Fixtures --> Diagnostics[Console and network diagnostics]
  Diagnostics --> Report
```

The catalog is the homepage, so ProductsPage owns both; a duplicate HomePage would add no behavior. Page objects expose business actions and observable locators; tests own scenario assertions. Components cover repeated navigation and cards without an inheritance hierarchy.

API clients validate HTTP status and JSON media type before returning typed payloads. TypeScript interfaces support compilation; explicit API tests assert runtime fields and relationships. Product IDs and prices come from the live API rather than a stale seed snapshot.

The base fixture supplies fresh contexts, generated user data, API contexts and focused page objects. The authentication fixture creates a separate account and token per test and supplies Playwright storageState in memory. No state files or shared mutable worker accounts are used. UI authentication tests use the base fixture and exercise the actual login form. A two-user scenario creates and closes independent contexts explicitly.

Owned UI carts are recorded from creation responses and deleted during fixture teardown. API cart tests use try/finally. Favorites are removed by their returned IDs. User deletion is documented as administrator-only; the suite does not attempt it. Test invoices cannot be removed by a customer and remain until demo reset.

Public-demo execution defaults to one worker; WORKERS accepts only 1–2. Browser projects exclude API files, and a separate API project prevents triplicating API traffic. CI runs only Chromium/API smoke by default. Manual regression is bounded and preserves failure status. CI explicitly disables retries, retains traces on failure, checks formatting, installs Java 17 for Allure, and queues runs instead of cancelling active cleanup.

Current browsers negotiate HTTP QUERY for product retrieval; older engines may use GET. Both methods are documented. Response inspection accepts these two read methods and scopes by exact endpoint pathname. Browser request interception exists only in the explicitly tagged mocking example.

## Diagnostics and result ownership

TypeScript strict mode, noUncheckedIndexedAccess and unused-symbol checks are enabled. Test fixtures attach the actual browser version, Node/platform, viewport, project and worker indexes. Console errors, page errors, request failures and bounded cart/payment/invoice response metadata help classify failures. The diagnostic attachment omits headers, bodies and query strings; raw Playwright traces can still contain credentials and stay ignored.

The real INT-01 integration uses the API and UI against the same public backend. MOC-01 alone intercepts the search response; the dotted path in the diagram represents a separate mocked example, not backend integration. API runtime assertions are explicit tests; TypeScript interfaces alone do not validate response schemas.

Each test has its own APIRequestContext, UUID data and default browser context. Authenticated tests receive a new account/token through in-memory storageState. The 1–2 worker cap and per-test ownership remain unchanged. The summary helper reads runner JSON and writes ignored runtime output by default. [Report ownership and immutable snapshots](reporting.md) describe the separate historical smoke and current regression evidence.
