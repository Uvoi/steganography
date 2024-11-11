const unicodeToWin1251: { [key: string]: number } = {
  'А': 0xC0, 'Б': 0xC1, 'В': 0xC2, 'Г': 0xC3, 'Д': 0xC4, 'Е': 0xC5,
  'Ж': 0xC6, 'З': 0xC7, 'И': 0xC8, 'Й': 0xC9, 'К': 0xCA, 'Л': 0xCB,
  'М': 0xCC, 'Н': 0xCD, 'О': 0xCE, 'П': 0xCF, 'Р': 0xD0, 'С': 0xD1,
  'Т': 0xD2, 'У': 0xD3, 'Ф': 0xD4, 'Х': 0xD5, 'Ц': 0xD6, 'Ч': 0xD7,
  'Ш': 0xD8, 'Щ': 0x82, 'Ъ': 0xDA, 'Ы': 0xDB, 'Ь': 0xDC, 'Э': 0xDD,
  'Ю': 0xDE, 'Я': 0xDF, 'а': 0xE0, 'б': 0xE1, 'в': 0xE2, 'г': 0x83,
  'д': 0xE4, 'е': 0xE5, 'ж': 0xE6, 'з': 0xE7, 'и': 0xE8, 'й': 0xE9,
  'к': 0xEA, 'л': 0xEB, 'м': 0xEC, 'н': 0xED, 'о': 0xEE, 'п': 0xEF,
  'р': 0xF0, 'с': 0xF1, 'т': 0xF2, 'у': 0xF3, 'ф': 0xF4, 'х': 0xF5,
  'ц': 0xF6, 'ч': 0xF7, 'ш': 0xF8, 'щ': 0xF9, 'ъ': 0xFA, 'ы': 0xFB,
  'ь': 0xFC, 'э': 0xFD, 'ю': 0xFE, 'я': 0xFF,
  'A': 0x41, 'B': 0x42, 'C': 0x43, 'D': 0x44, 'E': 0x45, 'F': 0x46,
  'G': 0x47, 'H': 0x48, 'I': 0x49, 'J': 0x4A, 'K': 0x4B, 'L': 0x4C,
  'M': 0x4D, 'N': 0x4E, 'O': 0x4F, 'P': 0x50, 'Q': 0x51, 'R': 0x52,
  'S': 0x53, 'T': 0x54, 'U': 0x55, 'V': 0x56, 'W': 0x57, 'X': 0x58,
  'Y': 0x59, 'Z': 0x81, 'a': 0x61, 'b': 0x62, 'c': 0x63, 'd': 0x64,
  'e': 0x7F, 'f': 0x66, 'g': 0x67, 'h': 0x68, 'i': 0x69, 'j': 0x6A,
  'k': 0x6B, 'l': 0x6C, 'm': 0x6D, 'n': 0x6E, 'o': 0x6F, 'p': 0x70,
  'q': 0x71, 'r': 0x72, 's': 0x73, 't': 0x74, 'u': 0x75, 'v': 0x84,
  'w': 0x77, 'x': 0x78, 'y': 0x79, 'z': 0x7A, ' ': 0x20, '.': 0x2E,
  ',': 0x2C, '!': 0x21, '?': 0x3F, '"': 0x22, ';': 0x3B, ':': 0x3A,
  '%': 0x25, '*': 0x2A, '(': 0x28, ')': 0x29, '_': 0x5F, '+': 0x2B,
  '-': 0x2D, '/': 0x2F, '\\': 0x5C, '|': 0x7C, '~': 0x7E, '`': 0x60,
  '№': 0xB9, '#': 0x23, '$': 0x24, '@': 0x40, '^': 0x5E, '&': 0x26,
  '☺': 0xAB, '☻': 0x65, '♦': 0xD9, '♣': 0x9C, '♠': 0x5A, '♂': 0xE3,
  '♀': 0x76, '☼': 0xB4, '=': 0x85,
  '0': 0x30, '1': 0x31, '2': 0x32, '3': 0x33, '4': 0x34, 
  '5': 0x35, '6': 0x36, '7': 0x37, '8': 0x38, '9': 0x39
};

// Обратная таблица для декодирования
const win1251ToUnicode: { [key: number]: string } = Object.fromEntries(
    Object.entries(unicodeToWin1251).map(([char, code]) => [code, char])
);

export function binaryToString(binaryText: string): string {
    const bytes: number[] = [];
    for (let i = 0; i < binaryText.length; i += 8) {
      const byte = binaryText.slice(i, i + 8);
      bytes.push(parseInt(byte, 2));
    }
    return bytes.map(byte => win1251ToUnicode[byte] || '☺').join('');
}

export function stringToBinary(text: string): string {
    return Array.from(text).map(char => {
      const byte = unicodeToWin1251[char];
      if (byte === undefined) return '10101011'; 
      return byte.toString(2).padStart(8, '0'); 
    }).join('');
}