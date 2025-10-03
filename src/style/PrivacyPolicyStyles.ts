import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;
const f = (size: number) => scale(size);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3e9ee',
  },

  // Top Navigation
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    borderBottomWidth:1,
    borderColor:'#E1E1E1',

  },

  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
  },

  backIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#374151',
  },

  navTitle: {
    fontSize: f(18),
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  placeholder: {
    width: scale(40),
  },

  // Content
  content: {
    flex: 1,
  },

  // Brand Section
  brandSection: {
    alignItems: 'center',
 
   
    marginBottom: scale(8),
  },

  logo: {
    width: '65%',
    

  },

  brandName: {
    fontSize: f(16),
    fontWeight: '700',
    color: '#4C1D95',
    letterSpacing: scale(1.2),
    textAlign: 'center',
  },

  // Header Section
  headerSection: {
    paddingHorizontal: scale(20),
 
  },

  mainHeading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: scale(8),
    textAlign: 'left',
  },

  lastUpdate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Sections
  section: {

    paddingHorizontal: scale(20),
    paddingVertical: scale(24),
   
  },

  sectionHeading: {
    fontSize: f(22),
    fontWeight: '600',
    color: '#1F2937',
 
    lineHeight: f(28),
  },

  bodyText: {
    fontSize: 16,
    lineHeight: f(26),
    color: '#374151',
    fontWeight: '400',
    textAlign: 'left',
  },
});
