import * as bigintCryptoUtils from 'bigint-crypto-utils';

export async function generatePrime(bits: number): Promise<bigint> {
    return await bigintCryptoUtils.prime(bits);
}
