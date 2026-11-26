# Fluent phishing domain lists (background only)

`checkPhishingOrigin(origin)` returns a local verdict for an HTTP(S) origin: `blocklisted`, `allowlisted`, `no-match`, or `unknown`. A match also contains `hostname` and `matchedDomain`. `no-match` is not a safety guarantee. Callers should supply the origin derived from the extension port, not a domain asserted by a DApp. No URL lookup, telemetry, DApp callback, confirmation UI or RPC interception is introduced here.

## Source and scope

Both lists come from the same [MetaMask eth-phishing-detect config](https://github.com/MetaMask/eth-phishing-detect/blob/main/src/config.json). For schema version 2 we consume `whitelist` and `blacklist`; the allowed host (or one of its subdomains) takes precedence. The candidate origin is parsed with `URL`, including IDNA handling. Matching is case-insensitive on whole DNS labels, not on substrings. This version does **not** implement fuzzy matching, URL/path rules, IPFS/CID matching or transaction/contract-address checks. Path entries are never broadened to their shared host. Localhost and IPv4 entries in the feed are supported as exact matches.

A future Fluent mirror could be published in [conflux-fans/phishing-detect](https://github.com/conflux-fans/phishing-detect); this version does not depend on a mirror or publish to it.

## Lifecycle

- Chrome/Edge MV3 and Firefox MV2 use the same background entry. A browser alarm starts after one minute and repeats every six hours. A worker restart re-registers the listener and only recreates the alarm if missing.
- Checks do not wait for a remote response. On first use, read the last valid pair from `storage.local`, otherwise load the packaged JSON asset. The data is not exposed as a web-accessible resource or bundled into popup/content-script JS.
- Updates use a fixed HTTPS URL, omit credentials/referrer, disallow redirects, time out after 30 seconds and cap decoded JSON at 12 MiB. Conditional requests use the last accepted ETag. A failed download, parse, validation or write retains the existing pair; both lists are persisted with the ETag in a single storage write before activating them. No persistent per-site whitelist.
- Validation rejects unsupported schema, non-string entries, oversized arrays, unusable lists, fewer than 50,000 unique blocked hosts / 20 allowed hosts, or a drop of more than half from the active list. These are sanity checks, **not** a signature or proof of feed authenticity. Review legitimate large upstream list changes before relaxing the limits.

## Rebuild the packaged snapshot

The bundled asset records the source commit and SHA-256 of its unmodified input. To reproduce it, run `node packages/background/src/phishing/update-snapshot.mjs <full-upstream-commit>` with Node 22 and curl. For the initial snapshot (`ef7ed0fdf7594ff3bb23479245f806083ee635da`) this retained 59 allowed and 119,089 blocked hosts, excluding 1,746 path-bearing block entries. The assets include MetaMask's original license, copyright and attribution. Keep both files together on redistribution. No remote scripts are loaded.
