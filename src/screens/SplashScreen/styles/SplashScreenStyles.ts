import { StyleSheet } from 'react-native';

export const splashScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#55ad88', // Professional green background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 160,
    height: 160,
    marginBottom: 0, // Further reduced spacing between logo and text
    justifyContent: 'center',
    alignItems: 'center',
  },
  tailorImage: {
    width: '100%',
    height: '100%',
    // Remove any background styling to eliminate the black box
  },
  appName: {
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1.5,
    textAlign: 'center',
    // Add fallback font styling
    fontStyle: 'italic',
    fontWeight: '700',
  },
  tagline: {
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
});
