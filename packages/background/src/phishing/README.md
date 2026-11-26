# Fluent phishing domains (background only)

The wallet reads only the public [Fluent mirror](https://github.com/conflux-fans/phishing-detect). The mirror publishes both MetaMask domain lists as `domains.json` and a small `source.json` stamp containing the upstream revision, input/ license hashes, counts and SHA-256 of the exact published bytes. The wallet never sends visited URLs. There is no bundled list, timer, alarm permission, per-site override, UI or RPC enforcement in this change.

**Data attribution:** The lists originate from [MetaMask eth-phishing-detect and its contributors](https://github.com/MetaMask/eth-phishing-detect). The [upstream license notice, preserved by the Fluent mirror](https://github.com/conflux-fans/phishing-detect/blob/main/LICENSE-MetaMask.txt), reads “Copyright (C) 2018 kumavis” (DON’T BE A DICK PUBLIC LICENSE v1.2). Fluent publishes normalized, deduplicated host-only data and its checksums; it does not claim authorship of the lists or endorsement by MetaMask.

## When does the wallet go online?

- `wallet_afterUnlock` calls the internal `wallet_refetchPhishingList` RPC alongside the normal token-list side effect. The RPC schedules the freshness check and immediately returns; it cannot be called by DApps and does not wrap the unlock handler. While still unlocked, the next request that needs a domain verdict also checks freshness. No activity means no network request, even after six hours. A live `getLocked` getter gates networking; do not pass a DApp-supplied flag.
- If a validated local copy was checked successfully less than six hours ago, use it without contacting the mirror. When due, fetch only the stamp. Same hash: persist the new successful check time, not the full list. Different hash (or first use): fetch the list, verify SHA-256, schema and counts, then store the list and metadata in one write before activating it. Concurrent requests share the refresh.
- An offline, incomplete, invalid or mismatched response, or a failed write, keeps the previous list and success time. A one-minute in-memory retry delay prevents repeated checks during an outage. Without any usable local list the verdict is `unknown`, not `no-match`.

## Pending requests (consumer contract)

`await checkPhishingOrigin(origin, getLocked)` returns `{verdict, rechecked}`. `verdict` is the local result; it never waits for the server. `rechecked` resolves to a second verdict for **the same origin** only if new verified rules were installed while unlocked, otherwise `null`. For a still-pending confirmation, pass a request-scoped `AbortSignal` as the optional third argument: the second verdict then waits for the next verified publication, including one triggered by another lookup. Abort on dismissal, lock, request replacement or execution to release the listener and resolve it to `null`. This adds no polling. Bind the result to that request ID and origin. Do not trigger a business action from a recheck.

`blocklisted` is the only domain-warning result; `allowlisted` and `no-match` do not certify site safety. Match whole DNS labels (including subdomains), normalize IDNs and trailing dots, and give upstream allowlisted hosts precedence. Path-only entries are not broadened to a shared host; fuzzy and CID matching are outside this version.
