import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

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

// Filter Popup Modal Component
interface FilterPopupProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  onStartDatePress: () => void;
  onEndDatePress: () => void;
  onReset: () => void;
  onApply: () => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  visible,
  onClose,
  startDate,
  endDate,
  onStartDatePress,
  onEndDatePress,
  onReset,
  onApply,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
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
                  onPress={onStartDatePress}
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
                  onPress={onEndDatePress}
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
                  onPress={onReset}
                  activeOpacity={0.7}>
                  <Text style={filterStyles.resetBtnText}>↻ Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={filterStyles.applyBtn}
                  onPress={onApply}
                  activeOpacity={0.7}>
                  <Text style={filterStyles.applyBtnText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  trend,
  trendUp,
  bgColor,
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, {backgroundColor: bgColor}]}>
      <Text style={styles.statIconText}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && (
      <View style={styles.trendContainer}>
        <Text style={trendUp ? styles.trendUp : styles.trendDown}>
          {trendUp ? '↑' : '↓'} {trend}
        </Text>
      </View>
    )}
  </View>
);

interface QuickLinkProps {
  icon: string;
  title: string;
  bgColor: string;
  onPress: () => void;
}

const QuickLink: React.FC<QuickLinkProps> = ({icon, title, bgColor, onPress}) => (
  <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.quickLinkIcon, {backgroundColor: bgColor}]}>
      <Text style={styles.quickLinkIconText}>{icon}</Text>
    </View>
    <Text style={styles.quickLinkTitle}>{title}</Text>
    <Text style={styles.quickLinkArrow}>→</Text>
  </TouchableOpacity>
);

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({navigation}) => {
  // Filter Popup State
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  
  // Date Range State
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleFilterPress = () => {
    setShowFilterPopup(true);
  };

  const handleApplyFilter = () => {
    if (startDate > endDate) {
      Alert.alert('Invalid Date Range', 'Start date cannot be after end date');
      return;
    }
    setShowFilterPopup(false);
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };
    Alert.alert(
      'Filter Applied',
      `Showing data from ${formatDate(startDate)} to ${formatDate(endDate)}`
    );
  };

  const handleResetFilter = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
  };

  const handleStartDatePress = () => {
    setShowFilterPopup(false);
    setTimeout(() => setShowStartPicker(true), 300);
  };

  const handleEndDatePress = () => {
    setShowFilterPopup(false);
    setTimeout(() => setShowEndPicker(true), 300);
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setShowStartPicker(false);
    setTimeout(() => setShowFilterPopup(true), 300);
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setShowEndPicker(false);
    setTimeout(() => setShowFilterPopup(true), 300);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      {/* Header with Filter Icon */}
      <Header
        title="Dashboard"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        onFilterPress={handleFilterPress}
        notificationCount={3}
        showWallet={true}
        walletBalance="£6859"
        showFilter={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back! 🚀</Text>
          <Text style={styles.welcomeSubtitle}>
            Here's your SMS Expert dashboard overview
          </Text>
          <Text style={styles.welcomeDate}>{currentDate}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="📤"
            value="20"
            label="Total Sent"
            trend="+0 today"
            trendUp={true}
            bgColor="#293B50"
          />
          <StatCard
            icon="✅"
            value="12"
            label="Delivered"
            trend="60%"
            trendUp={true}
            bgColor="#16a34a"
          />
          <StatCard
            icon="⏳"
            value="8"
            label="Pending"
            bgColor="#f59e0b"
          />
          <StatCard
            icon="❌"
            value="0"
            label="Failed"
            trend="0%"
            trendUp={true}
            bgColor="#dc2626"
          />
        </View>

        {/* Financial Stats */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.financialGrid}>
            <View style={styles.financialCard}>
              <Text style={styles.financialIcon}>💰</Text>
              <Text style={styles.financialValue}>£17.40</Text>
              <Text style={styles.financialLabel}>Total Spent</Text>
            </View>
            <View style={styles.financialCard}>
              <Text style={styles.financialIcon}>💳</Text>
              <Text style={styles.financialValue}>£6,859</Text>
              <Text style={styles.financialLabel}>Wallet Balance</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <QuickLink
            icon="📤"
            title="Send SMS"
            bgColor="#293B50"
            onPress={() => navigation.navigate('SendSMS')}
          />
          <QuickLink
            icon="🛒"
            title="Buy SMS"
            bgColor="#16a34a"
            onPress={() => navigation.navigate('SMSWallet')}
          />
          <QuickLink
            icon="📜"
            title="Sent SMS History"
            bgColor="#0891b2"
            onPress={() => navigation.navigate('SentSMS')}
          />
          <QuickLink
            icon="👥"
            title="Manage Groups"
            bgColor="#f59e0b"
            onPress={() => navigation.navigate('Groups')}
          />
        </View>
      </ScrollView>

      {/* Filter Popup Modal */}
      <FilterPopup
        visible={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        startDate={startDate}
        endDate={endDate}
        onStartDatePress={handleStartDatePress}
        onEndDatePress={handleEndDatePress}
        onReset={handleResetFilter}
        onApply={handleApplyFilter}
      />

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showStartPicker}
        onClose={() => {
          setShowStartPicker(false);
          setTimeout(() => setShowFilterPopup(true), 300);
        }}
        onSelectDate={handleStartDateSelect}
        selectedDate={startDate}
        title="Select Start Date"
      />
      <DatePickerModal
        visible={showEndPicker}
        onClose={() => {
          setShowEndPicker(false);
          setTimeout(() => setShowFilterPopup(true), 300);
        }}
        onSelectDate={handleEndDateSelect}
        selectedDate={endDate}
        title="Select End Date"
      />
    </SafeAreaView>
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
    maxWidth: 320,
    padding: 20,
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
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  closeBtn: {
    fontSize: 18,
    color: '#64748b',
    padding: 4,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  calendarIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 13,
    color: '#293B50',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ea6118',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 12,
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
    maxWidth: 320,
    padding: 16,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  closeBtn: {
    fontSize: 16,
    color: '#64748b',
    padding: 4,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
  },
  navBtnText: {
    fontSize: 14,
    color: '#ea6118',
    fontWeight: '600',
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293B50',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
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
    borderRadius: 20,
  },
  dayText: {
    fontSize: 12,
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
    marginTop: 16,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ea6118',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});

// Main Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  welcomeDate: {
    fontSize: 9,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trendContainer: {
    marginTop: 4,
  },
  trendUp: {
    fontSize: 9,
    color: '#16a34a',
    fontWeight: '500',
  },
  trendDown: {
    fontSize: 9,
    color: '#dc2626',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 10,
  },
  financialSection: {
    marginBottom: 14,
  },
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  financialIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 2,
  },
  financialLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  quickLinksSection: {
    marginBottom: 14,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickLinkIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkIconText: {
    fontSize: 12,
  },
  quickLinkTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  quickLinkArrow: {
    fontSize: 14,
    color: '#ea6118',
    fontWeight: '600',
  },
});

export default DashboardScreen;
