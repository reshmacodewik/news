import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { navigate } from '../Navigators/utils';

interface PaymentStatusModalProps {
  visible: boolean;
  status: 'pending' | 'completed' | 'failed' | null;
  onClose: () => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  visible,
  status,
  onClose,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            alignItems: 'center',
            width: '80%',
            paddingVertical: 36,
            paddingHorizontal: 24,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {/* ⏳ Pending */}
          {status === 'pending' && (
            <>
              <View
                style={{
                  backgroundColor: '#E6F0FF',
                  borderRadius: 50,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 36, color: '#2260B2' }}>⏳</Text>
              </View>

              <Text style={{ fontSize: 20, fontWeight: '600', color: '#222' }}>
                Waiting for payment...
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                Please wait while we process your payment.
              </Text>
            </>
          )}

       
          {status === 'completed' && (
            <>
              <View
                style={{
                
                  borderRadius: 16,
                  paddingVertical: 36,
                  alignItems: 'center',
                  
                }}
              >
                {/* Card with checkmark */}
                <View
                  style={{
                    marginBottom: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius:20,
                  }}
                >
                  <Text style={{ fontSize: 40 }}>✅</Text>
                </View>

                {/* Heading */}
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Success
                </Text>

                {/* Subtext */}
                <Text
                  style={{
                    fontSize: 15,
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                >
                  Your transaction has been completed successfully.
                </Text>

                {/* Continue button */}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    navigate('Home' as never);
                  }}
                  style={{
                    backgroundColor: '#4776E6', // gradient look
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 25,
                    width: '100%',
              
                    
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ❌ Failed */}
          {status === 'failed' && (
            <>
              <View
                style={{
                  backgroundColor: '#FDECEC',
                  borderRadius: 50,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 36 }}>❌</Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#D32F2F',
                  textAlign: 'center',
                }}
              >
                Payment Failed
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  marginTop: 24,
                  backgroundColor: '#D32F2F',
                  borderRadius: 10,
                  width: '80%',
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PaymentStatusModal;
