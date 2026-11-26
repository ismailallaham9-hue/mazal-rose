# Tabby QA integration

This implementation is test-only and rejects live secret keys. It is disabled unless all required server environment variables are present.

## Render environment

- TABBY_ENABLED=true (leave unset until the QA deployment is approved)
- TABBY_SECRET_KEY: test secret, server only
- TABBY_MERCHANT_CODE=MAZ
- TABBY_WEBHOOK_SECRET: random secret configured identically in the registered webhook

Register https://mazal.ae/api/payments/tabby/webhook with Tabby's webhook API using the test key and merchant code. Set its custom header title to X-Tabby-Auth and its value to TABBY_WEBHOOK_SECRET. Never commit keys.

Test sessions redirect in the same window. Webhooks authenticate the custom header and retrieve the payment independently; order reference, payment ID, amount, AED currency and is_test are verified before capture. Capture uses a stable order-based reference. Test status is stored in tabbyTestStatus; production paymentStatus, inventory and Meta Purchase remain untouched. Test carts are retained for repeated QA.

## Remaining QA requirements before submitting to Tabby

- Product/cart messaging snippets and Tabby logo/approved checkout messaging.
- Background pre-scoring and customer-facing rejection reasons.
- Desktop/mobile success, cancellation, rejection, delayed callback and closed-browser tests using configured test credentials.
- Confirm repeated callbacks create only one capture in Tabby.
- Agree test-cart behavior with Tabby; this QA flow deliberately retains the cart.
- Live payment fulfillment, stock and Meta tracking must be implemented and reviewed separately before accepting live keys.

This branch is not ready for Tabby's full QA sign-off or live activation yet.
