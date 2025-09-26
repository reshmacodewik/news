import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // SafeAreaProvider for the whole app
import BottomTab from '../BottomTab/BottomTab';
import { notAuthenticatedRoutes } from '../../routes';
// Adjust the path as needed


const Stack = createStackNavigator();

const AuthenticatedStackNavigation = () => {
  return (
    <SafeAreaProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainDrawerNavigation" component={BottomTab} />
        {notAuthenticatedRoutes.map((item: any) => (
          <Stack.Screen
            key={item.routeName}
            name={item.routeName}
            component={item.component}
            options={{
              headerShown: item.headerShown,
            }}
          />
        ))}
      </Stack.Navigator>
    </SafeAreaProvider>
  );
};

export default AuthenticatedStackNavigation;
