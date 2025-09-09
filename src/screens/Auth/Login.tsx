import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import apiService from '../../services/api';
import { RegularText, TitleText } from '../../components/CustomText';
import Svg, { Path, Defs, LinearGradient, Stop, RadialGradient, Rect } from 'react-native-svg';
import { loginStyles as styles } from './styles/LoginStyles';

// const { width } = Dimensions.get('window');
const { width, height: screenHeight } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

type LoginProps = {
  setIsAuthenticated: (v: boolean) => void;
  setAccessToken: (token: string | null) => void;
};

const Login = ({ setIsAuthenticated, setAccessToken }: LoginProps) => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validateMobileNumber = (number: string) => /^[0-9]{10}$/.test(number);

  const handleSendOtp = async () => {
    setMobileError('');

    if (!mobileNumber) return setMobileError('Mobile number is required');
    if (!validateMobileNumber(mobileNumber)) return setMobileError('Please enter a valid 10-digit mobile number');

    setIsLoading(true);
    try {
      const data = await apiService.sendOtp(mobileNumber);
      setShowOtpInput(true);
      Alert.alert('Success', `OTP sent successfully! OTP: ${data.otp}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setMobileError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!otp) return setOtpError('OTP is required');
    if (otp.length !== 6) return setOtpError('Please enter a valid 6-digit OTP');

    if (typeof setAccessToken !== 'function' || typeof setIsAuthenticated !== 'function') {
      Alert.alert('Error', 'Authentication setup error. Please restart the app.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiService.verifyOtp(mobileNumber, otp);
      console.log('🔍 Login: Complete login response:', data);
      console.log('🔍 Login: User data from server:', data?.user);
      console.log('🔍 Login: Profile image from server:', data?.user?.profileImage);

      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        apiService.setAccessToken(data.accessToken);

        // Store complete user data including profileImage
        if (data?.user) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
          console.log('Login: Stored complete user data:', data.user);
          console.log('Login: Profile image being stored:', data.user.profileImage);
          console.log('Login: Profile image type:', typeof data.user.profileImage);
          console.log('Login: Profile image length:', data.user.profileImage?.length);
        }

        if (data?.user?.shopId) {
          await AsyncStorage.setItem('shopId', data.user.shopId);
        }

        Alert.alert('Login Successful!', 'Welcome back! You will be redirected to your dashboard.', [
          { text: 'OK', onPress: () => setIsAuthenticated(true) },
        ]);
      } else {
        throw new Error('No access token received from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/tailor-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dim background image slightly */}
        <View style={styles.imageDim} pointerEvents="none" />
        <View style={styles.overlay}>
          {/* Back Arrow */}
          <RegularText onPress={() => navigation.goBack()} style={styles.backArrow}>←</RegularText>

          {/* SVG Wave */}
          <Svg
            height={screenHeight}
            width={width}
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={styles.waveSvg}
          >
            <Defs>
              {/* Soft white highlight from the top edge of the wave */}
              <LinearGradient id="waveTopShadowGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
                <Stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.25" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
              {/* Gentle white glow towards the right crest */}
              <RadialGradient id="waveWhiteGlow" cx="78%" cy="18%" r="35%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              {/* Vibrant white crest glow (localized) */}
              <RadialGradient id="crestGlow" cx="78%" cy="18%" r="28%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
                <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              {/* Green vibrant spread from the wave over image */}
              <RadialGradient id="greenCrestGlow" cx="78%" cy="18%" r="32%">
                <Stop offset="0" stopColor="#2DBE91" stopOpacity="0.55" />
                <Stop offset="0.5" stopColor="#2DBE91" stopOpacity="0.22" />
                <Stop offset="1" stopColor="#2DBE91" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Path
              fill="rgba(45, 190, 145, 0.7)"
              d="M0,40, C850,30 520 ,160 1440,160 L1440,320 L0,320,Z"
            />
            {/* Green spread (glow) above the crest */}
            <Rect x="0" y="0" width="1440" height="240" fill="url(#greenCrestGlow)" />
          </Svg>
          

          {/* Form */}
          <View style={styles.formWrapper}>
            <TitleText style={[styles.loginTitle, styles.shadowText]}>Log In</TitleText>

            <View style={styles.formContainer}>
              <Input
                label="Mobile Number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                error={mobileError}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                variant="underline"
                light={true}
                placeholderTextColor="rgba(255,255,255,0.75)"
                labelStyle={styles.shadowText}
                inputStyle={{ borderBottomWidth: 1 }}
                containerStyle={styles.inputContainer}
              />

              {showOtpInput && (
                <Input
                  label="OTP"
                  value={otp}
                  onChangeText={setOtp}
                  error={otpError}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  variant="underline"
                  light={true}
                  placeholderTextColor="rgba(255,255,255,0.75)"
                  labelStyle={styles.shadowText}
                  containerStyle={styles.inputContainer}
                />
              )}

              {/* <TouchableOpacity style={styles.forgotPassword}>
                <RegularText style={[styles.forgotPasswordText, styles.shadowText]}>Forgot password</RegularText>
              </TouchableOpacity> */}
            </View>

            <View style={styles.buttonContainer}>
              {!showOtpInput ? (
                <Button
                  title="Send OTP"
                  onPress={handleSendOtp}
                  variant="light"
                  disabled={isLoading}
                  style={styles.sendOtpButton}
                  textStyle={styles.sendOtpText}
                />
              ) : (
                <>
                  <Button title="Verify OTP" onPress={handleVerifyOtp} variant="green" disabled={isLoading} textStyle={styles.otpActionText} />
                  <Button title="Resend OTP" onPress={handleSendOtp} variant="light" disabled={isLoading} textStyle={styles.otpActionText} />
                </>
              )}
            </View>
          </View>

          {/* Circular Arrow Button
          <TouchableOpacity
            style={styles.nextButton}
            onPress={showOtpInput ? handleVerifyOtp : handleSendOtp}
            disabled={isLoading}
          >
            <RegularText style={styles.nextArrow}>→</RegularText>
          </TouchableOpacity> */}
        </View>
      </ImageBackground>
    </View>
  );
};

export default Login;
