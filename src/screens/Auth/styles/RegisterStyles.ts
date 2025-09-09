import { StyleSheet } from 'react-native';

export const registerStyles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  imageDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlay: { flex: 1 },
  backArrow: { fontSize: 24, color: '#ffffff', margin: 20 },
  waveSvg: { position: 'absolute', top: 70, left: 0 },
  formWrapper: { flex: 1, paddingHorizontal: 24, paddingTop: 320 },
  title: { color: '#ffffff', fontSize: 32, fontWeight: '700', marginBottom: 40 },
  shadowText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: { marginBottom: 24 },
  inputContainer: { marginBottom: 10 },
  buttonContainer: { gap: 12, marginTop: 8 },
  sendOtpButton: {
    alignSelf: 'center',
    width: '70%',
    borderRadius: 25,
  },
  sendOtpText: {
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
    fontSize: 17,
  },
  otpActionText: { fontSize: 17, fontWeight: '600' },
});
