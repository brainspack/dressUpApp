import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleResetPassword = () => {
    // Add your password reset logic here
    console.log('Reset password for:', email);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          placeholder={t('auth.email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          title={{ key: 'auth.resetPassword' }}
          onPress={handleResetPassword}
          variant="primary"
        />
        <Button
          title={{ key: 'common.back' }}
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

export default ForgotPassword; 