import React, { useEffect, useState } from 'react';
import { View, Image, Button, Alert, TextInput, Text, Switch, TouchableOpacity } from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { getPixelsCount, getPosition } from '../../functions/meta_img';
import { end_code } from '../../functions/end_codes';
import { stringToBinary } from '../../functions/code';
import { encryptRSA, placeholderRSACreate, placeholderRSACreatePK } from '../../encryption/RSA';
import { encryptChaCha20, getKey, getNonce, placeholderChaCha20Create, placeholderChaCha20CreateN } from '../../encryption/ChaCha20';
import {styles} from './styles'
import { encryptLuca, placeholderLucaCreatePriv, placeholderLucaCreatePub } from '../../encryption/Luca';

const Create: React.FC = () => {
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageFileNew, setImageFileNew] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [RSA, setRSA] = useState<boolean>(false);
  const [ChaCha20, setChaCha20] = useState<boolean>(false);
  const [Luca, setLuca] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [placeholderKey, setPlaceholderKey] = useState<string>('');
  const [placeholderNonce, setPlaceholderNonce] = useState<string>('');

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        Alert.alert('Ошибка при выборе изображения', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setImageFile(uri);

          Image.getSize(
            uri,
            (width, height) => {
              setImageDimensions({ width, height });
            },
            (error) => {
              console.error('Ошибка при получении размеров изображения:', error);
            }
          );
        }
      }
    });
  };

  useEffect(() => {
    const selectPlaceholder = () => {
      if (RSA) {
        setPlaceholderKey(placeholderRSACreate);
        setPlaceholderNonce(placeholderRSACreatePK)
      } else if (ChaCha20) {
        setPlaceholderKey(placeholderChaCha20Create);
        setPlaceholderNonce(placeholderChaCha20CreateN);
      } else if (Luca)
      {
        setPlaceholderKey(placeholderLucaCreatePriv);
        setPlaceholderNonce(placeholderLucaCreatePub);
      }
    };
    selectPlaceholder();
  }, [RSA, ChaCha20, Luca]);

  const toEven = (num: number): number => (num % 2 === 1 ? num - 1 : num);

  const toOdd = (num: number): number => (num % 2 === 0 ? num + 1 : num);

  const toEvenOrOdd = (bin: number, num: number): number => {
    if (bin === 0) {
      return toEven(num);
    } else if (bin === 1) {
      return toOdd(num);
    } else {
      console.log('Ошибка: bin:', bin, ' num: ', num);
      return num;
    }
  };

  const convertToPng = () => {
    console.log('Начало конвертации в PNG с использованием canvas');

    if (imageFile) {
      const HTMLImage = new window.Image();
      HTMLImage.crossOrigin = 'Anonymous';
      HTMLImage.src = imageFile;

      HTMLImage.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = HTMLImage.width;
        canvas.height = HTMLImage.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(HTMLImage, 0, 0);
          await insertData(ctx, HTMLImage.width, HTMLImage.height);
          const dataUrl = canvas.toDataURL('image/png');
          setImageFileNew(dataUrl);
          console.log('Кодирование завершено');
          Alert.alert('Кодирование завершено');
        }
      };

      HTMLImage.onerror = (error) => {
        console.error('Ошибка загрузки изображения для canvas:', error);
        Alert.alert('Ошибка конвертации изображения', 'Не удалось загрузить изображение');
      };
    } else {
      console.log('Изображение не загружено для конвертации');
    }
  };

  const insertData = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelsCount = getPixelsCount(ctx, width, height);
    console.log('размер: ', pixelsCount);
    const pos = getPosition(ctx, width, height);
    console.log(pos);

    let messageToCode: string = '';
    messageToCode = message;
    

    if (RSA) {
      const encryptedMessage = encryptRSA(message, nonce);
      setKey(encryptedMessage.privateKey || "Отсутствует");
      setNonce(encryptedMessage.publicKey || "Отсутствует")
    
      if (encryptedMessage.encryptedMessage) {
        messageToCode = encryptedMessage.encryptedMessage;
      } else {
        console.error('Ошибка шифрования: encryptedMessage.encryptedMessage is false');
      }
    } else if (ChaCha20) {
      const cc20key = getKey(key);
      const cc20nonce = getNonce(nonce);
      setKey(cc20key);
      setNonce(cc20nonce);
      messageToCode = encryptChaCha20(message, cc20key, cc20nonce);
    }
      else if (Luca)
      {
       let luca = await encryptLuca(message, nonce)
       messageToCode = luca.eMessage
       luca.privKey && setKey(luca.privKey)
       luca.pubKey && setNonce(luca.pubKey)
       console.log(messageToCode)
      }
    

    let binaryMessage = stringToBinary(messageToCode) + end_code[Math.floor(Math.random() * end_code.length)];
    console.log(binaryMessage.length);


    // binaryMessage = stringToBinary("aaa") + end_code[Math.floor(Math.random() * end_code.length)]
        console.log(binaryMessage, '--binary-code ');

    console.log(data.slice(0, data.length), '-до кодирования');

    let j = 0;
    let add = 0;

    for (let i = pos * 4; i < pos * 4 + binaryMessage.length + add; i += 4) {
      data[i] = toEvenOrOdd(parseInt(binaryMessage[j], 10), data[i]);
      data[i + 1] = toEvenOrOdd(parseInt(binaryMessage[j + 1], 10), data[i + 1]);
      data[i + 2] = toEvenOrOdd(parseInt(binaryMessage[j + 2], 10), data[i + 2]);
      j += 3;
      add += 1;
    }
    console.log(data.slice(pos * 4, pos * 4 + binaryMessage.length), '-после кодирования');
    ctx.putImageData(imageData, 0, 0);
  };

  const downloadImage = () => {
    if (imageFileNew) {
      const link = document.createElement('a');
      link.href = imageFileNew;
      link.download = 'converted_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(imageFileNew);
    }
  };

  const createHandleClick = () => {
    console.log(stringToBinary(message));
    convertToPng();
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text).then(() => Alert.alert('Скопировано', 'Текст скопирован в буфер обмена'));
  };

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        {imageFile && (
          <Image source={{ uri: imageFile }} style={styles.photo} resizeMode="contain" />
        )}
        {imageFileNew && (
          <Image source={{ uri: imageFileNew }} style={styles.photo} resizeMode="contain" />
        )}
      </View>

      <Button title="Выбрать изображение" onPress={selectImage} />

      <View style={styles.container}>
        <View style={styles.encryption}>
          <Text>RSA шифрование</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={RSA ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setRSA(!RSA)}
            value={RSA}
          />
        </View>
        <View style={styles.encryption}>
          <Text>ChaCha20 шифрование</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={ChaCha20 ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setChaCha20(!ChaCha20)}
            value={ChaCha20}
          />
        </View>
        <View style={styles.encryption}>
          <Text>Luca шифрование</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={Luca ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setLuca(!Luca)}
            value={Luca}
          />
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Введите текст"
        value={message}
        onChangeText={(text) => setMessage(text)}
      />

      {(RSA || ChaCha20 || Luca) && (
        <View style={styles.container}>
          <TextInput
            style={styles.outputKey}
            editable={ChaCha20}
            value={key}
            placeholder={placeholderKey}
            onChangeText={(text) => setKey(text)}
          />
          
          <TouchableOpacity onPress={() => handleCopyKey(key)} style={styles.copyBtn}>
            <Text>Скопировать</Text>
          </TouchableOpacity>
        </View>
      )}
      {(RSA || ChaCha20 || Luca) && (
        <View style={styles.container}>
          <TextInput
            style={styles.outputKey}
            editable={ChaCha20 || RSA || Luca}
            value={nonce}
            placeholder={placeholderNonce}
            onChangeText={(text) => setNonce(text)}
          />
          
        <TouchableOpacity onPress={() => handleCopyKey(nonce)} style={styles.copyBtn}>
          <Text>Скопировать</Text>
        </TouchableOpacity>
        </View>
      )}

      {imageFile && (
        <View style={styles.container}>
          <Button title="Зашифровать" onPress={createHandleClick} disabled={!message} />
          {imageFileNew && <Button title="Скачать PNG" onPress={downloadImage} />}
        </View>
      )}
    </View>
  );
};


export default Create;
