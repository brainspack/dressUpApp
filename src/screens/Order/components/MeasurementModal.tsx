import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { RegularText, TitleText } from '../../../components/CustomText';
import { styles } from '../styles/AddOrderStyles';
import Button from '../../../components/Button';
import { measurementImages, measurementLabels } from '../utils/measurementUtils';

interface MeasurementModalProps {
  isVisible: boolean;
  currentMeasurement: any;
  setCurrentMeasurement: (measurement: any) => void;
  requiredMeasurements: string[];
  onClose: () => void;
  onSave: () => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  isVisible,
  currentMeasurement,
  setCurrentMeasurement,
  requiredMeasurements,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedMeasurementField, setSelectedMeasurementField] = useState('chest');

  if (!isVisible) return null;

  const addField = (key: string, labelKey: string) => (
    <View style={styles.measurementField} key={key}>
      <RegularText style={styles.measurementLabel}>{t(labelKey)}</RegularText>
      <TextInput
        style={styles.measurementInput}
        value={(currentMeasurement as any)[key]}
        onChangeText={(text) => setCurrentMeasurement({ ...(currentMeasurement as any), [key]: text } as any)}
        placeholder="0.0"
        keyboardType="numeric"
        onFocus={() => setSelectedMeasurementField(key)}
      />
    </View>
  );

  const renderMeasurementFields = () => {
    const rows: React.ReactNode[] = [];
    const visible = requiredMeasurements;
    
    for (let i = 0; i < visible.length; i += 2) {
      const left = visible[i];
      const right = visible[i + 1];
      rows.push(
        <View style={styles.measurementRow} key={`row-${i}`}>
          {addField(left, measurementLabels[left] || `order.${left}`)}
          {right ? addField(right, measurementLabels[right] || `order.${right}`) : <View style={styles.measurementField} />}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={[styles.measurementModalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
      <View style={styles.measurementModalContent}>
        <TitleText style={styles.modalTitle}>{t('order.recordMeasurement')}</TitleText>
        
        {/* Body Diagram Section */}
        <View style={styles.bodyDiagramContainer}>
          <Image
            source={measurementImages[selectedMeasurementField] || measurementImages.chest}
            style={styles.bodyDiagram}
            resizeMode="contain"
          />
        </View>

        {/* Scrollable Measurement Inputs */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollableFields}
          contentContainerStyle={styles.scrollableFieldsContent}
        >
          <View style={styles.measurementInputsContainer}>
            {renderMeasurementFields()}
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.modalButtons}>
          <Button
            title={t('common.cancel')}
            variant="light"
            onPress={onClose}
            height={48}
            style={{ borderRadius: 12, flex: 1, marginRight: 6 }}
          />
          <Button
            title={t('order.save')}
            variant="gradient"
            onPress={onSave}
            height={48}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            style={{ borderRadius: 12, flex: 1, marginLeft: 6 }}
          />
        </View>
      </View>
    </View>
  );
};
