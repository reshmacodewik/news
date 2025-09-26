import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { notAuthenticatedRoutes } from '../../routes';

const Stack = createStackNavigator();

const NoAuthenticatedStackNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {notAuthenticatedRoutes.map((item: any) => (
        <Stack.Screen
          key={item.routeName}
          name={item.routeName}
          component={item.component}
          options={{ headerShown: item.headerShown }}
        />
      ))}
    </Stack.Navigator>
  );
};

export default NoAuthenticatedStackNavigation;
