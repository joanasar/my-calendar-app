import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeeklySummaryPanelProps {
  summaries: {
    weekNumber: number;
    totalHours: number;
    overtimeHours: number;
    dates: string[];
  }[];
  currentWeek: number;
  currentMonth: number;
  currentYear: number;
}

const WeeklySummaryPanel: React.FC<WeeklySummaryPanelProps> = ({ 
  summaries, 
  currentWeek,
  currentMonth,
  currentYear
}) => {
  // Get all weeks in current month
  const weeksInMonth = summaries.filter(summary => {
    const firstDate = new Date(summary.dates[0]);
    return (
      firstDate.getMonth() + 1 === currentMonth && 
      firstDate.getFullYear() === currentYear
    );
  });

  // Calculate monthly totals
  const monthlyTotal = weeksInMonth.reduce((total, week) => total + week.totalHours, 0);
  const weeklyThreshold = 30 * weeksInMonth.length;
  const monthlyOvertime = Math.max(0, monthlyTotal - weeklyThreshold);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Summary - {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}</Text>
      
      {/* Weekly breakdown */}
      {weeksInMonth.map(week => (
        <View key={week.weekNumber} style={styles.weekRow}>
          <Text>Week {week.weekNumber}:</Text>
          <Text style={styles.hoursText}>{week.totalHours.toFixed(2)} hours</Text>
        </View>
      ))}
      
      {/* Monthly totals */}
      <View style={styles.summaryItem}>
        <Text>Monthly Total:</Text>
        <Text style={styles.hoursText}>{monthlyTotal.toFixed(2)} hours</Text>
      </View>
      
      <View style={styles.summaryItem}>
        <Text>Monthly Overtime:</Text>
        <Text style={[
          styles.hoursText,
          monthlyOvertime > 0 ? styles.overtime : styles.noOvertime
        ]}>
          {monthlyOvertime.toFixed(2)} hours
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  hoursText: {
    fontWeight: 'bold',
  },
  overtime: {
    color: 'red',
  },
  noOvertime: {
    color: 'green',
  },
});

export default WeeklySummaryPanel;