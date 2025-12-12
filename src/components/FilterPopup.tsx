import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Date Picker Modal Component (Keep as popup for date selection)
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

  useEffect(() => {
    if (visible) {
      setTempDate(selectedDate);
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  }, [selectedDate, visible]);

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

  if (!visible) return null;

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

// Quick Filter Option
interface QuickFilterOption {
  label: string;
  icon: string;
  value: string;
  getRange: () => {startDate: Date; endDate: Date};
}

// Filter Popup Props
interface FilterPopupProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  visible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date;
  };

  const [startDate, setStartDate] = useState(initialStartDate || getDefaultStartDate());
  const [endDate, setEndDate] = useState(initialEndDate || new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showQuickSelectDropdown, setShowQuickSelectDropdown] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('this_month');

  // Quick filter options
  const quickFilters: QuickFilterOption[] = [
    {
      label: 'Today',
      icon: '📅',
      value: 'today',
      getRange: () => {
        const today = new Date();
        return {startDate: today, endDate: today};
      },
    },
    {
      label: 'Yesterday',
      icon: '⏪',
      value: 'yesterday',
      getRange: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {startDate: yesterday, endDate: yesterday};
      },
    },
    {
      label: 'Last 7 Days',
      icon: '📆',
      value: 'last_7_days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return {startDate: start, endDate: end};
      },
    },
    {
      label: 'Last 30 Days',
      icon: '🗓️',
      value: 'last_30_days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return {startDate: start, endDate: end};
      },
    },
    {
      label: 'This Month',
      icon: '📋',
      value: 'this_month',
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return {startDate: start, endDate: end};
      },
    },
    {
      label: 'Last Month',
      icon: '📑',
      value: 'last_month',
      getRange: () => {
        const end = new Date();
        end.setDate(0); // Last day of previous month
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return {startDate: start, endDate: end};
      },
    },
    {
      label: 'This Year',
      icon: '📊',
      value: 'this_year',
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        return {startDate: start, endDate: end};
      },
    },
    {
      label: 'Custom Range',
      icon: '✏️',
      value: 'custom',
      getRange: () => {
        return {startDate: startDate, endDate: endDate};
      },
    },
  ];

  // Handle animation when visibility changes
  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate || getDefaultStartDate());
      setEndDate(initialEndDate || new Date());
      setShowQuickSelectDropdown(false);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialStartDate, initialEndDate, fadeAnim, slideAnim]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSelectedFilterLabel = () => {
    const filter = quickFilters.find(f => f.value === selectedQuickFilter);
    return filter ? `${filter.icon} ${filter.label}` : 'Select Period';
  };

  const handleQuickFilterSelect = (filter: QuickFilterOption) => {
    setSelectedQuickFilter(filter.value);
    setShowQuickSelectDropdown(false);
    
    if (filter.value !== 'custom') {
      const range = filter.getRange();
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  };

  const handleReset = () => {
    setSelectedQuickFilter('this_month');
    setStartDate(getDefaultStartDate());
    setEndDate(new Date());
  };

  const handleApply = () => {
    onApply(startDate, endDate);
  };

  const handleStartDatePress = () => {
    setSelectedQuickFilter('custom');
    setShowStartPicker(true);
  };

  const handleEndDatePress = () => {
    setSelectedQuickFilter('custom');
    setShowEndPicker(true);
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setShowStartPicker(false);
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setShowEndPicker(false);
  };

  return (
    <>
      {/* Bottom Sheet Modal */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[bottomSheetStyles.backdrop, {opacity: fadeAnim}]} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet Content */}
        <Animated.View
          style={[
            bottomSheetStyles.sheetContainer,
            {transform: [{translateY: slideAnim}]},
          ]}>
          {/* Handle Bar */}
          <View style={bottomSheetStyles.handleContainer}>
            <View style={bottomSheetStyles.handle} />
          </View>

          {/* Header */}
          <View style={bottomSheetStyles.header}>
            <View style={bottomSheetStyles.headerLeft}>
              <Text style={bottomSheetStyles.filterIcon}>📅</Text>
              <Text style={bottomSheetStyles.title}>Date Filter</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={bottomSheetStyles.closeButton}>
              <Text style={bottomSheetStyles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={bottomSheetStyles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            
            {/* Quick Select Dropdown */}
            <View style={bottomSheetStyles.dropdownSection}>
              <Text style={bottomSheetStyles.sectionLabel}>Quick Select</Text>
              
              {/* Dropdown Button */}
              <TouchableOpacity
                style={bottomSheetStyles.dropdownButton}
                onPress={() => setShowQuickSelectDropdown(!showQuickSelectDropdown)}
                activeOpacity={0.7}>
                <Text style={bottomSheetStyles.dropdownButtonText}>
                  {getSelectedFilterLabel()}
                </Text>
                <Text style={bottomSheetStyles.dropdownArrow}>
                  {showQuickSelectDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {/* Dropdown List */}
              {showQuickSelectDropdown && (
                <View style={bottomSheetStyles.dropdownList}>
                  {quickFilters.map((filter, index) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={[
                        bottomSheetStyles.dropdownItem,
                        selectedQuickFilter === filter.value && bottomSheetStyles.dropdownItemSelected,
                        index === quickFilters.length - 1 && bottomSheetStyles.dropdownItemLast,
                      ]}
                      onPress={() => handleQuickFilterSelect(filter)}
                      activeOpacity={0.7}>
                      <Text style={bottomSheetStyles.dropdownItemIcon}>{filter.icon}</Text>
                      <Text style={[
                        bottomSheetStyles.dropdownItemText,
                        selectedQuickFilter === filter.value && bottomSheetStyles.dropdownItemTextSelected,
                      ]}>
                        {filter.label}
                      </Text>
                      {selectedQuickFilter === filter.value && (
                        <Text style={bottomSheetStyles.dropdownCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Date Range Selection - Always visible */}
            <View style={bottomSheetStyles.dateRangeSection}>
              <Text style={bottomSheetStyles.sectionLabel}>
                {selectedQuickFilter === 'custom' ? 'Custom Date Range' : 'Selected Date Range'}
              </Text>
              
              {/* From Date */}
              <View style={bottomSheetStyles.dateGroup}>
                <Text style={bottomSheetStyles.dateLabel}>From Date</Text>
                <TouchableOpacity
                  style={bottomSheetStyles.dateButton}
                  onPress={handleStartDatePress}
                  activeOpacity={0.7}>
                  <Text style={bottomSheetStyles.calendarIcon}>📆</Text>
                  <Text style={bottomSheetStyles.dateText}>{formatDate(startDate)}</Text>
                  <Text style={bottomSheetStyles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* To Date */}
              <View style={bottomSheetStyles.dateGroup}>
                <Text style={bottomSheetStyles.dateLabel}>To Date</Text>
                <TouchableOpacity
                  style={bottomSheetStyles.dateButton}
                  onPress={handleEndDatePress}
                  activeOpacity={0.7}>
                  <Text style={bottomSheetStyles.calendarIcon}>📆</Text>
                  <Text style={bottomSheetStyles.dateText}>{formatDate(endDate)}</Text>
                  <Text style={bottomSheetStyles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={bottomSheetStyles.actions}>
            <TouchableOpacity
              style={bottomSheetStyles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.7}>
              <Text style={bottomSheetStyles.resetBtnText}>↻ Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={bottomSheetStyles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.7}>
              <Text style={bottomSheetStyles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        onSelectDate={handleStartDateSelect}
        selectedDate={startDate}
        title="Select Start Date"
      />
      <DatePickerModal
        visible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        onSelectDate={handleEndDateSelect}
        selectedDate={endDate}
        title="Select End Date"
      />
    </>
  );
};

// Bottom Sheet Styles
const bottomSheetStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    fontSize: 18,
    color: '#64748b',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Dropdown Section
  dropdownSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#293B50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#ea611810',
  },
  dropdownItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    color: '#293B50',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#ea6118',
  },
  dropdownCheckmark: {
    fontSize: 16,
    color: '#ea6118',
    fontWeight: '700',
  },
  // Date Range
  dateRangeSection: {
    marginBottom: 20,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 13,
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
    fontSize: 12,
    color: '#64748b',
  },
  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
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
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#ea6118',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
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
