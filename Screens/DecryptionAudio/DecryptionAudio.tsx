import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Button,
  TextInput,
} from 'react-native';
import { countAmplitudes, getPosition } from '../../functions/meta_audio';
import { end_code } from '../../functions/end_codes';
import { binaryToString } from '../../functions/code';
import { styles } from './styles';
import { decryptRSA, placeholderRSALoad } from '../../encryption/RSA';
import { decryptChaCha20, placeholderChaCha20Load, placeholderChaCha20LoadN } from '../../encryption/ChaCha20';

const DecryptionAudio: React.FC = () => {
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [placeholderKey, setPlaceholderKey] = useState<string>('');
  const [placeholderNonce, setPlaceholderNonce] = useState<string>('');
  const [RSA, setRSA] = useState(false);
  const [ChaCha20, setChaCha20] = useState(false);

  useEffect(() => {
    setPlaceholderKey(RSA ? placeholderRSALoad : ChaCha20 ? placeholderChaCha20Load : '');
    setPlaceholderNonce(ChaCha20 ? placeholderChaCha20LoadN : '');
  }, [RSA, ChaCha20]);

  const decodeMessage = (audioBuffer: AudioBuffer, startPos: number): string => {
    let binaryMessage = '';
    const endCodesSet = new Set(end_code);
    let currentBinaryChar = '';

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);

      for (let i = startPos; i < channelData.length; i++) {
        if (channelData[i] === 0) continue;

        const strValue = channelData[i].toFixed(6);
        const digit = parseInt(strValue.charAt(strValue.indexOf('.') + 4), 10);

        if (!isNaN(digit)) {
          currentBinaryChar += digit % 2 === 0 ? '0' : '1';
          if (currentBinaryChar.length === 8) {
            if (endCodesSet.has(currentBinaryChar)) return binaryToString(binaryMessage);
            binaryMessage += currentBinaryChar;
            currentBinaryChar = '';
          }
        }

        if (i - startPos > 10000) break;
      }
    }

    console.warn('End code not found in the message');
    return binaryToString(binaryMessage);
  };

  const processAudioFile = async (file: File) => {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log(`Amplitude Count: ${countAmplitudes(audioBuffer)}`);
    setAudioPath(URL.createObjectURL(file));
  };

  const handleDecryptClick = async (file: File) => {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const pos = getPosition(countAmplitudes(audioBuffer));
    const decodedMessage = decodeMessage(audioBuffer, pos);

    let resultMes = decodedMessage;
    if (RSA) {
      resultMes = decryptRSA(decodedMessage, key) || "";
    } else if (ChaCha20) {
      resultMes = decryptChaCha20(decodedMessage, key, nonce);
    }
    setMessage(resultMes);

  };

  const pickAudioFileWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processAudioFile(file);
      setAudioFile(file);
    }
  };

  const pickAudioFile = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = (event) => pickAudioFileWeb(event as any);
      input.click();
    } else {
      console.warn('Document picker is not supported on this platform');
    }
  };

  return (
    <View style={styles.main}>
      <Text style={styles.title}>Дешифровка аудио</Text>

      <TouchableOpacity style={styles.CustomButton} onPress={pickAudioFile}>
        <Text style={{color:"white"}}>Выбрать аудиофайл</Text>
      </TouchableOpacity>

      {audioPath && (
        <View style={styles.playerContainer}>
          <Text style={styles.audioPathText}>Original Audio:</Text>
          <audio controls>
            <source src={audioPath} type="audio/mpeg" />
            <Text style={styles.audioPathText}>
              Your browser does not support the audio element.
            </Text>
          </audio>
        </View>
      )}

      <View style={styles.container}>
        <View style={styles.encryption}>
          <Text>RSA Encryption</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={RSA ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={() => setRSA(!RSA)}
            value={RSA}
          />
        </View>
        <View style={styles.encryption}>
          <Text>ChaCha20 Encryption</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={ChaCha20 ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={() => setChaCha20(!ChaCha20)}
            value={ChaCha20}
          />
        </View>
      </View>

      {message ? <Text style={styles.output}>{String(message)}</Text> : null}

      {(RSA || ChaCha20) && (
        <TextInput
          style={styles.output}
          placeholder={placeholderKey}
          value={key}
          onChangeText={setKey}
        />
      )}

      {ChaCha20 && (
        <TextInput
          style={styles.output}
          placeholder={placeholderNonce}
          value={nonce}
          onChangeText={setNonce}
        />
      )}

      {audioFile && (
        <Button
          title="Расшифровать"
          onPress={() => handleDecryptClick(audioFile)}
        />
      )}
    </View>
  );
};

export default DecryptionAudio;
