import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import apiService from '../../services/api';

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

  const validateMobileNumber = (number: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  };

  const handleSendOtp = async () => {
    setMobileError('');
    
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
      console.log('Sending OTP to:', mobileNumber);
      const data = await apiService.sendOtp(mobileNumber);
      console.log('OTP sent successfully:', data);
      setShowOtpInput(true);
      Alert.alert('Success', `OTP sent successfully! OTP: ${data.otp}`);
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      Alert.alert('Error', errorMessage);
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
      console.log('Login successful:', data);
      setAccessToken(data.accessToken);
      apiService.setAccessToken(data.accessToken);
      Alert.alert('Success', 'Login successful!');
      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'red', margin: 10, height: 40 }}
        placeholder="Test plain input"
        onChangeText={text => { console.log('Plain input:', text); }}
      />
      <View style={styles.form}>
        <Input
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={text => { console.log('Mobile input:', text); setMobileNumber(text); }}
          error={mobileError}
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
        />
        
        {!showOtpInput ? (
          <Button
            title="Send OTP"
            onPress={handleSendOtp}
            variant="primary"
            disabled={isLoading}
          />
        ) : (
          <>
            <Input
              label="OTP"
              value={otp}
              onChangeText={text => { console.log('OTP input:', text); setOtp(text); }}
              error={otpError}
              placeholder="Enter 6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button
              title="Verify OTP"
              onPress={handleVerifyOtp}
              variant="primary"
              disabled={isLoading}
            />
            <Button
              title="Resend OTP"
              onPress={handleSendOtp}
              variant="secondary"
              disabled={isLoading}
            />
          </>
        )}
        
        <Button
          title="Back to Register"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  form: {
    gap: 16,
  },
});

export default Login; 