# Fluent phishing domains (background only)

The wallet reads only the public [Fluent mirror](https://github.com/conflux-fans/phishing-detect). The mirror publishes both MetaMask domain lists as `domains.json` and a small `source.json` stamp containing the upstream revision, input/ license hashes, counts and SHA-256 of the exact published bytes. The wallet never sends visited URLs. There is no bundled list, timer, alarm permission, per-site override, UI or RPC enforcement in this change.

## When does the wallet go online?

- Unlock starts a non-blocking freshness check. While still unlocked, the next request that needs a domain verdict also checks freshness. No activity means no network request, even after six hours. A live `getLocked` getter gates networking; do not pass a DApp-supplied flag.
- If a validated local copy was checked successfully less than six hours ago, use it without contacting the mirror. When due, fetch only the stamp. Same hash: persist the new successful check time, not the full list. Different hash (or first use): fetch the list, verify SHA-256, schema and counts, then store the list and metadata in one write before activating it. Concurrent requests share the refresh.
- An offline, incomplete, invalid or mismatched response, or a failed write, keeps the previous list and success time. A one-minute in-memory retry delay prevents repeated checks during an outage. Without any usable local list the verdict is `unknown`, not `no-match`.

## Pending requests (consumer contract)

`await checkPhishingOrigin(origin, getLocked)` returns `{verdict, rechecked}`. `verdict` is the local result; it never waits for the server. `rechecked` resolves to a second verdict for **the same origin** only if new verified rules were installed while unlocked, otherwise `null`. A future confirmation UI must bind the second result to the original pending request ID/origin and ignore it if dismissed, replaced or already executed. Do not trigger a business action from a recheck.

`blocklisted` is the only domain-warning result; `allowlisted` and `no-match` do not certify site safety. Match whole DNS labels (including subdomains), normalize IDNs and trailing dots, and give upstream allowlisted hosts precedence. Path-only entries are not broadened to a shared host; fuzzy and CID matching are outside this version.
