import React, { useState } from 'react';
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Working Hours for {date}</Text>
          
          <View style={styles.timeInputContainer}>
            <Text>Start Time:</Text>
            <TextInput
              style={styles.timeInput}
              value={workingHours.start}
              onChangeText={(text) => setWorkingHours({...workingHours, start: text})}
              placeholder="HH:MM"
            />
          </View>
          
          <View style={styles.timeInputContainer}>
            <Text>End Time:</Text>
            <TextInput
              style={styles.timeInput}
              value={workingHours.end}
              onChangeText={(text) => setWorkingHours({...workingHours, end: text})}
              placeholder="HH:MM"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={() => onSave(workingHours)}
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
  timeInputContainer: {
    marginBottom: 15,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
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