import React from 'react';
import { View, Text, Button } from 'react-native';
import { styles } from './ErrorHandler.styles';

const ErrorHandler = ({ resetError }: any) => (
  <View style={styles.root}>
    <Text style={styles.textStyle}>Something happened!</Text>
    <Button onPress={() => resetError()} title="Try again" />
  </View>
);

export default ErrorHandler;
