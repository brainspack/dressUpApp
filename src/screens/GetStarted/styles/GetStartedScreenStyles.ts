import { StyleSheet } from 'react-native';

export const getStartedScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay for better text readability
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 80, // Reduced from 40 to 20 to shift content up
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: 'LibertinusSans-Italic',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'LibertinusSans-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomSection: {
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: 'rgba(85, 173, 136, 0.8)', // Green color with opacity
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20, // Reduced from 30 to 15
    minWidth: 300,
    minHeight:60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  accountLinks: {
    alignItems: 'center',
    gap: 8, // Reduced spacing from 15 to 8
  },
  createAccountText: {
    color: 'rgba(255, 255, 255, 0.8)', // White text with opacity
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textDecorationLine: 'underline',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.9)', // White text with opacity
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginLink: {
    color: 'rgba(85, 173, 136, 0.9)', // Green link with opacity
    fontWeight: '700',
    fontSize:18,
    textDecorationLine: 'underline',
  },
});
