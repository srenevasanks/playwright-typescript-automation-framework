# Public demo access and CI execution strategy

Reviewed 18 October 2026. This is a review of published guidance and observed responses, not an approval from the application's owner.

## What the owner documents

- The [owner's application documentation](https://github.com/testsmith-io/practice-software-testing/blob/main/docs/README.md) describes a practice testing application and lists the hosted UI/API versions.
- The [owner's TypeScript/Playwright API example](https://github.com/testsmith-io/api-test-automation-ts-playwright) explicitly describes API automation and a GitHub Actions pipeline using the public API. That supports the API use case; it does not guarantee that every browser navigation through the public UI's Cloudflare protection is allowed.
- I found no explicit commitment in these reviewed sources that GitHub-hosted **UI browser** automation is exempt from challenges or continuously available. This is an absence of a documented guarantee, not proof of a universal ban on GitHub runners.

## Observed access restriction

In run [39098291041](https://github.com/srenevasanks/playwright-typescript-automation-framework/actions/runs/39098291041), AUT-01 /account and REG-01 /auth/login received HTTP 403 with `cf-mitigated: challenge`, server cloudflare and HTML content. Their snapshots show Performing security verification. [Cloudflare documents](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/detect-response/) this header as identifying a challenge response, whose content type is HTML. [Original response evidence](../evidence/review-2026-10-18/github-smoke.json). The site owner has not supplied the rule decision or security logs, so the exact rule, reputation signal or cause of selecting those requests is unknown.

Local Windows smoke passed with Node 24.11.1, Playwright 1.64.1 and Chromium 156.0.8078.4. The hosted Ubuntu 24.04 run used Node 24.21.0 with the **same locked Playwright/browser build, headless mode and 1280×720 viewport**. It already used one worker and zero retries. OS, network route and egress differ; the evidence does not isolate any single fingerprint or IP rule. A one-worker challenge is not evidence of CPU contention, a broken selector, or a need for more workers.

## Authorized execution strategy

Keep static checks and API execution as independently visible CI jobs. Keep the hosted browser job enabled with one worker, no retries, and a failing result when a challenge replaces the page. Passing static/API jobs do not mean the browser smoke or full regression passed.

Continue small manual runs from the existing normally accessible local environment, with unchanged browser identity and no challenge handling. If any environment receives a challenge, stop attempted circumvention and retain the evidence. For reliable unattended UI testing, ask the application owner for a designated test environment or an explicitly approved access policy for the intended runner. A private internal instance could be evaluated only with the user's approval and within the [owner's license](https://github.com/testsmith-io/practice-software-testing/blob/main/LICENSE); public hosting/distribution is restricted. No instance, self-hosted runner, proxy, access-rule exception or alternate application was installed or configured in this work.

The workflow's three jobs separate status, not coverage. API and browser scopes run sequentially so total demo traffic stays at one worker. Both remain real backend executions; the original network-mocking example remains separately tagged. Manual regression still discovers all 61 existing tests across the two execution jobs. No failure is turned into a skip or success.
