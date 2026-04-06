// RND() - returns next pseudo-random number in sequence, 0 <= r < 1
// Simple linear congruential generator for reproducibility
let rndSeed = Date.now() % 2147483647;

export default function rnd(args) {
    // Simple LCG: X_{n+1} = (a * X_n + c) mod m
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296;

    rndSeed = (a * rndSeed + c) % m;
    return rndSeed / m;
}

// Export a reset function for testing purposes
export function resetRndSeed(seed) {
    rndSeed = seed;
}
