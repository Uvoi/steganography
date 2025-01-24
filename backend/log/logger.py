import logging
import logging.config
import os
from pathlib import Path
import yaml

def setup_logging(
    default_path='logging.yaml',
    default_level=logging.INFO,
    env_key='LOG_CFG'
):
    """
    Настраивает логирование по конфигурационному файлу или использует базовую конфигурацию.

    :param default_path: Путь к конфигурационному файлу относительно папки logger.py.
    :param default_level: Уровень логирования по умолчанию.
    :param env_key: Переменная окружения для переопределения пути к конфигурации.
    """
    # Определяем директорию, где находится logger.py
    base_dir = Path(__file__).resolve().parent

    # Устанавливаем путь к конфигурационному файлу относительно base_dir
    path = base_dir / default_path

    # Если установлена переменная окружения, используем её как путь
    value = os.getenv(env_key, None)
    if value:
        path = Path(value)

    if path.exists():
        with open(path, 'rt') as f:
            config = yaml.safe_load(f.read())
        
        # Преобразуем относительные пути обработчиков с файлами в абсолютные
        if 'handlers' in config:
            for handler_name, handler in config['handlers'].items():
                if 'filename' in handler:
                    handler_path = base_dir / handler['filename']
                    handler['filename'] = str(handler_path)
        
        logging.config.dictConfig(config)
    else:
        logging.basicConfig(level=default_level)
        logging.warning(f'Не удалось найти конфигурационный файл логирования по пути: {path}. Использована базовая конфигурация.')

# Вызовите функцию при импорте модуля
setup_logging()
