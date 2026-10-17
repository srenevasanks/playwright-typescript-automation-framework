# Phase 0 — real-browser feasibility

Executed 17 October 2026, starting at 19:45 IST. Selected application: [Practice Software Testing](https://practicesoftwaretesting.com/). Browser: Playwright-controlled headless Chromium 151.0.7922.34 (bundled Playwright 1.62.1, used only for temporary exploration). Framework execution subsequently uses its own pinned Playwright 1.64.1 and matching installed browsers.

| Check                  | Observed result                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage navigation    | HTTP 200; title “Practice Software Testing - Toolshop - v5.0”                                                                                            |
| Catalog rendering      | Product cards, prices, category/brand filters, sort and search rendered                                                                                  |
| Real interaction       | Searched Combination Pliers; real API search response 200                                                                                                |
| Product details        | Exact product title asserted; price, quantity and add-to-cart controls rendered                                                                          |
| Cart                   | Added one product; cart counter 1 asserted; selected product appeared in cart                                                                            |
| Checkout inspection    | Sign-in and guest identity options; billing address and payment steps present                                                                            |
| Authentication         | Login and registration forms rendered; account exploration later created a unique account and completed UI login                                         |
| Console/network        | Anonymous GET /users/me returned 401 and console Unauthorized; no transport request failures in initial rendering                                        |
| Access restrictions    | No Cloudflare, CAPTCHA, 403, rate limiting or bot challenge observed                                                                                     |
| Proof of concept       | PASS: rendered cards, search response 200, exact title, cart count and content; API specification 200                                                    |
| Available modules      | Catalog, filters, sorting, pagination, product details, registration/login, cart, checkout; subsequent exploration verified profile, favorites, invoices |
| API                    | Documentation and linked OpenAPI specification both returned 200                                                                                         |
| Environment limitation | Sandbox initially lacked browser path/network access; ordinary host execution worked, with no security-control bypass                                    |

The backup homepage at [automationintesting.online](https://automationintesting.online/) also rendered HTTP 200 after application hydration. Full backup feasibility was unnecessary because the primary passed. Neither site was installed locally.

The temporary proof of concept used Node assertions through a real Playwright browser, before framework development. Initial early DOMContentLoaded snapshots were incomplete; waiting for meaningful application controls resolved hydration timing. Framework results below come from native Playwright Test, not these exploratory checks.

Known limits at the feasibility gate: account permissions and payment persistence required further exploration; no cross-browser claims were made. A guest identity path means checkout authentication is not universally mandatory. Public data can reset, and anonymous profile 401 errors are application behavior, not evidence of a bot restriction.
