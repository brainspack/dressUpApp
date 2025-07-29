import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = () => {
    // Add your login logic here
    console.log('Login with:', { email, password });
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
        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          placeholder={t('auth.password')}
          secureTextEntry
        />
        <Button
          title={{ key: 'auth.login' }}
          onPress={handleLogin}
          variant="primary"
        />
        <Button
          title={{ key: 'auth.forgotPassword' }}
          onPress={() => navigation.navigate('ForgotPassword')}
          variant="secondary"
        />
        <Button
          title={{ key: 'auth.signup' }}
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