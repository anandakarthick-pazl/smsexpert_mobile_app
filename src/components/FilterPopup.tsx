import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

// Date Picker Modal Component
interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  title: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  title,
}) => {
  const [tempDate, setTempDate] = useState(selectedDate);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setTempDate(newDate);
  };

  const confirmDate = () => {
    onSelectDate(tempDate);
    onClose();
  };

  const isSelectedDay = (day: number) => {
    return (
      tempDate.getDate() === day &&
      tempDate.getMonth() === currentMonth &&
      tempDate.getFullYear() === currentYear
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={datePickerStyles.overlay}>
        <View style={datePickerStyles.container}>
          <View style={datePickerStyles.header}>
            <Text style={datePickerStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={datePickerStyles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={datePickerStyles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={datePickerStyles.navBtn}>
              <Text style={datePickerStyles.navBtnText}>◀</Text>
            </TouchableOpacity>
            <Text style={datePickerStyles.monthText}>
              {months[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={datePickerStyles.navBtn}>
              <Text style={datePickerStyles.navBtnText}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={datePickerStyles.dayHeaders}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
              <Text key={index} style={datePickerStyles.dayHeader}>{day}</Text>
            ))}
          </View>

          <View style={datePickerStyles.calendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  datePickerStyles.dayCell,
                  day && isSelectedDay(day) && datePickerStyles.selectedDay,
                  day && isToday(day) && !isSelectedDay(day) && datePickerStyles.todayDay,
                ]}
                onPress={() => day && selectDay(day)}
                disabled={!day}>
                <Text
                  style={[
                    datePickerStyles.dayText,
                    day && isSelectedDay(day) && datePickerStyles.selectedDayText,
                    day && isToday(day) && !isSelectedDay(day) && datePickerStyles.todayDayText,
                  ]}>
                  {day || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={datePickerStyles.actions}>
            <TouchableOpacity
              style={datePickerStyles.cancelBtn}
              onPress={onClose}>
              <Text style={datePickerStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={datePickerStyles.confirmBtn}
              onPress={confirmDate}>
              <Text style={datePickerStyles.confirmBtnText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Filter Popup Props
interface FilterPopupProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showMainPopup, setShowMainPopup] = useState(true);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleReset = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
  };

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  const handleStartDatePress = () => {
    setShowMainPopup(false);
    setTimeout(() => setShowStartPicker(true), 200);
  };

  const handleEndDatePress = () => {
    setShowMainPopup(false);
    setTimeout(() => setShowEndPicker(true), 200);
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setShowStartPicker(false);
    setTimeout(() => setShowMainPopup(true), 200);
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setShowEndPicker(false);
    setTimeout(() => setShowMainPopup(true), 200);
  };

  const handleStartPickerClose = () => {
    setShowStartPicker(false);
    setTimeout(() => setShowMainPopup(true), 200);
  };

  const handleEndPickerClose = () => {
    setShowEndPicker(false);
    setTimeout(() => setShowMainPopup(true), 200);
  };

  if (!visible) return null;

  return (
    <>
      {/* Main Filter Popup */}
      <Modal
        visible={visible && showMainPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={filterStyles.overlay}>
            <TouchableWithoutFeedback>
              <View style={filterStyles.popup}>
                {/* Header */}
                <View style={filterStyles.header}>
                  <View style={filterStyles.headerLeft}>
                    <Text style={filterStyles.filterIcon}>📅</Text>
                    <Text style={filterStyles.title}>Date Filter</Text>
                  </View>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={filterStyles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* From Date */}
                <View style={filterStyles.dateGroup}>
                  <Text style={filterStyles.dateLabel}>From Date</Text>
                  <TouchableOpacity
                    style={filterStyles.dateButton}
                    onPress={handleStartDatePress}
                    activeOpacity={0.7}>
                    <Text style={filterStyles.calendarIcon}>📆</Text>
                    <Text style={filterStyles.dateText}>{formatDate(startDate)}</Text>
                    <Text style={filterStyles.dropdownIcon}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* To Date */}
                <View style={filterStyles.dateGroup}>
                  <Text style={filterStyles.dateLabel}>To Date</Text>
                  <TouchableOpacity
                    style={filterStyles.dateButton}
                    onPress={handleEndDatePress}
                    activeOpacity={0.7}>
                    <Text style={filterStyles.calendarIcon}>📆</Text>
                    <Text style={filterStyles.dateText}>{formatDate(endDate)}</Text>
                    <Text style={filterStyles.dropdownIcon}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={filterStyles.actions}>
                  <TouchableOpacity
                    style={filterStyles.resetBtn}
                    onPress={handleReset}
                    activeOpacity={0.7}>
                    <Text style={filterStyles.resetBtnText}>↻ Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={filterStyles.applyBtn}
                    onPress={handleApply}
                    activeOpacity={0.7}>
                    <Text style={filterStyles.applyBtnText}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showStartPicker}
        onClose={handleStartPickerClose}
        onSelectDate={handleStartDateSelect}
        selectedDate={startDate}
        title="Select Start Date"
      />
      <DatePickerModal
        visible={showEndPicker}
        onClose={handleEndPickerClose}
        onSelectDate={handleEndDateSelect}
        selectedDate={endDate}
        title="Select End Date"
      />
    </>
  );
};

// Filter Popup Styles
const filterStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#293B50',
  },
  closeBtn: {
    fontSize: 22,
    color: '#64748b',
    padding: 4,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  calendarIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#293B50',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 14,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ea6118',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});

// Date Picker Styles
const datePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 10,
  },
  navBtnText: {
    fontSize: 18,
    color: '#ea6118',
    fontWeight: '600',
  },
  monthText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#293B50',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  dayText: {
    fontSize: 15,
    color: '#293B50',
  },
  selectedDay: {
    backgroundColor: '#ea6118',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  todayDay: {
    backgroundColor: '#e2e8f0',
  },
  todayDayText: {
    color: '#293B50',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#ea6118',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default FilterPopup;
