import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types'
import { styles } from './styles';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button title="Create" onPress={() => navigation.navigate('Create')} />
      <Button title="Load" onPress={() => navigation.navigate('Load')} />
      <Button title="EncryptionAudio" onPress={() => navigation.navigate('EncryptionAudio')} />
      <Button title="DecryptionAudio" onPress={() => navigation.navigate('DecryptionAudio')} />
    </View>
  );
};


export default Home;
