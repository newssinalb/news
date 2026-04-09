/**
 * ─────────────────────────────────────────────────────────────────
 *  CRYPTOGRAPHIC URL slug encoder/decoder for news post IDs
 * ─────────────────────────────────────────────────────────────────
 *
 *  Algorithm (3-layer cipher):
 *
 *   ENCODE
 *    1. Cast the numeric ID to a 64-bit BigInt.
 *    2. Multiply by MULT (Knuth's 64-bit LCG constant) mod 2^64.
 *       → Produces output that looks completely random; sequential IDs
 *         map to wildly different outputs (avalanche effect).
 *    3. XOR with a secret 64-bit mask → second independent scramble layer.
 *    4. Split 64-bit result into two 32-bit halves (hi / lo).
 *    5. Custom base-32 encode each half using a shuffled, consonant-only
 *       alphabet (no vowels, no ambiguous chars 0/O 1/I/l).
 *       7 chars × 2 halves + 1 dash separator = 15-char slug.
 *
 *   DECODE — all steps in exact reverse:
 *    5. Decode each 7-char chunk back to a 32-bit BigInt.
 *    4. Reassemble the 64-bit number.
 *    3. XOR with the same mask.
 *    2. Multiply by MULT_INV (modular inverse of MULT mod 2^64) to undo step 2.
 *    1. Convert BigInt back to the original ID string.
 *
 *  Example slugs:
 *    encodeId(1)      → "c8Fg2rs-ctrw3y6"
 *    encodeId(18)     → "3zf8tjv-c2svbhk"
 *    encodeId(1234)   → "2BhCB53-3drjCrk"
 *    encodeId(99999)  → "2zrjt3t-cwr3Drv"
 *
 *  Properties:
 *    ✔ Bijective: every ID maps to exactly one unique slug (no collisions)
 *    ✔ Reversible: decodeId(encodeId(id)) === String(id), always
 *    ✔ Deterministic: same ID always produces the same slug (works with ISR caching)
 *    ✔ No external dependencies — pure JS; BigInt is baseline 2020
 *    ✔ Works identically in Node 14+ and all modern browsers
 *
 * ─────────────────────────────────────────────────────────────────
 */

// ── Cipher constants ───────────────────────────────────────────────

/** Knuth's multiplicative hash constant (odd, good avalanche for 64-bit) */
const MULT = 6364136223846793005n;

/** 2^64 — our working modulus */
const MOD = 0x10000000000000000n;

/** Secret XOR mask — second scramble layer on top of the multiplication */
const XOR_MASK = 0xc3a5f2b8e1d97064n;

/** 32-bit mask */
const U32 = 0xffffffffn;

// ── Modular inverse via Newton's method ───────────────────────────
// For any odd a, x_{n+1} = x_n * (2 - a * x_n) mod 2^64 converges
// to the unique inverse after 64 iterations (overkill, 6 suffice for 64-bit).
function _modInv64(a) {
  let inv = 1n;
  for (let i = 0; i < 64; i++) {
    inv = (inv * (2n - a * inv)) & (MOD - 1n);
  }
  return inv;
}

/** Modular inverse of MULT — used to reverse step 2 in decryption */
const MULT_INV = _modInv64(MULT);

// ── Custom alphabet ────────────────────────────────────────────────
// 32 characters: no vowels (a e i o u), no ambiguous pairs (0/O, 1/l/I)
// Shuffled to break any remaining visual patterns in the slug
const TABLE = 'b2c3d4f5g6h7j8k9mnpqrstvwxyzBCDF'; // exactly 32 chars

// ── Internal: encode/decode a 32-bit value as 7 base-32 chars ─────
// 7 chars × 5 bits = 35 bits; the top 3 bits are always 0 for 32-bit values.

function _encU32(n) {
  let v = n & U32; // clamp to 32 bits
  let out = '';
  for (let i = 0; i < 7; i++) {
    out = TABLE[Number(v & 31n)] + out;
    v >>= 5n;
  }
  return out;
}

function _decU32(s) {
  let v = 0n;
  for (let i = 0; i < 7; i++) {
    const idx = TABLE.indexOf(s[i]);
    if (idx === -1) return null; // invalid character
    v = (v << 5n) | BigInt(idx);
  }
  return v & U32; // mask to 32 bits
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Encode a numeric post ID to a 15-character opaque URL slug.
 *
 * @param {number|string} id — The numeric post ID from the database.
 * @returns {string} — e.g. "c8Fg2rs-ctrw3y6"
 */
export function encodeId(id) {
  try {
    const n = BigInt(id);
    // Layer 1: multiplicative 64-bit cipher
    // Layer 2: XOR mask
    const ciphered = ((n * MULT) & (MOD - 1n)) ^ XOR_MASK;
    // Split into two 32-bit halves and encode each
    const hi = (ciphered >> 32n) & U32;
    const lo = ciphered & U32;
    return `${_encU32(hi)}-${_encU32(lo)}`;
  } catch {
    return String(id); // fallback — should never occur for valid IDs
  }
}

/**
 * Decode a slug back to the original post ID string.
 *
 * @param {string} slug — e.g. "c8Fg2rs-ctrw3y6"
 * @returns {string|null} — The original ID, or null if the slug is invalid.
 */
export function decodeId(slug) {
  try {
    const parts = slug.split('-');
    if (parts.length !== 2 || parts[0].length !== 7 || parts[1].length !== 7) {
      return null;
    }
    const hi = _decU32(parts[0]);
    const lo = _decU32(parts[1]);
    if (hi === null || lo === null) return null;

    // Reassemble 64-bit value
    const ciphered = ((hi << 32n) | lo) & (MOD - 1n);
    // Reverse layer 2 (XOR is its own inverse)
    // Reverse layer 1 (multiply by modular inverse)
    const n = ((ciphered ^ XOR_MASK) * MULT_INV) & (MOD - 1n);
    return n.toString();
  } catch {
    return null;
  }
}
