import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import useCheckInternetConnection from '../../Hook/useCheckInternetConnection';
import NoAuthenticatedStackNavigation from './Stack/NoAuthenticatedStackNavigation';
import { navigationRef } from '../../Utils/navigationRef';
import AuthenticatedStackNavigation from './Stack/AuthenticatedStackNavigation';
import NoInternetConnection from '../../Components/NoInternetConnection';
import { useAuth } from '../../Screens/Auth/AuthContext';

const AppRootNavigator = () => {
  const { session } = useAuth();
  const isOffline = useCheckInternetConnection();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthenticated(!!session?.accessToken);
    };
    checkAuth();
  }, []);

  // show nothing or loader until auth state is determined
  if (isAuthenticated === null) {
    return null; // or a <SplashScreen /> / <ActivityIndicator />
  }

  return (
    <NavigationContainer
      linking={{ prefixes: ['http://example', 'https://example'] }}
      ref={navigationRef}
    >
      {isAuthenticated ? (
        <AuthenticatedStackNavigation />
      ) : (
        <NoAuthenticatedStackNavigation />
      )}
      {isOffline && <NoInternetConnection />}
    </NavigationContainer>
  );
};

export default AppRootNavigator;
