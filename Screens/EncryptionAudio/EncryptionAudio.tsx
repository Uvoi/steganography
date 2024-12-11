import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Button,
  TextInput,
  Alert,
} from 'react-native';
import { styles } from './styles';
import {
  countAmplitudes,
  getPosition,
} from '../../functions/meta_audio';
import { end_code } from '../../functions/end_codes';
import { stringToBinary } from '../../functions/code';
import { encryptRSA, placeholderRSACreate, placeholderRSACreatePK, placeholderRSALoad } from '../../encryption/RSA';
import { 
  encryptChaCha20,
  getKey,
  getNonce,
  placeholderChaCha20Create,
  placeholderChaCha20CreateN,
} from '../../encryption/ChaCha20';
import { encryptLuca, placeholderLucaCreatePriv, placeholderLucaCreatePub } from '../../encryption/Luca';

const EncryptionAudio: React.FC = () => {
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [modifiedAudioPath, setModifiedAudioPath] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [RSA, setRSA] = useState(false);
  const [ChaCha20, setChaCha20] = useState(false);
  const [Luca, setLuca] = useState(false);
  const [placeholderKey, setPlaceholderKey] = useState<string>('');
  const [placeholderNonce, setPlaceholderNonce] = useState<string>('');
  

  useEffect(() => {
    const selectPlaceholder = () => {
      if (RSA) {
        setPlaceholderKey(placeholderRSACreate);
        setPlaceholderNonce(placeholderRSACreatePK)
      } else if (ChaCha20) {
        setPlaceholderKey(placeholderChaCha20Create);
        setPlaceholderNonce(placeholderChaCha20CreateN);
      }
      else if (Luca)
      {
        setPlaceholderKey(placeholderLucaCreatePriv);
        setPlaceholderNonce(placeholderLucaCreatePub);
      }
    };

    selectPlaceholder();
  }, [RSA, ChaCha20, Luca]);

  const adjustParity = (value: number, makeOdd: boolean): number => {
    const strValue = value.toFixed(6);
    const index = strValue.indexOf('.') + 4;
    if (index > 0 && index < strValue.length) {
      const digit = parseInt(strValue[index], 10);
      if ((digit % 2 === 0) === makeOdd) {
        const newDigit = makeOdd ? digit + 1 : digit - 1;
        return parseFloat(
          strValue.slice(0, index) + newDigit + strValue.slice(index + 1)
        );
      }
    }
    return value;
  };

  const createModifiedAudio = async (audioBuffer: AudioBuffer): Promise<string> => {
    const pos = getPosition(countAmplitudes(audioBuffer));
    
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
    }

    const binaryMessage = stringToBinary(messageToCode) + end_code[Math.floor(Math.random() * end_code.length)];
    console.log(binaryMessage, ' -to code')

    const channelData = audioBuffer.getChannelData(0);
    let j = 0;

    for (let i = pos; j < binaryMessage.length && i < channelData.length; i++) {
      if (channelData[i] !== 0) {
        const makeOdd = binaryMessage[j] === '1';
        channelData[i] = adjustParity(channelData[i], makeOdd);
        j++;
      }
    }

    return audioBufferToWave(audioBuffer);
  };

  const audioBufferToWave = async (audioBuffer: AudioBuffer): Promise<string> => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 4 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) =>
      str.split('').forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));

    writeString(0, 'RIFF');
    view.setUint32(4, length - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 3, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * numOfChannels * 4, true);
    view.setUint16(32, numOfChannels * 4, true);
    view.setUint16(34, 32, true);
    writeString(36, 'data');
    view.setUint32(40, length - 44, true);

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        view.setFloat32(offset, audioBuffer.getChannelData(channel)[i], true);
        offset += 4;
      }
    }

    return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  };

  const handleEncryptClick = async (file: File) => {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    const modifiedAudioUrl = await createModifiedAudio(audioBuffer);
    setModifiedAudioPath(modifiedAudioUrl);
  };

  const processAudioFile = async (file: File) => {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    setAudioPath(URL.createObjectURL(file));
    setAudioFile(file);
  };

  const pickAudioFile = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) processAudioFile(file);
      };
      input.click();
    } else {
      console.warn('File picker is not supported on this platform');
    }
  };

  const handleCopyKey = (text: string) =>
    navigator.clipboard.writeText(text).then(() => Alert.alert('Скопировано', 'Текст скопирован в буфер обмена'));

  return (
    <View style={styles.main}>
      <Text style={styles.title}>Encryption Audio</Text>
      <TouchableOpacity style={styles.CustomButton} onPress={pickAudioFile}>
        <Text style={{color:"white"}}>Выбрать аудиофайл</Text>
      </TouchableOpacity>
  
      <View style={styles.container}>
        {audioPath && (
          <View style={styles.playerContainer}>
            <Text style={styles.audioPathText}>Original Audio:</Text>
            <audio controls>
              <source src={audioPath} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </View>
        )}
        {modifiedAudioPath && (
          <View style={styles.playerContainer}>
            <Text style={styles.audioPathText}>Modified Audio:</Text>
            <audio controls>
              <source src={modifiedAudioPath} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </View>
        )}
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


      {audioFile && (
        <View style={styles.container}>
          <Button
            title="Зашифровать"
            onPress={() => handleEncryptClick(audioFile)}
            disabled={!message}
          />
          {modifiedAudioPath && (
            <a href={modifiedAudioPath} download="modified_audio.wav" style={styles.CustomButton}>
              Скачать аудио
            </a>
          )}
        </View>
      )}
  

    </View>
  );
};  

export default EncryptionAudio;
