// src/style/PricingStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  pageTitle: {
    fontSize: scale(24),
    fontWeight: '700',
    marginVertical: scale(20),
    color: '#000',
  },
  planCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  planCardHighlight: {
    backgroundColor: '#e0f0ff',
  },
  ribbon: {
    position: 'absolute',
    top: -scale(10),
    right: -scale(10),
    backgroundColor: '#2260B2',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  ribbonText: {
    color: '#fff',
    fontSize: scale(10),
    fontWeight: '600',
  },
  innerCard: {
    marginTop: scale(8),
  },
  planTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#000',
  },
  planSubtitle: {
    fontSize: scale(14),
    color: '#555',
    marginTop: scale(4),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(12),
  },
  price: {
    fontSize: scale(22),
    fontWeight: '700',
    color: '#000',
  },
  cadence: {
    fontSize: scale(14),
    color: '#555',
    marginLeft: scale(4),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
  },
  featureIcon: {
    width: scale(16),
    height: scale(16),
    marginRight: scale(8),
    tintColor: '#999',
  },
  featureIconBlue: {
    tintColor: '#2260B2',
  },
  featureText: {
    fontSize: scale(14),
    color: '#555',
  },
  featureTextBold: {
    fontWeight: '600',
    color: '#000',
  },
  ctaBtn: {
    marginTop: scale(16),
    backgroundColor: '#2260B2',
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '600',
  },
});
