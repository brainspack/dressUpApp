import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/Input';
import Button from '../../components/Button';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const Register = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleRegister = () => {
    // Add your registration logic here
    console.log('Register with:', { name, email, password });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Input
          label={t('profile.name')}
          value={name}
          onChangeText={setName}
          error={nameError}
          placeholder={t('profile.name')}
          autoCapitalize="words"
        />
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
        <Input
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmPasswordError}
          placeholder={t('auth.confirmPassword')}
          secureTextEntry
        />
        <Button
          title={{ key: 'auth.signup' }}
          onPress={handleRegister}
          variant="primary"
        />
        <Button
          title={{ key: 'auth.login' }}
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