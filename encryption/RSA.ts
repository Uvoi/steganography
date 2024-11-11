import JSEncrypt from 'jsencrypt';

export function encryptMessage(message: string) {
    const encryptor = new JSEncrypt();
    encryptor.getKey();

    const publicKey = encryptor.getPublicKey();
    const privateKey = encryptor.getPrivateKey();

    encryptor.setPublicKey(publicKey);
    const encryptedMessage = encryptor.encrypt(message);

    return { encryptedMessage, privateKey };
}

export function decryptMessage(encryptedMessage: string, privateKey: string) {
    const decryptor = new JSEncrypt();
    
    decryptor.setPrivateKey(privateKey);
    const decryptedMessage = decryptor.decrypt(encryptedMessage);

    return decryptedMessage;
}

export function cleanRsaKey(key: string) {
    return key.replace(
        /(-----BEGIN RSA PRIVATE KEY-----)([\s\S]*?)(-----END RSA PRIVATE KEY-----)/,
        (match, begin, content, end) => begin + content.replace(/\s+/g, '') + end
    );
}


export const placeholderRSALoad = "Введите RSA key"
export const placeholderRSACreate = "Тут будет RSA ключ"