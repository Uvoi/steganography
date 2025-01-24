import random
import numpy as np

import logging

logger = logging.getLogger(__name__)


def generate_alphabet_by_random_positions (jpeg, key, alphabet, dct_range):
    """
    Выбор случайных позиций (comp_idx, i, j) в DCT:
      - Рассматривается коэффициент val = jpeg.coef_arrays[comp_idx][i, j].
      - Если val уже присвоен другой букве, пропускаем.
      - Если val вне dct_range, пропускаем.
      - Иначе присваиваем этой букве. 
    Продолжаем, пока не назначим коэффициент для всех букв.
    
    :param jpeg:          Объект JPEG (после jio.read)
    :param key:           Ключ (строка), для воспроизводимости random
    :param alphabet:      Строка, например "abcdefghijklmnopqrstuvwxyz"
    :param dct_range:     Кортеж (min_val, max_val)
    :return: dict: { 'a': valA, 'b': valB, ... }, 
                   где valX взят из jpeg'а случайной позицией.
    """
    random.seed(key)

    # Соберём информацию о количестве коэффициентов
    comp_info = []
    total_coeffs = 0
    for comp_idx, arr in enumerate(jpeg.coef_arrays):
        h, w = arr.shape
        comp_info.append((comp_idx, h, w, total_coeffs))
        total_coeffs += (h * w)

    used_values = set()       # коэффициенты (val), уже назначенные буквам
    alphabet_mapping = {}
    letter_index = 0          # идём по alphabet

    max_attempts = 10_000_000
    attempts = 0

    # Пока не назначим коэффициенты всем буквам
    while letter_index < len(alphabet) and attempts < max_attempts:
        # Случайный линейный индекс
        lin_idx = random.randint(0, total_coeffs - 1)
        # Определяем (comp_idx, i, j)
        for (c_idx, h, w, base) in comp_info:
            size_comp = h*w
            if base <= lin_idx < base + size_comp:
                offset = lin_idx - base
                i = offset // w
                j = offset % w
                break

        val = jpeg.coef_arrays[c_idx][i, j]

        # Проверим диапазон val
        if dct_range[0] <= val <= dct_range[1]:
            # Проверим, не используем ли уже этот val
            if val not in used_values:
                # Назначаем текущей букве
                current_char = alphabet[letter_index]
                alphabet_mapping[current_char] = val
                used_values.add(val)
                letter_index += 1
                # Переходим к следующей букве
        # иначе пропускаем и ищем дальше

        attempts += 1

    if letter_index < len(alphabet):
        raise RuntimeError(
            "[generate_alphabet_by_random_positions] Не смогли найти уникальные коэффициенты "
            f"для всех букв (треб. {len(alphabet)}, есть {letter_index})."
        )

    return alphabet_mapping


def find_positions_in_dct_limited(alphabet_mapping, dct_matrices, max_positions_per_char=10):
    """
    Ищет позиции (comp_idx, i, j) для каждого значения val = alphabet_mapping[char].
    Но для каждого char сохраняет только первые max_positions_per_char в списке.

    :param alphabet_mapping: dict { char: val }, где val - значение коэффициента
    :param dct_matrices: список/итерируемое с DCT-матрицами (jpeg.coef_arrays)
    :param max_positions_per_char: int, сколько максимум позиций хранить на букву
    :return: dict { char: [ (comp_idx, i, j), ... ] } - для каждой буквы до max_positions_per_char позиций
    """
    # Готовим словарь списков
    positions = {char: [] for char in alphabet_mapping}
    
    # Для удобства проверять, достигли ли мы нужного лимита для всех
    # будем считать, сколько символов уже набрало max_positions_per_char позиций
    complete_count = 0
    total_chars = len(alphabet_mapping)

    # Обход всех коэффициентов
    # (enumerate(dct_matrices) => comp_idx, matrix)
    done = False
    for comp_idx, matrix in enumerate(dct_matrices):
        if done:
            break
        for i, row in enumerate(matrix):
            if done:
                break
            for j, val in enumerate(row):
                # Перебираем символы и их значения
                for char, alpha_val in alphabet_mapping.items():
                    if val == alpha_val:
                        # Если для этого char ещё не набрали max_positions_per_char
                        if len(positions[char]) < max_positions_per_char:
                            positions[char].append((comp_idx, i, j))
                            # Если ровно достигли лимита для char, увеличиваем complete_count
                            if len(positions[char]) == max_positions_per_char:
                                complete_count += 1
                                # Если все символы собрали по 5 позиций, можно прервать
                                if complete_count == total_chars:
                                    done = True
                                    break
                if done:
                    break
    return positions



