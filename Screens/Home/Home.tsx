import React from 'react';
import { View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types'
import {Button} from 'react-native-elements'
import { styles } from './styles';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button title="Encryption image" onPress={() => navigation.navigate('Create')} buttonStyle={styles.encryption}/>
      <Button title="Decryption image" onPress={() => navigation.navigate('Load')} buttonStyle={styles.decryption}/>
      <Button title="Encryption audio" onPress={() => navigation.navigate('EncryptionAudio')} buttonStyle={styles.encryption}/>
      <Button title="Decryption audio" onPress={() => navigation.navigate('DecryptionAudio')} buttonStyle={styles.decryption}/>
    </View>
  );
};


export default Home;
