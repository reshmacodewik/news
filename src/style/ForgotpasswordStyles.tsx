import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const AVATAR = 120;
const scale = (size: number) => (width / 375) * size;
const f = (size: number) => scale(size);
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bg: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.05, // Adjust padding for better spacing
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    position: 'absolute',
    top: scale(60),
    left: 16,
    zIndex: 10,
  },

  backIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#fff',
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    minHeight: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp(25),
    height: hp(10),
    marginBottom: hp(1),
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#BFDBFE',
    lineHeight: 24,
    paddingHorizontal: 0,
    fontWeight: '400',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#e3e9ee',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: '-20%',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: height * 0.4,
  },
  inputContainer: {
    marginBottom: 20,
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
    marginBottom: hp(6),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F0F6FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  verifyButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  backLinkText: {
    fontSize: 16,
    color: '#1E4AE9',
    fontWeight: '500',
  },

  otpmainContainer: {
    backgroundColor: '#F9FAFB',
    padding: hp(2),
    borderRadius: 15,
    marginTop: hp(-28),
    marginHorizontal: wp(6),
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  otpContainer: {
    marginVertical: hp(2),
  },
    errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
});
