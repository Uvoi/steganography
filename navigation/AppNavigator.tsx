import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Create from '../Screens/Create/Create';
import Load from '../Screens/Load/Load';
import Home from '../Screens/Home/Home';
import EncryptionAudio from '../Screens/EncryptionAudio/EncryptionAudio';
import DecryptionAudio from '../Screens/DecryptionAudio/DecryptionAudio';

type RootStackParamList = {
  Home: undefined;
  Load: undefined;
  Create: undefined;
  EncryptionAudio: undefined;
  DecryptionAudio: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Load"
          component={Load}
          options={{ title: 'Load' }}
        />
        <Stack.Screen
          name="Create"
          component={Create}
          options={{ title: 'Create' }}
        />
        <Stack.Screen
          name="EncryptionAudio"
          component={EncryptionAudio}
          options={{ title: 'EncryptionAudio' }}
        />
        <Stack.Screen
          name="DecryptionAudio"
          component={DecryptionAudio}
          options={{ title: 'DecryptionAudio' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
