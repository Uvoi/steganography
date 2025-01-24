import jpegio as jio
import os
import random
import logging
from .prepare import generate_alphabet_by_random_positions, find_positions_in_dct_limited, calculate_max_binary_size, gather_positions_ignore_dct
from .alphabet import ALPHABET

logger = logging.getLogger(__name__)


def read_bits(jpeg, positions_list):
    bits = []
    for idx, (comp_idx, i, j) in enumerate(positions_list):
        val = jpeg.coef_arrays[comp_idx][i, j]
        bit = '1' if (val % 2 == 1) else '0'
        bits.append(bit)
    return bits

def binary_to_message(binary_bits, alphabet_positions, width, height, binary_size):
    """
    Логика: мы делим все bits на chunk'и по binary_size.
    Каждому chunk → lin_index → (comp_idx, i, j) → ищем символ алфавита.
    """
    message = []
    total_chunks = len(binary_bits) // binary_size
    for idx in range(total_chunks):
        chunk = binary_bits[idx*binary_size : (idx+1)*binary_size]
        lin_str = "".join(chunk)
        logger.debug(f'{lin_str} - линейный индекс')
        lin_index = int(lin_str, 2)
        logger.debug(f"{lin_index} - линейный индекс в binary формате")

        comp_idx = lin_index // (width * height)
        offset = lin_index % (width * height)
        i = offset // width
        j = offset % width

        logger.debug(f"{comp_idx}, {i}, {j}")

        for char, coords in alphabet_positions.items():
            if (comp_idx, i, j) in coords:
                message.append(char)
                break
    return "".join(message)

def decode(input_path, secret_key):
    logger.info("[DECODER STARTS]")
    if not os.path.isfile(input_path):
        logger.error("Нет файла:", input_path)
        return

    try:
        jpeg = jio.read(input_path)

        reversed_key = secret_key[::-1]
        dct_range = (50, 200)
        alphabet = ALPHABET

        dct_alphabet = generate_alphabet_by_random_positions(jpeg, secret_key, alphabet, dct_range)
        logger.debug(f'alphabet:\n {dct_alphabet}')
        alphabet_positions = find_positions_in_dct_limited(dct_alphabet, jpeg.coef_arrays)
        logger.debug(f'alphabet positions:\n {alphabet_positions}')

        binary_size = calculate_max_binary_size(jpeg.coef_arrays)
        logger.debug(f"binary_size: {binary_size}")

        height, width = jpeg.coef_arrays[0].shape
        logger.debug(f'w: {width} h: {height}')

        random.seed(reversed_key)
        used_pos = set()

        # (A) считываем 16 бит, узнаём длину
        length_bits_count = 16
        positions_4_length = gather_positions_ignore_dct(
            jpeg=jpeg,
            num_bits=length_bits_count,
            alphabet_positions=alphabet_positions,
            used_positions=used_pos           # pass the set
        )
        bits_for_length = read_bits(jpeg, positions_4_length)
        length_bin_str = "".join(bits_for_length)
        msg_length = int(length_bin_str, 2)
        logger.debug(f"Прочитанный размер сообщения: {msg_length}")

        # (B) считываем (msg_length * binary_size) бит
        msg_bits_count = msg_length * binary_size
        positions_4_message = gather_positions_ignore_dct(
            jpeg=jpeg,
            num_bits=msg_bits_count,
            alphabet_positions=alphabet_positions,
            used_positions=used_pos           # same set
        )
        bits_for_message = read_bits(jpeg, positions_4_message)
        logger.debug(f'{bits_for_message} - binary формат сообщения')

        # (C) Восстанавливаем символы
        final_message = binary_to_message(
            bits_for_message,
            alphabet_positions,
            width, height,
            binary_size
        )
        logger.debug(f"Итоговое сообщение: {final_message}")
        logger.info("[DECODER ENDS]")
        return final_message

    except Exception as e:
        logger.error(f"Ошибка: {e}")
        logger.info("[DECODER ENDS]")
        return 'Error reading'

#decode('output.jpg', 'secret_key')
