import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';

export interface TeamMeeting {
  id: string;
  date: string;
  team: string;
  timestamp: number;
  isCancelled: boolean;
}

interface TeamMeetingsProps {
  currentMonth: number;
  currentYear: number;
}

const TeamMeetings: React.FC<TeamMeetingsProps> = ({ currentMonth, currentYear }) => {
  const [meetings, setMeetings] = useState<TeamMeeting[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<TeamMeeting | null>(null);
  const [newDate, setNewDate] = useState('');

  // Fixed reference date (first Thursday of 2025 - Week 1)
  const CYCLE_START_DATE = new Date(2025, 0, 2);

  const getWeekCyclePosition = (date: Date): number => {
    const diffInMs = date.getTime() - CYCLE_START_DATE.getTime();
    const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
    return diffInWeeks % 4;
  };

  const generateMeetingId = () => Math.random().toString(36).substr(2, 9);

  const getTeamMeetings = (): TeamMeeting[] => {
    const initialMeetings: TeamMeeting[] = [];
    const firstOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastOfMonth = new Date(currentYear, currentMonth, 0);

    for (let day = 1; day <= lastOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek !== 2 && dayOfWeek !== 4) continue;

      const cyclePosition = getWeekCyclePosition(date);
      let expectedDay: number;
      let team: string;

      switch (cyclePosition) {
        case 0: expectedDay = 4; team = 'Team 1'; break;
        case 1: expectedDay = 4; team = 'Team 2'; break;
        case 2: expectedDay = 2; team = 'Team 1'; break;
        case 3: expectedDay = 2; team = 'Team 2'; break;
        default: continue;
      }

      if (dayOfWeek === expectedDay) {
        initialMeetings.push({
          id: generateMeetingId(),
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
          team,
          timestamp: date.getTime(),
          isCancelled: false
        });
      }
    }

    return initialMeetings.sort((a, b) => a.timestamp - b.timestamp);
  };

  React.useEffect(() => {
    setMeetings(getTeamMeetings());
  }, [currentMonth, currentYear]);

  const handleEditPress = (meeting: TeamMeeting) => {
    setSelectedMeeting(meeting);
    setNewDate(meeting.date);
    setIsEditModalVisible(true);
  };

  const handleCancelPress = (meeting: TeamMeeting) => {
    setSelectedMeeting(meeting);
    setIsCancelModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!selectedMeeting) return;

    setMeetings(meetings.map(m => 
      m.id === selectedMeeting.id 
        ? { ...m, date: newDate, timestamp: new Date(newDate).getTime() }
        : m
    ));
    setIsEditModalVisible(false);
  };

  const handleConfirmCancel = () => {
    if (!selectedMeeting) return;

    setMeetings(meetings.map(m => 
      m.id === selectedMeeting.id 
        ? { ...m, isCancelled: true }
        : m
    ));
    setIsCancelModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Meetings</Text>
      
      {meetings.length > 0 ? (
        meetings.map((meeting) => (
          <View 
            key={meeting.id}
            style={[
              styles.meetingItem,
              meeting.isCancelled && styles.cancelledMeeting
            ]}
          >
            <View style={styles.meetingInfo}>
              <Text style={styles.dateText}>
                {new Date(meeting.timestamp).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
              <Text style={[
                styles.teamText,
                meeting.team === 'Team 1' ? styles.team1 : styles.team2
              ]}>
                {meeting.team}
              </Text>
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.smallButton, styles.editButton]}
                onPress={() => handleEditPress(meeting)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.smallButton, styles.cancelButton]}
                onPress={() => handleCancelPress(meeting)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noMeetingsText}>No team meetings this month</Text>
      )}

      {/* Edit Meeting Modal */}
      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Meeting Date</Text>
          
          <TextInput
            style={styles.input}
            value={newDate}
            onChangeText={setNewDate}
            placeholder="YYYY-MM-DD"
          />
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveEdit}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Meeting Modal */}
      <Modal visible={isCancelModalVisible} animationType="fade" transparent>
        <View style={styles.centeredModal}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationText}>
              Mark this meeting as cancelled?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCancelModalVisible(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  meetingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  cancelledMeeting: {
    backgroundColor: '#ffebee',
    opacity: 0.7,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },
  teamText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  team1: {
    backgroundColor: '#E3F2FD',
    color: '#0D47A1',
  },
  team2: {
    backgroundColor: '#E8F5E9',
    color: '#1B5E20',
  },
  noMeetingsText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  centeredModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmationBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
});

export default TeamMeetings;