import Toast from 'react-native-toast-message';

const ShowToast = (
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
) => {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    text1Style: {
      color: '#000000',
    },
  });
};

export default ShowToast;
