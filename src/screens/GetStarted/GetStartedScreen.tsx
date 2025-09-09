import React from 'react';
import {
  View,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStartedScreenStyles as styles } from './styles/GetStartedScreenStyles';
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

export default GetStartedScreen;
