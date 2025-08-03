import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface WorkingHours {
  start: string;
  end: string;
}

interface WorkingHoursModalProps {
  visible: boolean;
  date: string;
  initialHours: WorkingHours;
  onSave: (hours: WorkingHours) => void;
  onRemove: () => void;
  onCancel: () => void;
}

const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  visible,
  date,
  initialHours,
  onSave,
  onRemove,
  onCancel,
}) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialHours);

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.length > 4) {
      numbers = numbers.substring(0, 4);
    }
    
    let formatted = numbers;
    if (numbers.length > 2) {
      formatted = `${numbers.substring(0, 2)}:${numbers.substring(2)}`;
    }
    
    if (numbers.length >= 2) {
      const hours = parseInt(numbers.substring(0, 2), 10);
      if (hours > 23) {
        formatted = `23${numbers.length > 2 ? ':' + numbers.substring(2) : ''}`;
      }
    }
    
    if (numbers.length >= 4) {
      const minutes = parseInt(numbers.substring(2), 10);
      if (minutes > 59) {
        formatted = `${numbers.substring(0, 2)}:59`;
      }
    }
    
    setWorkingHours(prev => ({ ...prev, [type]: formatted }));
  };

  useEffect(() => {
    if (visible) {
      setWorkingHours(initialHours);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a time log for {date}</Text>
          
          <View style={styles.inputsRow}>
            <View style={styles.timeInputContainer}>
              <Text>Start Time:</Text>
              <TextInput
                style={styles.timeInput}
                value={workingHours.start}
                onChangeText={(text) => handleTimeChange('start', text)}
                placeholder="HHMM"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            
            <View style={styles.timeInputContainer}>
              <Text>End Time:</Text>
              <TextInput
                style={styles.timeInput}
                value={workingHours.end}
                onChangeText={(text) => handleTimeChange('end', text)}
                placeholder="HHMM"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={() => onSave(workingHours)}
              disabled={!workingHours.start || !workingHours.end}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.removeButton]}
              onPress={onRemove}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    width: '48%', // Made 50% shorter
    marginBottom: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 3,
    textAlign: 'center',
    fontSize: 14,
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 4,
    paddingHorizontal: 0,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginHorizontal: 2,
    alignItems: 'center',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WorkingHoursModal;