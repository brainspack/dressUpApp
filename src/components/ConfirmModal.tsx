import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RegularText, TitleText } from './CustomText';
import colors from '../constants/colors';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  console.log('ConfirmModal rendered with visible:', visible);
  
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TitleText style={styles.title}>{title}</TitleText>
          <RegularText style={styles.message}>{message}</RegularText>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn]} onPress={onCancel} activeOpacity={0.85}>
              <LinearGradient colors={["#94a3b8", "#64748b", "#475569"]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.gradientBtn}>
                <RegularText style={styles.btnText}>{cancelText}</RegularText>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn]} onPress={onConfirm} activeOpacity={0.85}>
              <LinearGradient colors={["#229B73", "#1a8f6e", "#000000"]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.gradientBtn}>
                <RegularText style={styles.btnText}>{confirmText}</RegularText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  message: {
    color: colors.textSecondary,
    marginBottom: 20,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderRadius: 10,
  },
  gradientBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: colors.white,
    fontWeight: '700',
  }
});

export default ConfirmModal;