// Deterministic pseudo-random generator from a string seed
export function hashStringToInt(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h >>> 0;
}

export function seededRandom(seedStr, idx = 0) {
  const seed = hashStringToInt(seedStr + '|' + idx);
  // xorshift32
  let x = seed || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // Normalize to [0,1)
  return (x >>> 0) / 4294967296;
}
