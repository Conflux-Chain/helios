# @fluent-wallet/wallet_refetch-phishing-list

`wallet_afterUnlock` dispatches this internal RPC without waiting for HTTP. Domain checks also trigger a due refresh while unlocked. No activity or a locked wallet starts no request. The wallet sends no browsing origins, has no bundled list and does not schedule alarms or enforce UI policy here.

## Module boundaries

- [fetch-list.js](./fetch-list.js) fetches and decodes the MetaMask full list and diffs, and the Fluent full list. It does not read wallet storage or decide when to refresh.
- [list-cache.js](./list-cache.js) decides when each source is due, keeps the last validated lists, coalesces requests, and rechecks pending origins. It consumes source methods instead of interpreting HTTP response bodies.
- [domain.js](./domain.js) is pure: it normalizes domain entries, matches origins, and compares or serializes the allowlist and blocklist. These phishing policies are distinct from validating ENS/CNS names or comparing SIWE authorities.

## Two independent sources

| Source | When due | Data |
| --- | --- | --- |
| [MetaMask baseline](https://phishing-detection.api.cx.metamask.io/v1/stalelist) | First use, then every 30 days | Read `data.allowlist`, `data.blocklist` and `data.lastUpdated`. Send `If-None-Match` on later baseline checks if an ETag was supplied. |
| MetaMask hotlist | Immediately after a new baseline, then every 5 days | `GET /v2/diffsSince/<cursor>` on the same origin. The cursor starts at the baseline’s server timestamp **in seconds**. Apply newer `eth_phishing_detect_config.allowlist` and `.blocklist` additions/removals, not entries from other lists. Empty deltas update only freshness; never substitute the device clock for the cursor. |
| [Fluent config](https://github.com/conflux-fans/phishing-detect) | First use, then on demand at least 24 hours after the last successful check | A small, manually maintained `config.json`: `whitelist` and `blacklist`; empty arrays are valid. Conditional fetch when an ETag is available. No mirror or automated upstream import. |

Both sources are stored as `whitelist` and `blacklist` arrays. Both arrays are required. The wallet compares their normalized domains, not a version number, to decide whether to rewrite the stored lists.

Sources are checked independently. A failed download, invalid data or failed storage write does not replace the active lists. There is one active MetaMask list. A validated full response and its cursor are saved together and can be used even if the following delta fails. An older full list cannot roll back newer local changes. Retry the delta from the saved cursor rather than re-downloading the full list after a restart; there is no staging key. Refreshes are coalesced, with a short failure backoff. Old versions of the Fluent mirror cache are not used as Fluent policy.

The [MetaMask controller](https://github.com/MetaMask/core/blob/652066081c3e20921cbe1e00b6e0a6fa02004159/packages/phishing-controller/src/PhishingController.ts#L84-L117) defaults to a 30-day baseline and **5-minute** hotlist; Fluent deliberately uses **5 days**, so a newly reported domain may not be seen in the interim. MetaMask data originates from its upstream providers, including [eth-phishing-detect](https://github.com/MetaMask/eth-phishing-detect) and contributors. Its [repository license notice](https://github.com/MetaMask/eth-phishing-detect/blob/main/LICENSE) credits Copyright (C) 2018 kumavis; no endorsement or rights to the API beyond its applicable terms are implied.

## Background consumer API

Import `checkPhishingOrigin` from `@fluent-wallet/wallet_refetch-phishing-list/list-cache.js`. `await checkPhishingOrigin(origin, getLocked, pendingSignal?)` returns `{verdict, rechecked}` without waiting on remote detection. `getLocked` must be the live wallet lock getter; the origin must come from the extension transport, not DApp input.

Allowlist exceptions precede blocklist matches across both sources. `blocklisted` is the only warning; `allowlisted` and `no-match` are not safety guarantees. Without both sources an unmatched origin returns `unknown`, but a known match is usable. Match exact hosts and DNS-label subdomains; do not broaden paths, fuzzy rules or CIDs into domain blocks.

`rechecked` resolves to another verdict for the same origin if the verified lists changed during the refresh, otherwise `null`. For a pending request, pass a request-scoped `AbortSignal` to wait for the next change, even if another request triggered it. Abort on dismissal, relock, replacement or execution. Never trigger a business action from a recheck.
