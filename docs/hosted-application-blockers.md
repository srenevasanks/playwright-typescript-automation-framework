# Hosted application blockers

The automation repository cannot deploy changes to practicesoftwaretesting.com. These are owner-side remediation items, not changes claimed as deployed by this framework. The original assertions remain active; no test is skipped, marked expected-failure, or routed to a mock backend to obtain a passing regression.

## Fresh checkout without a cart

The public cart service returns null when sessionStorage has no cart_id. The cart template accesses cart.cart_items.length without guarding null. A fresh /checkout therefore raises a browser TypeError and does not render its empty state. Creating a cart in setup would conceal this specific failure and is deliberately not used in CAR-06.

The application owner can fix the template guard in sprint5/UI/src/app/checkout/cart/cart.component.html:

```diff
-@if (cart.cart_items.length) {
+@if (cart && cart.cart_items.length) {
```

The existing else branch already contains the empty-cart message. The owner should compile the application and validate both the no-cart and populated-cart paths before deploying; this repository does not host an unapproved local application.

## Empty credit-card fields

The public payment component assigns pattern/date validators to the credit-card fields but omits Validators.required. Its server error handler reads err.error.error and otherwise shows Unknown error; it does not reliably render field-level validation responses. CHE-04 retains the requirement for useful required-field feedback.

The application owner should add required validators for card number, expiration, CVV and holder name, recalculate validity after changing validators, render localized required-field messages, and map backend validation errors. These are application changes; accepting Unknown error as success would weaken the test.

## Invoice PDF generation

The documented status controller returns HTTP 400 with NOT_INITIATED before a generation record exists. HTTP 200 can return INITIATED or IN_PROGRESS before completion. The old test asserted immediate 200, which was too early; the corrected test accepts only those documented transitional combinations while polling and still requires final HTTP 200 + COMPLETED, enabled UI download, a real .pdf download, %PDF- signature and nonzero document size.

Repeated live checks remained pending for 60 seconds. The owner needs to investigate PDF job dispatch, queue workers, failed-job logs and generated-file storage. The precise server failure cannot be diagnosed without that service's logs. Increasing retries or generating a substitute PDF in the test would not fix the hosted service and is not done.

## Resolved automation assumptions

- Address readiness now waits for network quiescence at the address-form boundary before editing manual fields. This is narrowly scoped because two independently debounced lookup requests can outlive the loading indicator; no fixed sleep is used. The same empty-field and disabled-checkout assertions remain.
- Combined catalog controls are verified as search → filter → sort. Independent live exploration confirmed that this sends q, by_category and sort in the same real catalog request and returns the same four expected products in ascending price order. The previous sort → search sequence used a search endpoint that drops sort. Product/price assertions are preserved and request-criteria assertions are added. This corrects an unsupported action-order assumption; it does not claim the application's sort-then-search behavior was repaired.
