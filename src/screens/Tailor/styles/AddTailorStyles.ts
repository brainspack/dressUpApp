import { StyleSheet } from 'react-native';

export const addTailorStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  formCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageUploaderContainer: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  imageUploader: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2DBE91',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60 
  },
  imagePlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  imagePlaceholderText: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  cameraBadge: {
    position: 'absolute', 
    bottom: 6, 
    right: 6, 
    width: 28, 
    height: 28, 
    borderRadius: 14,
    backgroundColor: '#ffffff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
  },
  formProgressContainer: { 
    marginTop: 12, 
    width: '50%', 
    alignSelf: 'center' 
  },
  formProgressTrack: { 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#E5E7EB', 
    overflow: 'hidden' 
  },
  formProgressFill: { 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#229B73' 
  },
  inputGroup: { 
    marginBottom: 16 
  },
  label: { 
    color: '#475569', 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16, 
    backgroundColor: '#fff' 
  },
  textArea: { 
    minHeight: 80, 
    textAlignVertical: 'top' 
  },
});
