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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface ReceivedSMSScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

interface SMSMessage {
  id: number;
  from: string;
  message: string;
  receivedDate: string;
  sentTo: string;
  autoResponse: boolean;
}

const ReceivedSMSScreen: React.FC<ReceivedSMSScreenProps> = ({navigation}) => {
  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter State
  const [selectedKeyword, setSelectedKeyword] = useState('All Incoming');
  
  // Date filters
  const [startDate, setStartDate] = useState({day: 1, month: 1, year: 2025});
  const [endDate, setEndDate] = useState({day: 8, month: 12, year: 2025});
  
  // Calendar modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [tempStartDate, setTempStartDate] = useState({day: 1, month: 1, year: 2025});
  const [tempEndDate, setTempEndDate] = useState({day: 8, month: 12, year: 2025});
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start');
  
  // Dropdown states
  const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);
  
  // All messages data
  const allMessages: SMSMessage[] = [
    {id: 1, from: 'MYBRANDNAME', message: 'testing VN Forwarder', receivedDate: 'Wed 3rd Dec 25 09:07:32', sentTo: '447418318903', autoResponse: false},
    {id: 2, from: 'MYBRANDNAME', message: '3 VN test', receivedDate: 'Tue 2nd Dec 25 12:41:28', sentTo: '447418318903', autoResponse: false},
    {id: 3, from: '447740673853', message: 'Stop', receivedDate: 'Thu 30th Oct 25 09:34:47', sentTo: '447418318070', autoResponse: false},
    {id: 4, from: '447740673853', message: 'Reply to master', receivedDate: 'Thu 30th Oct 25 09:33:34', sentTo: '447418318070', autoResponse: false},
    {id: 5, from: '447407311128', message: 'Hi da\nCall me once wakeup', receivedDate: 'Thu 27th Nov 25 06:47:41', sentTo: '447418318903', autoResponse: false},
    {id: 6, from: '447748154719', message: '228359', receivedDate: 'Thu 27th Nov 25 06:14:27', sentTo: '447418318903', autoResponse: false},
  ];

  // Results state
  const [displayedMessages, setDisplayedMessages] = useState<SMSMessage[]>(allMessages);
  const [totalMessages] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Details Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);

  const keywordOptions = [
    {value: 'All Incoming', label: 'All Incoming Messages'},
    {value: '83', label: '* (447418318903)'},
    {value: '-1', label: 'STOPs (60300/80809)'},
    {value: '-2', label: 'STOPs (447786201088)'},
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateDisplay = (date: {day: number; month: number; year: number}): string => {
    return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleSearch = () => {
    setIsLoading(true);
    setShowFilterModal(false);
    setHasSearched(true);
    
    setTimeout(() => {
      setDisplayedMessages(allMessages);
      setIsLoading(false);
    }, 1000);
  };

  const handleResetFilters = () => {
    setSelectedKeyword('All Incoming');
    setStartDate({day: 1, month: 1, year: 2025});
    setEndDate({day: 8, month: 12, year: 2025});
  };

  const handleViewDetails = (msg: SMSMessage) => {
    setSelectedMessage(msg);
    setShowDetailsModal(true);
  };

  const handleScroll = (event: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    
    if (isCloseToBottom && !isLoadingMore && displayedMessages.length < totalMessages) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentCount = displayedMessages.length;
      const newMessages = allMessages.slice(currentCount, currentCount + 25);
      setDisplayedMessages([...displayedMessages, ...newMessages]);
      setIsLoadingMore(false);
    }, 500);
  };

  const openCalendar = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setCalendarMonth(startDate.month - 1);
    setCalendarYear(startDate.year);
    setSelectingDate('start');
    setShowCalendarModal(true);
  };

  const goToPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const selectDate = (day: number) => {
    const selectedDate = {day, month: calendarMonth + 1, year: calendarYear};
    
    if (selectingDate === 'start') {
      setTempStartDate(selectedDate);
      setSelectingDate('end');
    } else {
      const startTimestamp = new Date(tempStartDate.year, tempStartDate.month - 1, tempStartDate.day).getTime();
      const endTimestamp = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day).getTime();
      
      if (endTimestamp < startTimestamp) {
        setTempEndDate(tempStartDate);
        setTempStartDate(selectedDate);
      } else {
        setTempEndDate(selectedDate);
      }
    }
  };

  const confirmDateSelection = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowCalendarModal(false);
  };

  const isDateSelected = (day: number) => {
    const currentDate = new Date(calendarYear, calendarMonth, day).getTime();
    const start = new Date(tempStartDate.year, tempStartDate.month - 1, tempStartDate.day).getTime();
    const end = new Date(tempEndDate.year, tempEndDate.month - 1, tempEndDate.day).getTime();
    
    if (currentDate === start) return 'start';
    if (currentDate === end) return 'end';
    if (currentDate > start && currentDate < end) return 'between';
    return 'none';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateType = isDateSelected(day);
      const isStart = dateType === 'start';
      const isEnd = dateType === 'end';
      const isBetween = dateType === 'between';
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isBetween && styles.calendarDayBetween,
            (isStart || isEnd) && styles.calendarDaySelected,
          ]}
          onPress={() => selectDate(day)}>
          <Text
            style={[
              styles.calendarDayText,
              (isStart || isEnd) && styles.calendarDayTextSelected,
              isBetween && styles.calendarDayTextBetween,
            ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const renderDropdown = (
    options: {value: string; label: string}[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void,
  ) => (
    <View style={styles.dropdownList}>
      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dropdownItem,
              selectedValue === option.value && styles.dropdownItemActive,
            ]}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}>
            <Text
              style={[
                styles.dropdownItemText,
                selectedValue === option.value && styles.dropdownItemTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Received SMS"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}>

        {/* Filter Button Card */}
        <TouchableOpacity
          style={styles.filterButtonCard}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}>
          <View style={styles.filterButtonLeft}>
            <View style={styles.filterIconContainer}>
              <Text style={styles.filterIcon}>🔍</Text>
            </View>
            <View>
              <Text style={styles.filterButtonTitle}>Search & Filter Options</Text>
              <Text style={styles.filterButtonSubtitle}>Tap to filter received messages</Text>
            </View>
          </View>
          <View style={styles.filterButtonRight}>
            <Text style={styles.filterArrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Results Section */}
        <View style={styles.resultsCard}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingIcon}>⏳</Text>
              <Text style={styles.loadingText}>Searching messages...</Text>
            </View>
          ) : displayedMessages.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>📥</Text>
              <Text style={styles.noDataTitle}>No Messages Found</Text>
              <Text style={styles.noDataText}>
                No received SMS messages match your search criteria. Try adjusting your filters.
              </Text>
            </View>
          ) : (
            <>
              {/* Record Info Header */}
              <View style={styles.recordInfoHeader}>
                <View style={styles.recordInfoRow}>
                  <Text style={styles.recordInfoLabel}>Total Records:</Text>
                  <Text style={styles.recordInfoValue}>{totalMessages}</Text>
                </View>
                <View style={styles.recordInfoRow}>
                  <Text style={styles.recordInfoLabel}>Now Showing:</Text>
                  <Text style={styles.recordInfoValue}>{displayedMessages.length}</Text>
                </View>
              </View>

              {/* Messages List */}
              <View style={styles.messagesList}>
                {displayedMessages.map(msg => (
                  <TouchableOpacity
                    key={msg.id}
                    style={styles.messageItem}
                    onPress={() => handleViewDetails(msg)}>
                    <View style={styles.messageRow}>
                      <View style={styles.messageLeft}>
                        <Text style={styles.messageFromLabel}>From:</Text>
                        <Text style={styles.messageFrom}>{msg.from}</Text>
                      </View>
                      <View style={[styles.statusBadge, msg.autoResponse ? styles.statusSent : styles.statusNoSent]}>
                        <Text style={styles.statusText}>{msg.autoResponse ? 'Replied' : 'No Reply'}</Text>
                      </View>
                    </View>
                    <Text style={styles.messagePreview} numberOfLines={1}>
                      {msg.message}
                    </Text>
                    <Text style={styles.messageDate}>
                      📅 {msg.receivedDate}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Loading More Indicator */}
              {isLoadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              )}

              {/* End of List Indicator */}
              {displayedMessages.length >= totalMessages && (
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>— End of messages —</Text>
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContainer}>
            {/* Modal Header */}
            <View style={styles.filterModalHeader}>
              <View style={styles.filterModalTitleRow}>
                <Text style={styles.filterModalIcon}>🔍</Text>
                <Text style={styles.filterModalTitle}>Search & Filter Options</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.filterModalBody} showsVerticalScrollIndicator={false}>
              {/* Keyword & Virtual Number Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterTitleRow}>
                  <Text style={styles.filterTitleIcon}>🔎</Text>
                  <Text style={styles.filterTitle}>Keyword & Virtual Number</Text>
                </View>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowKeywordDropdown(!showKeywordDropdown)}>
                  <Text style={styles.dropdownText}>
                    {keywordOptions.find(k => k.value === selectedKeyword)?.label || 'Select...'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {showKeywordDropdown && renderDropdown(
                  keywordOptions,
                  selectedKeyword,
                  setSelectedKeyword,
                  () => setShowKeywordDropdown(false)
                )}
              </View>

              {/* Date Range Section */}
              <View style={styles.filterSection}>
                <View style={styles.filterTitleRow}>
                  <Text style={styles.filterTitleIcon}>📅</Text>
                  <Text style={styles.filterTitle}>Date Range</Text>
                </View>

                {/* Start and End Date in same row */}
                <TouchableOpacity
                  style={styles.dateRangeButton}
                  onPress={openCalendar}>
                  <View style={styles.dateRangeItem}>
                    <Text style={styles.dateRangeLabel}>Start</Text>
                    <Text style={styles.dateRangeValue}>{formatDateDisplay(startDate)}</Text>
                  </View>
                  <View style={styles.dateRangeSeparator}>
                    <Text style={styles.dateRangeSeparatorText}>→</Text>
                  </View>
                  <View style={styles.dateRangeItem}>
                    <Text style={styles.dateRangeLabel}>End</Text>
                    <Text style={styles.dateRangeValue}>{formatDateDisplay(endDate)}</Text>
                  </View>
                  <View style={styles.dateRangeIcon}>
                    <Text style={styles.dateRangeIconText}>📅</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}>
                <Text style={styles.resetButtonIcon}>🔄</Text>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFilterButton}
                onPress={handleSearch}>
                <Text style={styles.applyFilterButtonIcon}>✓</Text>
                <Text style={styles.applyFilterButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}>
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalContainer}>
            {/* Calendar Header */}
            <View style={styles.calendarModalHeader}>
              <Text style={styles.calendarModalTitle}>📅 Select Date Range</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowCalendarModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Date Display */}
            <View style={styles.selectedDatesRow}>
              <TouchableOpacity
                style={[
                  styles.selectedDateBox,
                  selectingDate === 'start' && styles.selectedDateBoxActive,
                ]}
                onPress={() => setSelectingDate('start')}>
                <Text style={styles.selectedDateLabel}>Start Date</Text>
                <Text style={styles.selectedDateValue}>{formatDateDisplay(tempStartDate)}</Text>
              </TouchableOpacity>
              <Text style={styles.selectedDateArrow}>→</Text>
              <TouchableOpacity
                style={[
                  styles.selectedDateBox,
                  selectingDate === 'end' && styles.selectedDateBoxActive,
                ]}
                onPress={() => setSelectingDate('end')}>
                <Text style={styles.selectedDateLabel}>End Date</Text>
                <Text style={styles.selectedDateValue}>{formatDateDisplay(tempEndDate)}</Text>
              </TouchableOpacity>
            </View>

            {/* Month/Year Navigation */}
            <View style={styles.calendarNav}>
              <TouchableOpacity style={styles.calendarNavBtn} onPress={goToPrevMonth}>
                <Text style={styles.calendarNavBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarNavTitle}>
                {monthNames[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity style={styles.calendarNavBtn} onPress={goToNextMonth}>
                <Text style={styles.calendarNavBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={styles.calendarDayNames}>
              {dayNames.map(day => (
                <View key={day} style={styles.calendarDayName}>
                  <Text style={styles.calendarDayNameText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>

            {/* Calendar Footer */}
            <View style={styles.calendarModalFooter}>
              <TouchableOpacity
                style={styles.cancelDateButton}
                onPress={() => setShowCalendarModal(false)}>
                <Text style={styles.cancelDateButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDateButton}
                onPress={confirmDateSelection}>
                <Text style={styles.confirmDateButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContainer}>
            <View style={styles.detailsModalHeader}>
              <View style={styles.filterModalTitleRow}>
                <Text style={styles.filterModalIcon}>ℹ️</Text>
                <Text style={styles.filterModalTitle}>Received SMS Details</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailsModalBody}>
              {selectedMessage && (
                <>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailLabel}>Date Received:</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedMessage.receivedDate}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>👤</Text>
                      <Text style={styles.detailLabel}>Sender:</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedMessage.from}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>📱</Text>
                      <Text style={styles.detailLabel}>Sent to Number:</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedMessage.sentTo}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>💬</Text>
                      <Text style={styles.detailLabel}>Inbound SMS Message:</Text>
                    </View>
                    <View style={styles.messageBox}>
                      <Text style={styles.messageBoxText}>{selectedMessage.message}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>↩️</Text>
                      <Text style={styles.detailLabel}>Auto-Response SMS:</Text>
                    </View>
                    <View style={[styles.messageBox, styles.messageBoxMuted]}>
                      <Text style={styles.messageBoxTextMuted}>
                        (No auto-response SMS was sent)
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.detailsModalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.closeButtonIcon}>✕</Text>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    padding: 16,
    paddingBottom: 30,
  },
  // Filter Button Card
  filterButtonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#ea6118',
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  filterIcon: {
    fontSize: 24,
  },
  filterButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 2,
  },
  filterButtonSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  filterButtonRight: {
    paddingLeft: 10,
  },
  filterArrow: {
    fontSize: 28,
    color: '#ea6118',
    fontWeight: '300',
  },
  // Results Card
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  // Loading State
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  // No Data State
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 64,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Record Info Header
  recordInfoHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 6,
  },
  recordInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea6118',
  },
  // Messages List
  messagesList: {
    padding: 0,
  },
  messageItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageFromLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 6,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSent: {
    backgroundColor: '#dcfce7',
  },
  statusNoSent: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#293B50',
  },
  messagePreview: {
    fontSize: 14,
    color: '#ea6118',
    fontWeight: '500',
    marginBottom: 6,
  },
  messageDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  // Loading More
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#64748b',
  },
  // End of List
  endOfListContainer: {
    padding: 16,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  filterModalHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterModalIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterModalBody: {
    padding: 20,
    maxHeight: 450,
  },
  filterSection: {
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterTitleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#293B50',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 140,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 140,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemActive: {
    backgroundColor: '#fff7ed',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#293B50',
  },
  dropdownItemTextActive: {
    color: '#ea6118',
    fontWeight: '600',
  },
  // Date Range Button
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  dateRangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateRangeLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateRangeValue: {
    fontSize: 14,
    color: '#293B50',
    fontWeight: '600',
  },
  dateRangeSeparator: {
    paddingHorizontal: 8,
  },
  dateRangeSeparatorText: {
    fontSize: 18,
    color: '#ea6118',
    fontWeight: '600',
  },
  dateRangeIcon: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    marginLeft: 8,
  },
  dateRangeIconText: {
    fontSize: 20,
  },
  // Calendar Modal
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  calendarModalHeader: {
    backgroundColor: '#ea6118',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedDateBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedDateBoxActive: {
    borderColor: '#ea6118',
    backgroundColor: '#fff7ed',
  },
  selectedDateLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  selectedDateValue: {
    fontSize: 13,
    color: '#293B50',
    fontWeight: '700',
  },
  selectedDateArrow: {
    fontSize: 16,
    color: '#ea6118',
    marginHorizontal: 8,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  calendarNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavBtnText: {
    fontSize: 24,
    color: '#293B50',
    fontWeight: '300',
  },
  calendarNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  calendarDayNames: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  calendarDayName: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#ea6118',
    borderRadius: 20,
  },
  calendarDayBetween: {
    backgroundColor: '#fff7ed',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#293B50',
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calendarDayTextBetween: {
    color: '#ea6118',
  },
  calendarModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  cancelDateButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  cancelDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmDateButton: {
    flex: 1,
    backgroundColor: '#ea6118',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Filter Modal Footer
  filterModalFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 10,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  resetButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  applyFilterButton: {
    flex: 2,
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  applyFilterButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#ffffff',
  },
  applyFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Details Modal
  detailsModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  detailsModalHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  detailValue: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 24,
  },
  messageBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
  },
  messageBoxText: {
    fontSize: 14,
    color: '#293B50',
    lineHeight: 20,
  },
  messageBoxMuted: {
    backgroundColor: '#f1f5f9',
    borderLeftColor: '#94a3b8',
  },
  messageBoxTextMuted: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  detailsModalFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#ffffff',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ReceivedSMSScreen;
