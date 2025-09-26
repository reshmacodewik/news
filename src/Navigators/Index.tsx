import React from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import ErrorHandler from '../ErrorHandler';
import AppRootNavigator from './Navigation/AppRootNavigator';

const ApplicationNavigator = () => {
  return (
    // <NavigationContainer ref={navigationRef}>
    <ErrorBoundary FallbackComponent={ErrorHandler}>
      <AppRootNavigator />
    </ErrorBoundary>
    // </NavigationContainer>
  );
};

export default ApplicationNavigator;
