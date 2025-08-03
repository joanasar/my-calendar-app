import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import WorkingHoursModal from './WorkingHoursModal';
import WeeklySummaryPanel from './WeeklySummaryPanel';
import TeamMeetings from './TeamMeetings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong with the calendar
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// LocaleConfig setup
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

interface MarkedDate {
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
  weekNumber?: number;
  customStyles?: {
    container?: object;
    text?: object;
  };
}

interface WorkingHours {
  start: string;
  end: string;
}

interface WeeklySummary {
  weekNumber: number;
  totalHours: number;
  overtimeHours: number;
  dates: string[];
  month: number;
  year: number;
}

const defaultWorkingHours: WorkingHours = { start: '', end: '' };

// Custom Header Component
const CustomHeader = ({ month, year }: { month: string; year: number }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>
        {month} {year}
      </Text>
    </View>
  );
};

const CalendarWithWeeks = () => {
  const [workingHoursByDate, setWorkingHoursByDate] = useState<{
    [date: string]: WorkingHours;
  }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);

  // Load saved data when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('workingHoursData');
        if (savedData) {
          setWorkingHoursByDate(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    
    loadSavedData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(
          'workingHoursData',
          JSON.stringify(workingHoursByDate)
        );
      } catch (error) {
        console.error('Failed to save data', error);
      }
    };
    
    saveData();
  }, [workingHoursByDate]);

  // Current date info helper
  const getCurrentDate = () => {
    const date = new Date();
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      dateString: date.toISOString().split('T')[0],
    };
  };
  const currentDate = getCurrentDate();

  // Week number calculation (ISO)
  const getISOWeekNumber = (date: Date): number => {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(
      tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7)
    );
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((tempDate.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  };

  // Generate week number markings for the year
  const generateWeekNumbers = () => {
    const marked: { [date: string]: MarkedDate } = {};
    let date = new Date(currentDate.year, 0, 1);

    // Find first Monday of the year
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }

    for (let week = 0; week < 52; week++) {
      const weekNumber = getISOWeekNumber(date);
      const dateStr = date.toISOString().split('T')[0];

      marked[dateStr] = {
        startingDay: true,
        color: '#f8f8f8',
        textColor: '#1a73e8',
        weekNumber,
        customStyles: {
          container: {
            backgroundColor: '#f8f8f8',
          },
          text: {
            color: '#1a73e8',
            fontWeight: 'bold',
          },
        },
      };

      date.setDate(date.getDate() + 7);
    }
    return marked;
  };

  // Calculate weekly summaries
  const calculateWeeklySummaries = (): WeeklySummary[] => {
    const summaries: { [weekNumber: number]: WeeklySummary } = {};

    Object.entries(workingHoursByDate).forEach(([dateStr, hours]) => {
      if (hours.start && hours.end) {
        const date = new Date(dateStr);
        const weekNumber = getISOWeekNumber(date);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        // Calculate hours worked
        const [startHour, startMinute] = hours.start.split(':').map(Number);
        const [endHour, endMinute] = hours.end.split(':').map(Number);
        const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        const hoursWorked = totalMinutes / 60;

        if (!summaries[weekNumber]) {
          summaries[weekNumber] = {
            weekNumber,
            totalHours: 0,
            overtimeHours: 0,
            dates: [],
            month,
            year
          };
        }

        summaries[weekNumber].totalHours += hoursWorked;
        summaries[weekNumber].dates.push(dateStr);
      }
    });

    // Calculate overtime
    Object.values(summaries).forEach(summary => {
      summary.overtimeHours = Math.max(0, summary.totalHours - 30);
    });

    return Object.values(summaries).sort((a, b) => a.weekNumber - b.weekNumber);
  };

  // Combine week number markings + working hours markings
  const buildMarkedDates = () => {
    const weeks = generateWeekNumbers();
    const combined: { [date: string]: MarkedDate } = { ...weeks };

    // Mark dates that have working hours
    Object.entries(workingHoursByDate).forEach(([dateStr]) => {
      combined[dateStr] = {
        ...(combined[dateStr] || {}),
        customStyles: {
          container: {
            backgroundColor: '#d1e7dd',
            borderRadius: 20,
          },
          text: {
            color: '#0f5132',
            fontWeight: 'bold',
          },
        },
      };
    });

    return combined;
  };

  const [markedDates, setMarkedDates] = useState<{ [date: string]: MarkedDate }>({});

  // Update markings and summaries when working hours change
  useEffect(() => {
    const marked = buildMarkedDates();
    setMarkedDates(marked);
    setWeeklySummaries(calculateWeeklySummaries());
  }, [workingHoursByDate]);

  // Day press handler
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setIsModalVisible(true);
  };

  // Save working hours for selected date
  const handleSaveHours = (hours: WorkingHours) => {
    if (selectedDate) {
      setWorkingHoursByDate((prev) => ({
        ...prev,
        [selectedDate]: hours,
      }));
    }
    setIsModalVisible(false);
  };

  // Remove working hours for selected date
  const handleRemoveHours = () => {
    if (selectedDate) {
      setWorkingHoursByDate((prev) => {
        const copy = { ...prev };
        delete copy[selectedDate];
        return copy;
      });
    }
    setIsModalVisible(false);
  };

  // Cancel modal without changes
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Render week number for the first day of each week
  const renderWeekNumber = (weekNumber: number) => {
    return (
      <View style={styles.weekNumberContainer}>
        <Text style={styles.weekNumberText}>{weekNumber}</Text>
      </View>
    );
  };

  // Helper function to check if a day is weekend
  const isWeekend = (dayOfWeek: number) => {
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  };

  // Custom day component
  const DayComponent = ({
    date,
    state,
    marking,
  }: {
    date?: DateData;
    state?: string;
    marking?: MarkedDate;
  }) => {
    if (!date) {
      return (
        <View style={styles.dayContainer}>
          <Text style={styles.dayText}>-</Text>
        </View>
      );
    }

    const dateStr = date.dateString;
    const customStyles = markedDates[dateStr]?.customStyles || {};
    const isToday = dateStr === currentDate.dateString;
    const isDisabled = state === 'disabled';
    const weekNumber = marking?.weekNumber;
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    const isWeekendDay = isWeekend(dayOfWeek);
    const isFirstDayOfWeek = dateObj.getDay() === 1; // Monday is day 1 (firstDay=1)

    return (
      <View style={styles.dayWrapper}>
        {isFirstDayOfWeek && renderWeekNumber(weekNumber || getISOWeekNumber(dateObj))}
        <TouchableOpacity
          style={[
            styles.dayContainer, 
            customStyles.container, 
            isDisabled && styles.disabledDay,
            isWeekendDay && styles.weekendDay,
          ]}
          onPress={() => {
            if (!isDisabled) {
              handleDayPress({ dateString: dateStr });
            }
          }}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.dayText,
              customStyles.text,
              isToday ? styles.todayText : null,
              isDisabled ? styles.disabledText : null,
              isWeekendDay ? styles.weekendText : null,
            ]}
          >
            {date.day}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Calendar
          current={currentDate.dateString}
          markedDates={markedDates}
          dayComponent={DayComponent}
          firstDay={1}
          hideExtraDays={false}
          markingType={'custom'}
          onDayPress={handleDayPress}
          onMonthChange={(date) => {
            setCurrentMonth(date.month);
            setCurrentYear(date.year);
          }}
          renderHeader={(date) => (
            <CustomHeader 
              month={date.toString('MMMM')} 
              year={date.getFullYear()} 
            />
          )}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: 'orange',
            monthTextColor: 'black',
            indicatorColor: 'blue',
            textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
            textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
            textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
            // @ts-ignore - This is a valid property but not in the type definitions
            'stylesheet.calendar.header': {
              header: {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
              },
              monthText: {
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
              },
            },
          }}
        />

        <WeeklySummaryPanel 
          summaries={weeklySummaries}
          currentWeek={currentWeek}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
        <TeamMeetings 
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
        {/* Working Hours Modal */}
        {selectedDate && (
          <WorkingHoursModal
            visible={isModalVisible}
            date={selectedDate}
            initialHours={workingHoursByDate[selectedDate] || defaultWorkingHours}
            onSave={handleSaveHours}
            onRemove={handleRemoveHours}
            onCancel={handleCancel}
          />
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  dayWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekNumberContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumberText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  dayText: {
    fontSize: 14,
  },
  disabledDay: {
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#ccc',
  },
  todayText: {
    color: '#00adf5',
    fontWeight: 'bold',
  },
  weekendDay: {
    backgroundColor: '#f5f9ff', // Light blue background for weekends
  },
  weekendText: {
    color: '#1a73e8', // Blue text for weekends
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontWeight: 'bold',
    color: 'red',
    fontSize: 16,
  },
});

export default CalendarWithWeeks;