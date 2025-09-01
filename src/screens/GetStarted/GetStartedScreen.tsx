import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

type GetStartedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GetStarted'
>;

const GetStartedScreen = () => {
  const navigation = useNavigation<GetStartedScreenNavigationProp>();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    // Do nothing for now - just stay on this screen
    console.log('Get Started pressed - staying on screen');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Auth', { screen: 'Register' });
  };

  const handleLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={require('../../assets/images/tailor-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay for better text readability */}
        <View style={styles.overlay}>
          {/* Main content */}
          <View style={styles.content}>
            {/* App title at the top */}
            <View style={styles.titleContainer}>
              {/* <Text style={styles.appTitle}>TAILOR SYSTEM</Text>
              <Text style={styles.appSubtitle}>Professional Tailor Management</Text> */}
            </View>

            {/* Bottom section with buttons and links */}
            <View style={styles.bottomSection}>
              {/* Get Started Button */}
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <RegularText style={styles.getStartedButtonText}>{t('common.get_started')}</RegularText>
              </TouchableOpacity>

              {/* Account links */}
              <View style={styles.accountLinks}>
                <TouchableOpacity onPress={handleCreateAccount}>
                  <RegularText style={styles.createAccountText}>{t('auth.createAccount')}</RegularText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleLogin}>
                  <RegularText style={styles.loginText}>
                    {t('auth.alreadyAccountLogin')}
                  </RegularText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 40,
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
    marginBottom: 30,
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
    color: 'rgba(255, 255, 255, 0.9)', // White text with opacity
    fontSize: 16,
    fontWeight: '500',
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
    fontWeight: '600',
    fontSize:18,
    textDecorationLine: 'underline',
  },
});

export default GetStartedScreen;
