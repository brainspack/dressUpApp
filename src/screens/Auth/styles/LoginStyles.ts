import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },

  imageDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlay: { flex: 1 },
  backArrow: { fontSize: 24, color: '#333', margin: 20 },
  waveSvg: { position: 'absolute', top: 70, left: 0 },
  formWrapper: { flex: 1, paddingHorizontal: 24, paddingTop: 280 }, // Reduced from 320 to 280
  loginTitle: { color: '#ffffff', fontSize: 32, fontWeight: '700', marginBottom: 15 }, // Reduced from 40 to 20
  formContainer: { marginBottom: 24 },
  inputContainer: { marginBottom: 10 },
  forgotPassword: { alignSelf: 'flex-start', marginTop: 6 },
  forgotPasswordText: { color: '#ffffff', fontSize: 14, opacity: 0.9 },
  shadowText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: { gap: 12, marginTop: 8 },
  sendOtpButton: {
    alignSelf: 'center',
    width: '70%',
    borderRadius: 25,
  },
  sendOtpText: {
    fontWeight: '600',
    color: '#2DBE91',
    letterSpacing: 0.3,
    fontSize: 17,
  },
  otpActionText: {
    fontSize: 17,
    fontWeight: '600',
  },
  nextButton: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  // nextArrow: { fontSize: 24, color: '#55ad88', fontWeight: '600' },
});
