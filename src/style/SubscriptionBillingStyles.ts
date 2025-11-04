import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;
const f = (size: number) => scale(size);
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3e9ee',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#374151',
  },
  backArrow: {
    fontSize: 22,
    color: '#000',
  },
  placeholder: {
    width: scale(40),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
  },

  /* 🔶 Active Plan Banner */
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7D6',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  bannerIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFDD57',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bannerIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B30000',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B30000',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  upgradeButton: {
   
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginLeft: 8,
  },
  upgradeButtonText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },

  /* 📜 Billing Section */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E1E1E',
    marginTop: 22,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#707070',
    marginBottom: 10,
  },
    row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
 headerRow: {
    backgroundColor: '#f7f7f8',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#333',
  },
    tablecontainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 2,
    elevation: 2,
   
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  statusBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  paid: {
    backgroundColor: '#09f34fff',
  },
  pending: {
    backgroundColor: '#fff5e0',
  },
  failed: {
    backgroundColor: '#fdecea',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidText: {
    color: '#1a7f37',
  },
  pendingText: {
    color: '#b26a00',
  },
  failedText: {
    color: '#d32f2f',
  },
  /* 💳 Billing Card */
  billingCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 14,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billingDate: {
    fontSize: 15,
    color: '#333',
  },
  billingAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  billingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  // statusBadge: {
  //   borderRadius: 6,
  //   paddingVertical: 3,
  //   paddingHorizontal: 8,
  // },
  statusPaid: {
    backgroundColor: '#E5F6EA',
  },
  statusPending: {
    backgroundColor: '#FFF2D9',
  },
 
  statusTextPaid: {
    color: '#1B873F',
  },
  statusTextPending: {
    color: '#D89614',
  },
  invoiceLink: {
    fontSize: 13,
    color: '#2260B2',
    fontWeight: '500',
  },
});
