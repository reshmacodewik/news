import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import useCheckInternetConnection from '../../Hook/useCheckInternetConnection';
import NoAuthenticatedStackNavigation from './Stack/NoAuthenticatedStackNavigation';
import { navigationRef } from '../../Utils/navigationRef';
import AuthenticatedStackNavigation from './Stack/AuthenticatedStackNavigation';
import NoInternetConnection from '../../Components/NoInternetConnection';
import { getAccessToken } from '../../storage/mmkvPersister';



const AppRootNavigator = () => {
  const isOffline = useCheckInternetConnection();
  const isAuthenticate = getAccessToken();

  return (
    <NavigationContainer
      linking={{ prefixes: ['http://example', 'https://example'] }}
      ref={navigationRef}
    >
      {isAuthenticate ? (
        <AuthenticatedStackNavigation />
      ) : (
        <NoAuthenticatedStackNavigation />
      )}
      {isOffline && <NoInternetConnection />}
    </NavigationContainer>
  );
};

export default AppRootNavigator;
