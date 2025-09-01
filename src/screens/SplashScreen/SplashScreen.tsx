import React from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { RegularText, TitleText } from '../../components/CustomText';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Tailor Icon - Using actual image */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/tailor-icon.png')}
          style={styles.tailorImage}
          resizeMode="contain"
          onError={(error) => console.log('Image loading error:', error)}
          onLoad={() => console.log('Image loaded successfully')}
        />
      </View>

      {/* App Name */}
      <TitleText style={styles.appName}>DRESSUP APP</TitleText>
      <RegularText style={styles.tagline}>Professional Tailor Management</RegularText>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default SplashScreen;
