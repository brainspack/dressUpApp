import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      Alert.alert('Success', 'Registration successful!');
      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Input
          label="Name"
          value={name}
          onChangeText={text => { console.log('Name input:', text); setName(text); }}
          error={nameError}
          placeholder="Enter your name"
          autoCapitalize="words"
        />
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
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
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

export default Register; 