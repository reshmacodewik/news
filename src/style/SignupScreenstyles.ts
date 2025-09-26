import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {

    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
   
    minHeight: height * 0.35,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom:15,
  },
  logo: {
    width: 46,
    height: 46,
    
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
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: '-18%',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: height * 0.65,
  },
  inputContainer: {
    marginBottom: 20,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1E4AE9',
    fontWeight: '500',
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
  borderColor: '#0B1A2F', // deep navy to match your Sign Up button
  backgroundColor: '#FFF',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 2,     // aligns box with first line of text
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
  flex: 1,                // lets text wrap
  fontSize: 14,
  color: '#000',
  lineHeight: 20,
  fontWeight: '400',
},
linkText: {
  color: '#000',       // blue link color
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
