
// Вычисляет символ Лежандра (a/p).
export function legendreSymbol(a: bigint, p: bigint): number {
    if (p <= 2n || p % 2n === 0n) {
        throw new Error("p должно быть нечётным простым числом больше 2.");
    }

    // Вычисляем a mod p
    let aModP = a % p;
    if (aModP < 0n) {
        aModP += p;
    }

    if (aModP === 0n) {
        return 0;
    }

    // Используем критерий Эйлера: (a/p) ≡ a^((p-1)/2) mod p
    const exponent = (p - 1n) / 2n;
    const result = modPow(aModP, exponent, p);

    if (result === 1n) {
        return 1;
    } else if (result === p - 1n) {
        return -1;
    } else {
        throw new Error("Непредвиденный результат вычисления символа Лежандра.");
    }
}

// Быстрое возведение в степень по модулю.
 
function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    let baseMod = base % modulus;
    let exp = exponent;

    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * baseMod) % modulus;
        }
        exp = exp / 2n;
        baseMod = (baseMod * baseMod) % modulus;
    }

    return result;
}