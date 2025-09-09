import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

export const customerListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary as string,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  totalInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalInlineText: {
    color: colors.textSecondary as string,
    fontSize: 13,
    fontWeight: '600',
  },
  totalInlineBadge: {
    backgroundColor: '#eef2f7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  totalInlineBadgeText: { 
    color: colors.textPrimary as string, 
    fontWeight: '700' 
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  customerItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  customerInfo: {
    gap: 4,
    paddingLeft: 8,
    flexShrink: 1,
  },
  customerField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldIcon: {
    marginRight: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary as string,
  },
  customerContact: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  customerAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  customerDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  orderButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteIconBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
});
