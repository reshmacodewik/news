import { Text, View } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';

const NoInternetConnection = () => {
  return (
    <Modal
      isVisible={true}
      style={{
        // height: '100%',
        // width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffff',
        flex: 1,
        margin: 0,
      }}
    >
      <Text>No internet</Text>
    </Modal>
  );
};

export default NoInternetConnection;
