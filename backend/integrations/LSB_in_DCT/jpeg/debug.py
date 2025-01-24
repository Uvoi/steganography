import jpegio as jio
import logging
from .prepare import generate_alphabet_by_random_positions, find_positions_in_dct_limited
from .alphabet import ALPHABET

logger = logging.getLogger(__name__)


def partial_dct_slice_debug(jpeg, component, start, end):
    """
    Извлекает "частичный срез" из DCT-компоненты JPEG:
    
    - component: 0 (Y), 1 (Cb), или 2 (Cr)
    - start = (r0, c0), end = (r1, c1)
    
    Если r0 == r1, берём в этой строке столбцы c0..c1.
    Иначе:
      - в строке r0 берём столбцы c0..конец
      - в строке r1 берём столбцы 0..c1
      - в промежуточных строках (между r0 и r1) берём все столбцы
    Возвращает список (по строкам) numpy-массивов значений DCT.
    """
    arr = jpeg.coef_arrays[component]
    (r0, c0) = start
    (r1, c1) = end

    # Для безопасности, можно проверить границы:
    # - 0 <= r0, r1 < arr.shape[0]
    # - 0 <= c0, c1 < arr.shape[1]
    # и r0 <= r1, c0 <= c1 (или как в задаче оговорено)

    result = []
    
    for row in range(r0, r1 + 1):
        if r0 == r1:
            # один-единственный ряд
            col_start = c0
            col_end = c1
        else:
            if row == r0:
                # первая строка: от c0 до конца
                col_start = c0
                col_end = arr.shape[1] - 1
            elif row == r1:
                # последняя строка: от 0 до c1
                col_start = 0
                col_end = c1
            else:
                # промежуточные строки: полностью
                col_start = 0
                col_end = arr.shape[1] - 1
        
        # Вырезаем нужный фрагмент
        row_slice = arr[row, col_start : col_end + 1]
        
        # Можно, например, собрать в список
        result.append(row_slice)

    return result


def checkAlphabetMatch(photo1_path, photo2_path, dct_range, secret_key, alphabet = ALPHABET):
    jpeg = jio.read(photo1_path)
    jpeg2 = jio.read(photo2_path)

    dct_alphabet = generate_alphabet_by_random_positions(jpeg, secret_key, alphabet, dct_range)
    logger.debug(f'alphabet 1:\n {dct_alphabet}')
    alphabet_positions = find_positions_in_dct_limited(dct_alphabet, jpeg.coef_arrays)
    logger.debug(f'alphabet positions 1:\n {alphabet_positions}')

    dct_alphabet2 = generate_alphabet_by_random_positions(jpeg2, secret_key, alphabet, dct_range)
    logger.debug(f'alphabet 2:\n {dct_alphabet2}')
    alphabet_positions2 = find_positions_in_dct_limited(dct_alphabet2, jpeg2.coef_arrays)
    logger.debug(f'alphabet positions 2:\n {alphabet_positions2}')

    notMatch = 0
    for i in alphabet:
        if alphabet_positions[i] != alphabet_positions2[i]:
            logger.debug(f'{i}: {alphabet_positions[i]} -- {alphabet_positions2[i]}')
            notMatch+=1
    logger.debug('Match!' if not notMatch else 'Not Match!')
