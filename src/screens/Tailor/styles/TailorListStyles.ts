import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

export const tailorListStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  header: { 
    padding: 16, 
    gap: 12 
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 44,
    alignItems: 'center',
  },
  searchInput: { 
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
  },
  listContainer: { 
    padding: 16 
  },
  tailorItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  tailorInfo: { 
    gap: 4, 
    paddingLeft: 8, 
    flexShrink: 1 
  },
  tailorField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldIcon: {
    marginRight: 4,
  },
  tailorName: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
  tailorContact: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 2 
  },
  tailorAddress: { 
    fontSize: 14, 
    color: '#6b7280' 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#666', 
    marginTop: 24 
  },
});
