# safe-tx-hashes-ui

![Screenshot 2025-03-07 at 17 47 31](https://github.com/user-attachments/assets/ae863272-c106-4b05-a474-44460f4be199)

A simple tool for offline generation of Safe tx hashes

> [!WARNING]  
> This repository contains a copy of `ethers.umd.min.js`  
> The code was taken from the official `ehters.js` v6 repo ([permalink](https://github.com/ethers-io/ethers.js/blob/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js)) and is used in index.html inside a `<script>` tag  
> The decision was made to use this ethers file as is, but the validation is required, see the "App validation" section below 

> [!NOTE]
> We suggest opening the app in a "clean" browser with no external extensions installed and no other tabs open, to avoid external tools affecting the data  


## Validated hashes and links 
> [!IMPORTANT]  
> Use these hashes to compare to the ones we get from terminal or online tools for `index.html` and the `ethers.js` code inside the `<script>` tag

- `index.html` sha-384 (base-64) => `cWS8oiufJgkR9TBg/Ikyj40c9XCitKFcDRB7oQ1JRTEvJEoAmfSc8z7XHXynK0Yx`
- Ethers code from the `<script>` tag sha-384 (base-64) => `NRAZj94DQk3dgtsOZzVYHbYVV1DFkF5QhL5RRxF0ILZLi6OQ7CsMlun748D42JbO`  
- IPFS link => https://lido.mypinata.cloud/ipfs/QmS2LusBvxVcykeLsA3umeWMrwtni9bPSTC9Lc4NbAaW1V
- `ethers.umd.min.js` raw file link => https://raw.githubusercontent.com/ethers-io/ethers.js/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js

> [!NOTE]
> These values mirror the constants hardcoded at the top of [`validate.mjs`](./validate.mjs) — `EXPECTED_INDEX_HTML_SHA384`, `EXPECTED_ETHERS_SHA384`, `IPFS_URL` and `ETHERS_UPSTREAM_URL` — which is the source of truth used by the automated validator (see the "App validation" section). Whenever any of them changes (a new release or IPFS upload), update both this section and `validate.mjs` together so they stay in sync.


## Usage

1. Clone the repo

2. Open `index.html` file in your browser

3. Enter the tx details into the form

4. Press "Generate hashes" button to generate hashes

5. Compare generated hashes with ones in your hardware wallet

## App validation

For this app to be used with IPFS, we prepared a standalone index.html file including the `ethers.umd.min.js` code from
the [official repo](https://github.com/ethers-io/ethers.js/blob/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js)

As we take the external file code from the Ethers repo and use it as is, we need to be sure that neither the IPFS version of the `index.html` file nor the ethers code inside the `<script>` tag were modified.

### Validate with the bundled Node script

The repo ships a dependency-free validator, [`validate.mjs`](./validate.mjs), that performs the whole check for you. It only needs Node.js (>= 18, for the built-in `fetch`) — there is no `npm install` and no packages to trust; hashing is done in-process with the built-in `node:crypto`.

Run every check at once:

```
node validate.mjs
```

This verifies four things against the expected hashes from the "Validated hashes" section above:

1. the local `index.html` in this repo;
2. the `ethers.js` `<script>` block embedded inside that `index.html`;
3. the `index.html` published on IPFS (downloaded automatically from the pinned link);
4. the upstream `ethers.umd.min.js` from the official Ethers repo (downloaded automatically), proving the embedded copy is the unmodified upstream file.

To check a copy you downloaded yourself — e.g. the `index.html` you saved from an IPFS gateway — instead of letting the script fetch it, pass the path and it is used in place of the IPFS download (checks 1, 2 and 4 still run):

```
node validate.mjs --file ./path/to/index.html
```

The script prints a `PASS`/`FAIL` line per check and exits with: `0` — everything matches; `1` — a hash mismatch (possible tampering); `2` — an operational error (network failure, missing file, unparseable HTML). A tampered file is never reported as a match.

> [!NOTE]
> The expected hashes and links are hardcoded as constants at the top of `validate.mjs` and are mirrored in the "Validated hashes" section above — the two must be kept in sync.
