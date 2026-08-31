import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const FETCH_TIMEOUT_MS = 15000;

/**
 * Reference values the validator checks against. Treat every change here as security-critical.
 *
 * Updated on each new release / IPFS upload — must match the values published in README.md:
 *   - EXPECTED_INDEX_HTML_SHA384 — SHA-384 of the whole index.html
 *   - IPFS_URL                   — pinned link to the published index.html
 *
 * Pinned — must NOT change (only touch if the upstream source itself moves):
 *   - EXPECTED_ETHERS_SHA384 — SHA-384 of the embedded ethers <script> block (byte-for-byte the pinned upstream)
 *   - ETHERS_UPSTREAM_URL    — permalink to the exact ethers.umd.min.js commit we embed
 *   - LOCAL_HTML_PATH        — path to the local index.html in this repo
 */

const EXPECTED_INDEX_HTML_SHA384 = 'XIvxYg70gXTO1PqMHCOhgzL+OKOmXjfKRPEvbmm6WCgvGJ93dYjF3SPcFVVuQ3/c';
const IPFS_URL = 'https://lido.mypinata.cloud/ipfs/QmR8fM8vf9y6EG8YesQREYA1MPX64pbzEJwaJ1XDfifNxc';

// Never change these vars unless the Ethers version is changed.
const EXPECTED_ETHERS_SHA384 = 'NRAZj94DQk3dgtsOZzVYHbYVV1DFkF5QhL5RRxF0ILZLi6OQ7CsMlun748D42JbO';
const ETHERS_UPSTREAM_URL = 'https://raw.githubusercontent.com/ethers-io/ethers.js/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js';

// Resolved relative to this script (not the current working directory) so the
// validator works no matter where `node validate.mjs` is invoked from.
const LOCAL_HTML_PATH = new URL('./index.html', import.meta.url);


function sha384(buffer) {
    return createHash('sha384').update(buffer).digest('base64');
}

function extractEthersBlock(html) {
    const openTag = '<script>';
    const closeTag = '</script>';

    const start = html.indexOf(openTag);
    if (start === -1) {
        throw new Error('ethers <script> block not found in HTML');
    }

    const contentStart = start + openTag.length;
    const end = html.indexOf(closeTag, contentStart);
    if (end === -1) {
        throw new Error('unterminated <script> block in HTML');
    }

    // trim() drops the HTML indentation around the <script> content so the block
    // hashes to the same value as the raw upstream ethers.umd.min.js file.
    return html.slice(contentStart, end).trim();
}

// Failures (network, non-2xx, timeout) throw, surfacing as operational errors —
// they must never be mistaken for a hash mismatch.
async function fetchBuffer(url) {
    let response;
    try {
        response = await fetch(url, {signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)});
    } catch (error) {
        const reason = error.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS} ms` : error.message;
        throw new Error(`fetch failed (${reason}) for ${url}`);
    }
    if (!response.ok) {
        throw new Error(`fetch failed (HTTP ${response.status}) for ${url}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

function compare(name, actual, expected) {
    return {name, ok: actual === expected, expected, actual};
}

// Checks any index.html bytes against the expected hash; the caller resolves the
// source (repo copy, IPFS, or --file) and passes a label for the report.
function checkIndexHtml(buffer, source) {
    return compare(`index.html (${source})`, sha384(buffer), EXPECTED_INDEX_HTML_SHA384);
}

function checkEthersBlock(htmlText) {
    const block = extractEthersBlock(htmlText);
    return compare('embedded ethers block', sha384(Buffer.from(block, 'utf8')), EXPECTED_ETHERS_SHA384);
}

// Proves the embedded copy is unmodified by matching it against the upstream file.
async function checkEthersUpstream() {
    const buffer = await fetchBuffer(ETHERS_UPSTREAM_URL);
    return compare('upstream ethers.umd.min.js', sha384(buffer), EXPECTED_ETHERS_SHA384);
}

function parseArgs(argv) {
    const args = {file: null};
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg === '--file') {
            args.file = argv[++index];
            if (!args.file) {
                throw new Error('--file requires a path argument');
            }
        } else {
            throw new Error(`unknown argument: ${arg}`);
        }
    }
    return args;
}

function report(results) {
    console.log('Safe-tx-hashes validator\n');
    for (const result of results) {
        console.log(`[${result.ok ? 'PASS' : 'FAIL'}] ${result.name}`);
        if (result.ok) {
            console.log(`       ${result.actual}`);
        } else {
            console.log(`       expected: ${result.expected}`);
            console.log(`       actual:   ${result.actual}`);
        }
    }
    console.log('');
    const allPassed = results.every((result) => result.ok);
    console.log(allPassed ? 'RESULT: all checks passed' : 'RESULT: MISMATCH DETECTED');
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    const localBuffer = readFileSync(LOCAL_HTML_PATH);
    const localText = localBuffer.toString('utf8');

    const publishedBuffer = args.file ? readFileSync(args.file) : await fetchBuffer(IPFS_URL);
    const publishedSource = args.file ? `local file ${args.file}` : 'IPFS';

    const results = [
        checkIndexHtml(localBuffer, 'repo'),
        checkEthersBlock(localText),
        checkIndexHtml(publishedBuffer, publishedSource),
        await checkEthersUpstream(),
    ];

    report(results);
    return results.every((result) => result.ok) ? 0 : 1;
}

try {
    // exit 0 = all matched, 1 = hash mismatch (possible tampering),
    // 2 = operational error (network, missing file, unparseable HTML).
    process.exit(await main());
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`validate: ${message}`);
    process.exit(2);
}
