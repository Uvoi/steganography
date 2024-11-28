import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export function encryptChaCha20(text: string, key: string, nonce: string): string {
    // Проверяем длину ключа и nonce, если нужно — конвертируем в base64
    if (key.length === 32) 
        key = naclUtil.encodeBase64(naclUtil.decodeUTF8(key));
    if (nonce.length === 24) 
        nonce = naclUtil.encodeBase64(naclUtil.decodeUTF8(nonce));

    // console.log('nonce\n', nonce, '\nkey\n', key);

    const keyUint8 = naclUtil.decodeBase64(key);
    const nonceUint8 = naclUtil.decodeBase64(nonce);

    const messageUint8 = naclUtil.decodeUTF8(text);
    const encryptedMessage = nacl.secretbox(messageUint8, nonceUint8, keyUint8);

    // console.log(naclUtil.encodeBase64(encryptedMessage));

    return naclUtil.encodeBase64(encryptedMessage);
}

export function decryptChaCha20(encryptedText: string, key: string, nonce: string): string {
    if (key.length === 32) 
        key = naclUtil.encodeBase64(naclUtil.decodeUTF8(key));
    if (nonce.length === 24) 
        nonce = naclUtil.encodeBase64(naclUtil.decodeUTF8(nonce));

    // console.log('nonce\n', nonce, nonce.length, '\nkey\n', key, key.length);

    const keyUint8 = naclUtil.decodeBase64(key);
    const nonceUint8 = naclUtil.decodeBase64(nonce);
    const encryptedMessageUint8 = naclUtil.decodeBase64(encryptedText);

    const decryptedMessage = nacl.secretbox.open(encryptedMessageUint8, nonceUint8, keyUint8);

    if (!decryptedMessage) {
        throw new Error("Ошибка расшифрования: неверный ключ или nonce");
    }

    return naclUtil.encodeUTF8(decryptedMessage);
}

export function getKey(textKey: string): string {
    if (textKey.length === 32) {
        return textKey;
    } else {
        return naclUtil.encodeBase64(nacl.randomBytes(32));
    }
}

export function getNonce(textNonce: string): string {
    if (textNonce.length === 24) {
        return textNonce;
    } else {
        return naclUtil.encodeBase64(nacl.randomBytes(24));
    }
}

export const placeholderChaCha20Load = "Введите ChaCha20 ключ";
export const placeholderChaCha20Create = "ChaCha20 ключ";
export const placeholderChaCha20LoadN = "Введите ChaCha20 nonce";
export const placeholderChaCha20CreateN = "ChaCha20 nonce";
export const descriptionChaCha20 = "Симметричный шифр требующий key(32 байта(символа)) и nonce(24 байта(символа)). В случае не заполнения заполняются случайными символами.";
