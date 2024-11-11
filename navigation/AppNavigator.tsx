import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Create from '../Screens/Create/Create';
import Load from '../Screens/Load/Load';
import Home from '../Screens/Home/Home';

type RootStackParamList = {
  Home: undefined;
  Load: undefined;
  Create: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
