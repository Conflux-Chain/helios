# @fluent-wallet/wallet_refetch-phishing-list

A shared background service for syncing domain lists and checking origins locally. `wallet_afterUnlock` triggers it through the thin `wallet_refetchPhishingList` RPC without waiting for HTTP. Background consumers can also explicitly request a due refresh while unlocked. Reading a cached verdict never starts a download. Refresh intervals are checked on these calls; they do not schedule periodic work. This package sends no browsing origins and does not enforce UI policy.

## Module boundaries

- [index.js](./index.js) declares the internal refresh RPC and delegates to the service in this package.
- [service.js](./service.js) owns active source state, coalesces refreshes, and publishes changes after persistence succeeds. Its public API separates cached queries, refreshes and subscriptions.
- [domain.js](./domain.js) parses hostname rules and decides verdicts. Each query parses its origin once, builds DNS candidates once, then checks Fluent before MetaMask and allowlist exceptions before blocks. It has no storage or network access.
- [metamask-list.js](./metamask-list.js) parses MetaMask snapshots and applies ordered diffs without changing the previous lists. It has no storage or network access.
- [fetch-list.js](./fetch-list.js) handles HTTP and conditional requests, adapting both sources to `{lists, cursor?, etag}`. It does not decide when to refresh.
- [storage.js](./storage.js) reads and writes source snapshots, mapping persisted arrays and metadata to the service's named state fields. It does not replace active state or emit events.

MetaMask state contains `lists`, `cursor`, `etag`, `lastFullCheckAt` and `lastDiffCheckAt`; Fluent state contains `lists`, `etag` and `lastCheckAt`. Successful check times, including HTTP 304, are distinct from content changes. Only the service replaces active state. A source's lists and cursor are saved in the same write before its new state is published. Load/refresh promises, subscriptions and failure backoff belong to the current worker lifetime.

## Two independent sources

| Source | When due | Data |
| --- | --- | --- |
| [MetaMask baseline](https://phishing-detection.api.cx.metamask.io/v1/stalelist) | First use, then every 30 days | Read `data.allowlist`, `data.blocklist` and `data.lastUpdated`. Send `If-None-Match` on later baseline checks if an ETag was supplied. |
| MetaMask hotlist | Immediately after a new baseline, then every 5 days | `GET /v2/diffsSince/<cursor>` on the same origin. The cursor starts at the baseline’s server timestamp **in seconds**. Apply newer `eth_phishing_detect_config.allowlist` and `.blocklist` additions/removals, not entries from other lists. Empty deltas update only freshness; never substitute the device clock for the cursor. |
| [Fluent config](https://github.com/conflux-fans/phishing-detect) | First use, then on demand at least 24 hours after the last successful check | Fetched via [jsDelivr](https://cdn.jsdelivr.net/gh/conflux-fans/phishing-detect@main/config.json): `whitelist` and `blacklist`; empty arrays are valid. Conditional fetch when an ETag is available. No mirror or automated upstream import. |

Internally both sources use `{allowlist: Set, blocklist: Set}`. Only the Fluent and storage boundaries translate `whitelist` and `blacklist` arrays into that shape. Both arrays must contain strings; unsupported rules such as paths and wildcards are ignored. Matching supports DNS names, IPv4 addresses and localhost. The wallet compares domain contents, not a version number, to decide whether to rewrite stored lists.

Sources are checked independently, and each committed list change notifies subscribers immediately without waiting for the other source or follow-up diffs. A failed download, invalid data or failed storage write does not replace the active lists. There is one active MetaMask list. A validated full response and its cursor are saved together and can be used even if the following delta fails. An older full list cannot roll back newer local changes. Retry the delta from the saved cursor rather than re-downloading the full list after a restart; there is no staging key. Refreshes are coalesced, with a short failure backoff. Cache loading must succeed before downloads start. A failed read skips that refresh and retries on the next call, keeping an unread stored baseline intact. Old versions of the Fluent mirror cache are not used as Fluent policy.

The [MetaMask controller](https://github.com/MetaMask/core/blob/652066081c3e20921cbe1e00b6e0a6fa02004159/packages/phishing-controller/src/PhishingController.ts#L84-L117) defaults to a 30-day baseline and **5-minute** hotlist; Fluent deliberately uses **5 days**, so a newly reported domain may not be seen in the interim. MetaMask data originates from its upstream providers, including [eth-phishing-detect](https://github.com/MetaMask/eth-phishing-detect) and contributors. Its [repository license notice](https://github.com/MetaMask/eth-phishing-detect/blob/main/LICENSE) credits Copyright (C) 2018 kumavis; no endorsement or rights to the API beyond its applicable terms are implied.

## Storage choice

The storage adapter uses the workspace's `webextension-polyfill`, imported lazily so loading RPC documentation in Node needs no extension context. It stores each list separately in `storage.local`, with its cursor/ETag in a metadata key. Both manifests already request `unlimitedStorage`. This is not `window.localStorage` (unavailable in a Manifest V3 service worker). No separate database is needed for these infrequent whole-list writes; a disk/write failure leaves the active list intact.

For comparison, MetaMask [restores the phishing controller from persisted state](https://github.com/MetaMask/metamask-extension/blob/e45da6d7c838e639b73263efa82e29fe4cd8ecbc/app/scripts/messenger-client-init/phishing-controller-init.ts#L18-L26). Its [ExtensionStore uses storage.local](https://github.com/MetaMask/metamask-extension/blob/e45da6d7c838e639b73263efa82e29fe4cd8ecbc/shared/lib/stores/extension-store.ts#L13-L21); its separate [StorageService selects a backend by browser](https://github.com/MetaMask/metamask-extension/blob/e45da6d7c838e639b73263efa82e29fe4cd8ecbc/app/scripts/wallet-init/instance-options/storage-service.ts#L10-L29).

## Background consumer API

Import these functions from `@fluent-wallet/wallet_refetch-phishing-list/service.js`:

- `await checkCachedOrigin(origin)` returns the cached verdict. It may restore extension storage, but never starts a network request.
- `await refreshIfDue(getLocked)` completes a due refresh. Feed and persistence failures are logged per request and keep the previous active lists. `getLocked` must be the live wallet lock getter. Callers that need change notifications subscribe instead of inspecting a refresh return value.
- `subscribeToListChanges(listener)` calls the listener for each committed list change and returns an unsubscribe function. It starts no refresh and does not check an origin on the consumer's behalf.

The origin must come from the extension transport, not DApp input.

Check Fluent first: a Fluent allow or block is final. Only if Fluent has no match or no cached list, consult MetaMask. Within each source, allowlist exceptions precede blocklist matches. `blocklisted` is the only warning; `allowlisted` and `no-match` are not safety guarantees. Without both sources an unmatched origin returns `unknown`, but a known match is usable. Match exact hosts and DNS-label subdomains; do not broaden paths, fuzzy rules or CIDs into domain blocks.

For a pending request, subscribe before the initial cached query, read the verdict again on changes, and explicitly trigger a due refresh. The consumer owns the request lifetime: unsubscribe on dismissal, relock, replacement or execution, and ignore any query that finishes after that request ends. Never trigger a business action from a list change.
