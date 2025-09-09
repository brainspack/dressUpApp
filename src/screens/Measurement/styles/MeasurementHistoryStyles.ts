import { StyleSheet } from 'react-native';

export const measurementHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addButton: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  measurementItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  measurements: {
    gap: 4,
  },
  detail: {
    fontSize: 14,
    color: '#333',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});
