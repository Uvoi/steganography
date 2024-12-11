import React, { useEffect, useState } from 'react';
import { View, Image, Button, Alert, TextInput, Text, Switch } from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { getPixelsCount, getPosition } from '../../functions/meta_img';
import { end_code } from '../../functions/end_codes';
import { binaryToString } from '../../functions/code';
import { decryptRSA, placeholderRSALoad } from '../../encryption/RSA';
import { decryptChaCha20, placeholderChaCha20Load, placeholderChaCha20LoadN } from '../../encryption/ChaCha20';
import { styles } from './styles';
import { decryptLuca, placeholderLucaLoad } from '../../encryption/Luca';

const Load: React.FC = () => {
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [RSA, setRSA] = useState<boolean>(false);
  const [ChaCha20, setChaCha20] = useState<boolean>(false);
  const [Luca, setLuca] = useState<boolean>(false);
  const [placeholderKey, setPlaceholderKey] = useState<string>('');
  const [placeholderNonce, setPlaceholderNonce] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

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
        setPlaceholderKey(placeholderRSALoad);
      } else if (ChaCha20) {
        setPlaceholderKey(placeholderChaCha20Load);
        setPlaceholderNonce(placeholderChaCha20LoadN);
      }
      else if (Luca)
      {
        setPlaceholderKey(placeholderLucaLoad)
      }
    };

    selectPlaceholder();
  }, [RSA, ChaCha20, Luca]);

  const decodePixel = (num: number): string => {
    return num % 2 === 1 ? '1' : '0';
  };

  const parseImg = () => {
    console.log('Начало конвертации в PNG с использованием canvas');

    if (imageFile) {
      const HTMLImage = new window.Image();
      HTMLImage.crossOrigin = 'Anonymous';
      HTMLImage.src = imageFile;

      HTMLImage.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = HTMLImage.width;
        canvas.height = HTMLImage.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(HTMLImage, 0, 0);
          decodeData(ctx, HTMLImage.width, HTMLImage.height);
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

  const decodeData = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelsCount = getPixelsCount(ctx, width, height);
    console.log('размер: ', pixelsCount);
    const pos = getPosition(ctx, width, height);
    console.log(pos);

    let endFlag = 0;
    let letter = '';
    let binaryMessage = '';
    let finalMessage = '';

    for (let i = pos * 4; endFlag === 0; i += 4) {
      for (let j = 0; j < 3; j++) {
        binaryMessage += decodePixel(data[i + j]);
        console.log(binaryMessage, '--', binaryMessage.length);
        letter += decodePixel(data[i + j]);
        if (letter.length === 8) {
          console.log(letter, '-letter');
          console.log(binaryToString(letter));
          if (end_code.includes(letter)) {
            endFlag = 1;
          } else {
            finalMessage += binaryToString(letter);
            console.log(finalMessage, '$$');
            letter = '';
          }
        }
      }
    }

    let resultMes = finalMessage;
    if (RSA) {
      resultMes = decryptRSA(finalMessage, key) || "";
    } else if (ChaCha20) {
      resultMes = decryptChaCha20(finalMessage, key, nonce);
    }
    else if (Luca)
    {
      resultMes = decryptLuca(finalMessage,key)
    }
    setMessage(resultMes);
    console.log(data.slice(pos * 4, pos * 4 + binaryMessage.length), '-post');
    ctx.putImageData(imageData, 0, 0);
  };

  const createHandleClick = () => {
    parseImg();
  };

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        {imageFile && <Image source={{ uri: imageFile }} style={styles.photo} resizeMode="contain" />}
      </View>

      <View style={styles.container}>
        <Button title="Выбрать изображение" onPress={selectImage} />
      </View>

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

      <Text style={styles.output}>{message}</Text>

      {(RSA || ChaCha20 || Luca) && (
        <TextInput
          style={styles.output}
          placeholder={placeholderKey}
          value={key}
          onChangeText={(text) => setKey(text)}
        />
      )}
      {ChaCha20 && (
        <TextInput
          style={styles.output}
          placeholder={placeholderNonce}
          value={nonce}
          onChangeText={(text) => setNonce(text)}
        />
      )}
      {imageFile && 
        <View style={styles.container}>
          <Button title="Дешифровать" onPress={createHandleClick}/>
        </View>
      }
    </View>
  );
};

export default Load;
