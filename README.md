# dnscrypt-proxy blacklist generator

This is a simple utility script that helps with creating blacklists for the
[dnscrypt-proxy](https://github.com/DNSCrypt/dnscrypt-proxy). It'll read different
blacklists and merge them together, optimizing it on the way.

For details see below.

## Install

Just download the *src/* folder, and create your own config file. You don't need
any npm-modules, it's completely selfcontaining.

Afterwards you can use it like:

```sh
node src/index.js config.json
```

## Merge-optimizations

Different lists contain sometimes the same URLs, so first of all the URLs are deduplicated.
Deduplication is not only taking same URLs into account, but using assumptions as well.

Dnscrypt-proxy interprets patterns like `example.com` as `*.example.com`, so when the lists
have entries for `www.example.com` and `example.com`, we don't need the first one, as the
second one covers the first URL as well. Because we know that, the script willonly output
`example.com`, no other subdomains. The script won't deduce `example.com` from `www.example.com`,
so `example.com` has to be explicitly present in the list.

Additionally, this script will evaluate urls, whether they are actually usable as pattern.
Some lists contain invalid urls or even sub-paths to urls, which are not useable as DNS patterns.
So stuff like `example.com/ads` and `example com` is removed.
