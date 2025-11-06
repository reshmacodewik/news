import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = (Platform.OS === 'ios' && Platform.isPad) || width >= 768;
const CONTENT_MAX = isTablet ? 750 : undefined;

export const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  /** center + clamp content like Login */
  centerWrap: {
    width: '100%',
    maxWidth: CONTENT_MAX as number | undefined,
    alignSelf: 'center',
  },
  /** clamp fields (inputs/buttons/rows) */
  fieldMax: {
    width: '100%',
    maxWidth: CONTENT_MAX as number | undefined,
    alignSelf: 'center',
  },
  /** right-aligned row (for links aligned to right within same clamp) */
  fieldRowRight: {
    width: '100%',
    maxWidth: CONTENT_MAX as number | undefined,
    alignSelf: 'center',
    alignItems: 'flex-end',
  },

  headerContainer: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    minHeight: isTablet ? 420 : height * 0.35,
    justifyContent: 'center',
  },
  logoContainer: { marginBottom: 15 },
  logo: {
    width: isTablet ? 100 : 46,
    height: isTablet ? 100 : 46,
  },
  welcomeText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: isTablet ? 22 : 14,
    color: '#BFDBFE',
    lineHeight: 22,
    fontWeight: '400',
    marginTop: isTablet ? 20 : 0,
    marginBottom: isTablet ? 100 : 16,
  },

  formContainer: {
    flex: 1,
    backgroundColor: '#e3e9ee',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: - (height * 0.10),
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: height * 0.65,
  },

  inputContainer: { marginBottom: 20 },
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

  signInButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // --- Checkboxes ---
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0B1A2F',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#0B1A2F',
    borderColor: '#0B1A2F',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  checkboxText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    fontWeight: '400',
  },
  linkText: {
    color: '#000',
    fontWeight: '400',
  },

  signUpContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  signUpLink: {
    color: '#1E4AE9',
    fontWeight: '600',
  },
});
