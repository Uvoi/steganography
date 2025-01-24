import logging
from server import start_server

from integrations.LSB_in_DCT.jpeg.encoder import encode
from integrations.LSB_in_DCT.jpeg.decoder import decode


logger = logging.getLogger(__name__)

def main():
    logger.info("Приложение запущено.")
    try:

        encode('bg.jpg', 'output.jpg', 'secret_key', 'test message')
        print(decode('output.jpg', 'secret_key'))

    except Exception as e:
        logger.exception(f"Произошла ошибка во время выполнения приложения: {e}")
    

if __name__ == "__main__":
    main()
