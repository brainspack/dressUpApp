import React, { useState } from 'react';
import { View, StyleSheet, Alert, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegularText, TitleText } from '../../components/CustomText';
import Svg, { Path, Defs, LinearGradient, Stop, RadialGradient, Rect } from 'react-native-svg';

const { width, height: screenHeight } = Dimensions.get('window');

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

type RegisterProps = {
  setIsAuthenticated: (v: boolean) => void;
  setAccessToken: (token: string | null) => void;
};

const Register = ({ setIsAuthenticated, setAccessToken }: RegisterProps) => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validateMobileNumber = (number: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  };

  const handleSendOtp = async () => {
    setMobileError('');
    setNameError('');
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    if (!mobileNumber) {
      setMobileError('Mobile number is required');
      return;
    }
    if (!validateMobileNumber(mobileNumber)) {
      setMobileError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiService.sendOtp(mobileNumber);
      setShowOtpInput(true);
      Alert.alert('Success', `OTP sent successfully! OTP: ${data.otp}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!otp) {
      setOtpError('OTP is required');
      return;
    }
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiService.verifyOtp(mobileNumber, otp);
      // Store tokens and user data
      console.log('Registration successful:', data);
      setAccessToken(data.accessToken);
      apiService.setAccessToken(data.accessToken);
      
      // Store complete user data including profileImage
      if (data?.user) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
        console.log('Register: Stored complete user data:', data.user);
      }
      
      const shopId = (data as any)?.user?.shopId || null;
      console.log('[Register] saving shopId from auth response =', shopId);
      if (shopId) {
        await AsyncStorage.setItem('shopId', shopId);
      } else {
        await AsyncStorage.removeItem('shopId');
      }
      Alert.alert('Success', 'Registration successful!');
      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Invalid OTP');
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
              {/* Vibrant green spread from crest */}
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
            <Rect x="0" y="0" width="1440" height="240" fill="url(#greenCrestGlow)" />
          </Svg>

          {/* Form */}
          <View style={styles.formWrapper}>
            <TitleText style={[styles.title, styles.shadowText]}>Register</TitleText>

            <View style={styles.formContainer}>
              <Input
                label="Name"
                value={name}
                onChangeText={text => { console.log('Name input:', text); setName(text); }}
                error={nameError}
                placeholder="Enter your name"
                autoCapitalize="words"
                variant="underline"
                light
                labelStyle={styles.shadowText}
                placeholderTextColor="rgba(255,255,255,0.75)"
                containerStyle={styles.inputContainer}
              />
              <Input
                label="Mobile Number"
                value={mobileNumber}
                onChangeText={text => { console.log('Mobile input:', text); setMobileNumber(text); }}
                error={mobileError}
                placeholder="Enter 10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                variant="underline"
                light
                placeholderTextColor="rgba(255,255,255,0.75)"
                labelStyle={styles.shadowText}
                inputStyle={{ borderBottomWidth: 1 }}
                containerStyle={styles.inputContainer}
              />

              {showOtpInput && (
                <Input
                  label="OTP"
                  value={otp}
                  onChangeText={text => { console.log('OTP input:', text); setOtp(text); }}
                  error={otpError}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  variant="underline"
                  light
                  placeholderTextColor="rgba(255,255,255,0.75)"
                  labelStyle={styles.shadowText}
                  containerStyle={styles.inputContainer}
                />
              )}
            </View>

            <View style={styles.buttonContainer}>
              {!showOtpInput ? (
                <Button title="Send OTP" onPress={handleSendOtp} variant="green" disabled={isLoading} style={styles.sendOtpButton} textStyle={styles.sendOtpText} />
              ) : (
                <>
                  <Button title="Verify OTP" onPress={handleVerifyOtp} variant="green" disabled={isLoading} textStyle={styles.otpActionText} />
                  <Button title="Resend OTP" onPress={handleSendOtp} variant="light" disabled={isLoading} textStyle={styles.otpActionText} />
                </>
              )}
              <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="light" style={styles.sendOtpButton} textStyle={styles.otpActionText}/>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default Register; 