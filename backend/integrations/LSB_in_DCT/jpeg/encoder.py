import jpegio as jio
import os
import random
import logging
from .prepare import generate_alphabet_by_random_positions, find_positions_in_dct_limited, calculate_max_binary_size, gather_positions_ignore_dct
from .alphabet import ALPHABET

logger = logging.getLogger(__name__)

def encode_bits(jpeg, positions_list, binary_message):
    """
    Встраиваем двоичные биты (LSB) в соответствующие координаты DCT.
    """
    if len(positions_list) != len(binary_message):
        raise ValueError("[ENCODER] positions_list.size != binary_message.size")

    for idx, ((comp_idx, i, j), bit) in enumerate(zip(positions_list, binary_message)):
        val = jpeg.coef_arrays[comp_idx][i, j]
        new_val = val
        
        if bit == '0':
            # делаем чётным
            if val % 2 == 1:
                new_val = val + 1
        else:
            # делаем нечётным
            if val % 2 == 0:
                new_val = val - 1
        logger.debug(f'({bit}): {val} -- {new_val}')

        jpeg.coef_arrays[comp_idx][i, j] = new_val

def encode(input_path, output_path, secret_key, message):
    logger.info("[ENCODER STARTS]")

    if not os.path.isfile(input_path):
        logger.error(f"Файл не найден:, {input_path}")
        return

    try:
        jpeg = jio.read(input_path)

        reversed_key = secret_key[::-1]
        dct_range = (50, 200)
        alphabet = ALPHABET

        # 1) Генерируем алфавит и находим его позиции
        dct_alphabet = generate_alphabet_by_random_positions(jpeg, secret_key, alphabet, dct_range)
        logger.debug(f'alphabet:\n {dct_alphabet}')
        alphabet_positions = find_positions_in_dct_limited(dct_alphabet, jpeg.coef_arrays)
        logger.debug(f'alphabet positions:\n{alphabet_positions}')

    
        logger.debug("DCT Array Shapes:")
        for idx, arr in enumerate(jpeg.coef_arrays):
            logger.debug(f"Component {idx}: shape {arr.shape}")


        # 2) Считаем, сколько бит нужно для lin_index
        binary_size = calculate_max_binary_size(jpeg.coef_arrays)
        logger.debug(f"binary_size: {binary_size}")

        # 3) Сообщение
        logger.debug(f"message: {message}")
        msg_length = len(message)

        # ------------------------------------------------------
        # (A) Сначала добавим 16 бит длины (msg_length).
        # ------------------------------------------------------
        length_bits_str = f"{msg_length:016b}"   # строка из '0'/'1' длиной 16
        binary_message = list(length_bits_str)   # превратим в список '0'/'1'
        logger.debug(f"{binary_message} - binary формат записи размера сообщения")

        # ------------------------------------------------------
        # (B) Каждый символ -> случайная позиция алфавита -> lin_index -> bits
        # ------------------------------------------------------
        height, width = jpeg.coef_arrays[0].shape
        logger.debug(f'w: {width} h: {height}')

        for char in message:
            # 1) находим случайную "алфавитную" позицию для символа
            if char not in dct_alphabet:
                raise ValueError(f"[ENCODER] Символ '{char}' отсутствует в алфавите!")
            pos_for_char = random.choice(alphabet_positions[char])
            logger.debug(f'{char}: {pos_for_char}')

            # 2) переводим (comp, i, j) в lin_index
            lin_index = (pos_for_char[0] * width * height) + (pos_for_char[1] * width) + pos_for_char[2]
            logger.debug(f'{lin_index} - линейный индекс')

            # 3) записываем лин_index в двоичном формате длиной binary_size
            bits_for_char = f"{lin_index:0{binary_size}b}"  # строка '0'/'1'
            binary_message.extend(list(bits_for_char))
            logger.debug(f'{bits_for_char} - линейный индекс в binary формате')

        logger.debug(f"{binary_message} - все сообщение в binary формате")
        total_bits = len(binary_message)
        logger.debug(f"Всего бит (16 + {msg_length} * {binary_size}): {total_bits}")

        random.seed(reversed_key)

        # 4) Собираем координаты DCT для записи (столько же, сколько у нас бит)
        positions_list = gather_positions_ignore_dct(
            jpeg=jpeg,
            num_bits=total_bits,
            alphabet_positions=alphabet_positions
        )

        # 5) Встраиваем
        encode_bits(jpeg, positions_list, binary_message)

        # 6) Сохраняем
        jio.write(jpeg, output_path)
        logger.debug(f"Изменённый файл сохранён как: {output_path}")

    except Exception as e:
        logger.error(f"Ошибка: {e}")
    
    logger.info("[ENCODER ENDS]")

#encode('image.jpg', 'output.jpg', 'secret_key', 'test message')
