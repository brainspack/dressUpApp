import { StyleSheet, Platform } from 'react-native';
import colors from '../../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    paddingTop: 20,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  section: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: colors.textPrimary,
  },
  text: {
    fontSize: 14,
    marginBottom: 6,
    color: colors.textSecondary,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timelineEvent: {
    marginBottom: 10,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  notes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    padding: 12,
    paddingTop: 0,
  },
  topRowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 1,
    borderRadius: 10,
    marginHorizontal: 4,
    marginBottom: 4,
    minWidth: '40%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    // Platform-specific styling for consistency
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonGradient: {
    paddingVertical: 12,
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  completeButton: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  addClothButton: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  createOrderButton: { 
    display: 'none' 
  },
  createOrderButtonText: { 
    display: 'none' 
  },
  subCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subKey: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  subVal: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  imageThumbWrap: {
    marginRight: 10,
  },
  imageThumbShadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageThumbBorder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  measureHeader: {
    marginTop: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measureGrid: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    rowGap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  measureGroup: {
    marginBottom: 6,
  },
  measureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  measureKey: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  measureVal: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  measureEmpty: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  clothImagesContainer: {
    marginTop: 8,
  },
  clothImageGroup: {
    marginBottom: 16,
  },
  clothImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  clothImageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clothImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  noImagesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
