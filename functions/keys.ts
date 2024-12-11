const base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function toBase62(num:bigint) {
    const chars = base62Chars;
    let result = '';
    while (num > 0n) {
        result = chars[Number(num % 62n)] + result;
        num = num / 62n;
    }
    return result || '0';
}

export function fromBase62(str: string): bigint {
    const chars = base62Chars;
    const base = 62n;
    let result = 0n;

    for (let i = 0; i < str.length; i++) {
        const charValue = BigInt(chars.indexOf(str[i]));
        result = result * base + charValue;
    }

    return result;
}



export function getKey(...args:{[key:string]:bigint}[])
{
    let combinedNums = ""
    args.forEach((arg, index) => {
        const [key] = Object.keys(arg);
        const value = arg[key];
        let numBase62 = toBase62(value);
        const len = (numBase62.length).toString().padStart(3, '0');
        combinedNums+=len+key+numBase62;
    });
    return combinedNums
}

export function parseKey(key: string): {[key: string]: bigint} {
    let result: {[key: string]: bigint} = {};
    let index = 0;

    while (index < key.length) {
        const len = parseInt(key.slice(index, index + 3), 10); 
        index += 3;

        const paramName = key[index];
        index += 1;

        const numBase62 = key.slice(index, index + len);
        const numValue = fromBase62(numBase62);
        index += len;

        result[paramName] = numValue;
    }

    return result;
}
