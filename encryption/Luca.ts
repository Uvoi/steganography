import { binaryToString, stringToBinary } from "../functions/code";
import { fromBase62, getKey, parseKey, toBase62 } from "../functions/keys";
import { legendreSymbol } from "../functions/legendre_nums";
import { generatePrime } from "../functions/simple_nums";


function getL(P: bigint, Q: bigint, k: bigint, N: bigint): bigint {
    if (k === 0n) return 2n % N;
    if (k === 1n) return P % N;
    const cache: Map<bigint, bigint> = new Map();
    function lucasHelper(n: bigint): bigint {
        if (cache.has(n)) {
            return cache.get(n)!;
        }

        var result
        
        if (n === 0n) return 2n % N;
        if (n === 1n) return P % N; 

        if (n % 2n === 0n)
        {
            let Vn =lucasHelper(n/2n)
            cache.set(n/2n, Vn)
            let Vn2= Vn*Vn;
            // console.log("Vn2=",Vn2," n: ",n)
            let res = Vn2 - 2n
            // console.log("res:", res," n: ",n)
            result = res % N
        }
        else
        {
            let half = n/2n
            // console.log(half,"-",n, "    ", half+half+1n==n)
            let Vn = lucasHelper(half+1n);
            cache.set(half+1n, Vn)
            // console.log("Vn=",Vn," n: ",n)
            let Vm = lucasHelper(half);
            cache.set(half,Vm)
            // console.log("Vm=",Vm," n: ",n)
            let Vn_m = P%N;
            // cache.set(half, Vn_m)
            // console.log("Vn-m=",Vn_m," n: ",n)
            let res = Vn * Vm - Vn_m
            // console.log("res "," else ", res," n: ",n)
            result = (res % N)
        }

        cache.set(n, result)
        return result
    }
  
    const V  = lucasHelper(k);
    return V;
  }
  

// Расширенный алгоритм Евклида для нахождения обратного элемента
function extendedGCD(a: bigint, b: bigint) {
    let old_r = a, r = b;
    let old_s = BigInt(1), s = BigInt(0);
    let old_t = BigInt(0), t = BigInt(1);

    while (r !== BigInt(0)) {
        const quotient = old_r / r;

        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
        [old_t, t] = [t, old_t - quotient * t];
    }

    return { gcd: old_r, s: old_s, t: old_t };
}

// Нахождение обратного элемента по модулю
function modInverse(e: bigint, fi_n: bigint): bigint {
    const { gcd, s } = extendedGCD(e, fi_n);

    if (gcd !== BigInt(1)) {
        throw new Error(`Обратный элемент для ${e} по модулю ${fi_n} не существует`);
    }

    return (s % fi_n + fi_n) % fi_n;
}

// НОК для BigInt
function lcm(a: bigint, b: bigint): bigint {
    return (a * b) / gcd(a, b);
}

// НОД для BigInt
function gcd(a: bigint, b: bigint): bigint {
    while (b !== BigInt(0)) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Поиск числа, взаимно простого с заданным
async function findCoprime(y: bigint): Promise<bigint> {
    let x = await generatePrime(Math.floor(Math.random() * (256 - 128 + 1)) + 128);
    while (gcd(x, y) !== BigInt(1)) {
        x+=2n;
    }
    return x;
}


export async function encryptLuca(
    text: string,
    pubKey?: string
  ): Promise<{
    eMessage: string;
    pubKey?: string;
    privKey?: string;
  }>
{
    let binMessage = stringToBinary(text);
    console.log(binMessage,"\n--bin")
    let decMessage = BigInt("0b" + binMessage);
    console.log(decMessage,"\n--decm")
    const P = decMessage  // Сообщение как BigInt
    const Q = BigInt(1);  // Параметр последовательности Люка

    let e = 0n;
    let N = 0n;
    let privKey

    if (pubKey)
    {
        e = parseKey(pubKey).e
        N = parseKey(pubKey).N
    }
    else
    {

        const p = await generatePrime(1024);
        const q = await generatePrime(1024);

        // console.log(p,"--p");
        // console.log(q,"--q");
        N = p * q;      
        // console.log(N, "--N");


        e = await findCoprime((p-1n)*(q-1n)*(p+1n)*(q+1n));
        // console.log("e(",(p-1n)*(q-1n)*(p+1n)*(q+1n),")")
        // console.log(e.toString(), "--e");

        let D = P*P-4n

        let S = lcm((p-BigInt(legendreSymbol(D,p))),(q-BigInt(legendreSymbol(D,q))))
        // console.log(S.toString(), "--S");

        const d = modInverse(e, S);
        // console.log(d.toString(), "--d");

        pubKey = getKey({'e':e},{'N':N});
        privKey = getKey({'d':d},{'N':N})

        console.log(pubKey,"\n",privKey)
    }

    const C = getL(P, Q, e, N);
    const C62 = toBase62(C)
    // console.log(C, "\nC")
    // console.log(C.toString(2),"\n--CBin");
    // console.log(toBase62(C), "C62")
    return {eMessage:C62,pubKey:pubKey,privKey:privKey}
}


export function decryptLuca(encryptedText: string, key: string) {
    // console.log("enctext: ", encryptedText)
    let decEnryptedMessage = fromBase62(encryptedText)
    // console.log("dec:\n", decEnryptedMessage)
    const P = BigInt(decEnryptedMessage);
    const Q = BigInt(1);


    let d = parseKey(key).d
    let N = parseKey(key).N


    
    const M = getL(P, Q, d, N) // Расшифрование
    // console.log(M.toString(), "--M  ");
    let encryptedMessage = M.toString(2).padStart(Math.ceil(M.toString(2).length / 8) * 8, '0');
    // console.log( binaryToString(encryptedMessage), "\nstrM")

    return binaryToString(encryptedMessage)
}

export const placeholderLucaLoad = "Введите private ключ";
export const placeholderLucaCreatePriv = "Здесь будет private key";
export const placeholderLucaCreatePub = "Введите public key";
export const descriptionLuca = "Ассимметричный шифр требующий public key. В случае не заполнения генерируется случайный.";