def calculate_max_binary_size(dct_matrices):
    """
    Подсчет количества бит необходимого для кодирования одного линейного индекса,
    исходя из общего количества коэффициентов (сумма по всем компонентам).
    """
    total_coeffs = 0
    for arr in dct_matrices:
        h, w = arr.shape
        total_coeffs += (h * w)
    return int(np.ceil(np.log2(total_coeffs)))



def gather_positions_ignore_dct(jpeg, num_bits, alphabet_positions, used_positions = set()):
    """
    Генерирует num_bits координат (comp_idx, i, j), игнорируя:
    - позиции, занятые алфавитом (flattened_alphabet_positions)
    - уже использованные позиции (used_positions)
    - позиции, где значение DCT-коэффициента уже присутствует в алфавите (alphabet_values)
    - для чётных val: если val-1 присутствует в алфавите
    - для нечётных val: если val+1 присутствует в алфавите

    При добавлении позиции выводит её значения и значения соседних коэффициентов.

    :param jpeg: Объект JPEG (результат jio.read)
    :param num_bits: Количество позиций для генерации
    :param alphabet_positions: dict { char: [ (comp_idx, i, j), ... ], ... }
    :return: list of tuples (comp_idx, i, j)
    """
    
    comp_info = []
    total_coeffs = 0
    for comp_idx, arr in enumerate(jpeg.coef_arrays):
        h, w = arr.shape
        comp_info.append((comp_idx, h, w, total_coeffs))
        total_coeffs += (h * w)

    # Собираем алфавитные координаты в set()
    flattened_alphabet_positions = set()
    for coords in alphabet_positions.values():
        for (c_idx, i, j) in coords:
            flattened_alphabet_positions.add((c_idx, i, j))

    # Собираем все значения DCT, используемые в алфавите
    alphabet_values = set()
    for coords in alphabet_positions.values():
        for (c_idx, i, j) in coords:
            val = jpeg.coef_arrays[c_idx][i, j]
            alphabet_values.add(val)

    positions_list = []
    attempts = 0
    max_attempts = num_bits * 100

    while len(positions_list) < num_bits and attempts < max_attempts:
        lin_idx = random.randint(0, total_coeffs - 1)
        for (comp_idx, h, w, base_lin) in comp_info:
            size_comp = h * w
            if base_lin <= lin_idx < base_lin + size_comp:
                offset = lin_idx - base_lin
                i = offset // w
                j = offset % w

                # Проверяем исключения
                if ((comp_idx, i, j) in flattened_alphabet_positions or
                    (comp_idx, i, j) in used_positions):
                    break  # Пропускаем эту позицию

                val = jpeg.coef_arrays[comp_idx][i, j]


                if (val > -20) and (val < 21):
                    break

                # Проверка, присутствует ли val в алфавите
                if val in alphabet_values:
                    break  # Пропускаем эту позицию

                # Для чётных val проверяем val - 1
                if val % 2 == 0 and (val - 1) in alphabet_values:
                    break  # Пропускаем эту позицию

                # Для нечётных val проверяем val + 1
                if val % 2 != 0 and (val + 1) in alphabet_values:
                    break  # Пропускаем эту позицию


                # Если позиция прошла все проверки, добавляем её
                positions_list.append((comp_idx, i, j))
                used_positions.add((comp_idx, i, j))

                # Получаем значения соседних коэффициентов
                left_val = jpeg.coef_arrays[comp_idx][i, j-1] if j > 0 else None
                right_val = jpeg.coef_arrays[comp_idx][i, j+1] if j < (w - 1) else None

                # Формируем строку для вывода
                left_str = str(left_val) if left_val is not None else "-"
                right_str = str(right_val) if right_val is not None else "-"
                logger.debug(f"Added position: [{comp_idx}, {i}, {j}] = {left_str} -- {val} -- {right_str}")

                break  # Переходим к следующему lin_idx после успешного добавления
        attempts += 1

    if len(positions_list) < num_bits:
        raise RuntimeError("[ENCODER] Не хватило позиций для встраивания всех бит.")

    return positions_list



