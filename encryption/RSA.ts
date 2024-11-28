import JSEncrypt from 'jsencrypt';

function cleanRsaKey(key: string) {
    return key.replace(
        /(-----BEGIN RSA PRIVATE KEY-----)([\s\S]*?)(-----END RSA PRIVATE KEY-----)/,
        (match, begin, content, end) => begin + content.replace(/\s+/g, '') + end
    );
}

function cleanRsaPKey(key: string) {
    return key.replace(
        /(-----BEGIN RSA PUBLIC KEY-----)([\s\S]*?)(-----END RSA PUBLIC KEY-----)/,
        (match, begin, content, end) => begin + content.replace(/\s+/g, '') + end
    );
}

function isValidKey(key: string, type: 'public' | 'private'): boolean {
    if (type === 'public') {
        return key.includes('PUBLIC KEY');
    } else {
        return key.includes('PRIVATE KEY');
    }
}

export function encryptRSA(message: string, publicKey?: string) {
    const encryptor = new JSEncrypt();

    let generatedPublicKey = null;
    let privateKey = null;

    if (publicKey) {
        const cleanedPublicKey = cleanRsaPKey(publicKey);
        if (!isValidKey(cleanedPublicKey, 'public')) {
            throw new Error("Invalid public key provided");
        }
        encryptor.setPublicKey(cleanedPublicKey);
    } else {
        encryptor.getKey();
        generatedPublicKey = encryptor.getPublicKey();
        privateKey = encryptor.getPrivateKey();
        encryptor.setPublicKey(generatedPublicKey);
    }

    const encryptedMessage = encryptor.encrypt(message);

    if (!encryptedMessage) {
        throw new Error("Encryption failed");
    }

    if (publicKey) {
        return {
            encryptedMessage,
            publicKey: publicKey ? publicKey : generatedPublicKey,
        };
    }

    return {
        encryptedMessage,
        publicKey: generatedPublicKey,
        privateKey,
    };
}

export function decryptRSA(encryptedMessage: string, privateKey: string) {
    const decryptor = new JSEncrypt();

    const cleanedPrivateKey = cleanRsaKey(privateKey);
    if (!isValidKey(cleanedPrivateKey, 'private')) {
        throw new Error("Invalid private key provided");
    }

    decryptor.setPrivateKey(cleanedPrivateKey);
    const decryptedMessage = decryptor.decrypt(encryptedMessage);

    if (!decryptedMessage) {
        throw new Error("Decryption failed");
    }

    return decryptedMessage;
}

export const placeholderRSALoad = "Введите RSA key";
export const placeholderRSACreate = "Тут будет RSA ключ";
export const placeholderRSACreatePK = "Введите public key если есть";
