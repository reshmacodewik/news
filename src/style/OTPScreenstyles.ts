import { StyleSheet, Dimensions } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bg: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  logo: {
    width: wp(25),
    height: hp(10),
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(5.5),
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: wp(3.5),
    color: '#fff',
    textAlign: 'center',
    marginTop: hp(1),
    marginHorizontal: wp(5),
    marginBottom: hp(4),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: hp(1),
    marginLeft: wp(-5),
  },
  otpmainContainer: {
    backgroundColor: '#F9FAFB',
    padding: hp(5),
    borderRadius: 15,
  },
  otpInput: {
    width: width * 0.11,
    height: width * 0.11,
    borderWidth: 1.5,
    marginTop: hp(-1),
    borderColor: '#9CA3AF',
    borderRadius: 10,
    marginHorizontal: wp(1),
    textAlign: 'center',
    fontSize: wp(6),
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  verifyButton: {
    backgroundColor: '#333333',
    borderRadius: 10,
    paddingVertical: hp(1.8),
    alignItems: 'center',
    marginTop: hp(1),
  },
  verifyText: {
    color: '#fff',
    fontSize: wp(4.2),
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  resendText: {
    color: '#2563EB',
    fontSize: wp(3.8),
    fontWeight: '500',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: hp(4),
  },
  backText: {
    color: '#6B7280',
    fontSize: wp(3.8),
  },
});
