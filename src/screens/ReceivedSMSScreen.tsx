import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getReceivedSmsPageData,
  getReceivedMessages,
  getMessageDetails,
  FilterOption,
  ReceivedMessage,
  MessageDetails,
} from '../services/receivedSmsService';

interface ReceivedSMSScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const ReceivedSMSScreen: React.FC<ReceivedSMSScreenProps> = ({navigation}) => {
  // Page Data State
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  
  // Messages State
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter State
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Date filters
  const [startDate, setStartDate] = useState({day: 1, month: 1, year: new Date().getFullYear()});
  const [endDate, setEndDate] = useState({day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear()});
  
  // Calendar modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start');
  
  // Dropdown states
  const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);
  
  // Details Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load page data (filter options)
      const pageDataResult = await getReceivedSmsPageData();
      if (pageDataResult.success && pageDataResult.data) {
        setFilterOptions(pageDataResult.data.filter_options);
      }

      // Load messages
      await loadMessages(1, true);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (page: number = 1, reset: boolean = false) => {
    try {
      const result = await getReceivedMessages({
        filter: selectedFilter,
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        page,
        perPage: 20,
        search: searchText,
      });

      if (result.success && result.data) {
        if (reset) {
          setMessages(result.data.messages);
        } else {
          setMessages(prev => [...prev, ...result.data!.messages]);
        }
        setTotalRecords(result.data.pagination.total_records);
        setCurrentPage(result.data.pagination.current_page);
        setTotalPages(result.data.pagination.total_pages);
        setHasMore(result.data.pagination.has_more);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadMessages(1, true);
    setIsRefreshing(false);
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    await loadMessages(currentPage + 1, false);
    setIsLoadingMore(false);
  };

  const handleSearch = async () => {
    setShowFilterModal(false);
    setIsLoading(true);
    setMessages([]);
    await loadMessages(1, true);
    setIsLoading(false);
  };

  const handleResetFilters = () => {
    setSelectedFilter('all');
    setSearchText('');
    const today = new Date();
    setStartDate({day: 1, month: 1, year: today.getFullYear()});
    setEndDate({day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear()});
  };

  const handleViewDetails = async (msg: ReceivedMessage) => {
    setIsLoadingDetails(true);
    setShowDetailsModal(true);
    
    try {
      const result = await getMessageDetails(msg.id);
      if (result.success && result.data) {
        setSelectedMessage(result.data);
      } else {
        Alert.alert('Error', 'Failed to load message details');
        setShowDetailsModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load message details');
      setShowDetailsModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatDateForApi = (date: {day: number; month: number; year: number}): string => {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  };

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
    Alert.alert('Notifications', 'You have new notifications');
  };

  const handleScroll = (event: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    
    if (isCloseToBottom && !isLoadingMore && hasMore) {
      loadMoreMessages();
    }
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
    options: FilterOption[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void,
  ) => (
    <View style={styles.dropdownList}>
      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.dropdownItem,
              selectedValue === option.id && styles.dropdownItemActive,
            ]}
            onPress={() => {
              onSelect(option.id);
              onClose();
            }}>
            <Text
              style={[
                styles.dropdownItemText,
                selectedValue === option.id && styles.dropdownItemTextActive,
              ]}>
              {option.display_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getSelectedFilterLabel = (): string => {
    const filter = filterOptions.find(f => f.id === selectedFilter);
    return filter?.display_name || 'All Incoming Messages';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
      title="Received SMS"
      onMenuPress={() => navigation.openDrawer()}
      onNotificationPress={handleNotificationPress}
      notificationCount={3}
      />

      {isLoading ? (
        <View style={styles.loadingFullScreen}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading received messages...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#ea6118']} />
          }>

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
                <Text style={styles.filterButtonSubtitle}>{getSelectedFilterLabel()}</Text>
              </View>
            </View>
            <View style={styles.filterButtonRight}>
              <Text style={styles.filterArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Results Section */}
          <View style={styles.resultsCard}>
            {messages.length === 0 ? (
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
                    <Text style={styles.recordInfoValue}>{totalRecords}</Text>
                  </View>
                  <View style={styles.recordInfoRow}>
                    <Text style={styles.recordInfoLabel}>Now Showing:</Text>
                    <Text style={styles.recordInfoValue}>{messages.length}</Text>
                  </View>
                </View>

                {/* Messages List */}
                <View style={styles.messagesList}>
                  {messages.map(msg => (
                    <TouchableOpacity
                      key={msg.id}
                      style={styles.messageItem}
                      onPress={() => handleViewDetails(msg)}>
                      <View style={styles.messageRow}>
                        <View style={styles.messageLeft}>
                          <Text style={styles.messageFromLabel}>From:</Text>
                          <Text style={styles.messageFrom}>{msg.sender}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>📩</Text>
                        </View>
                      </View>
                      <Text style={styles.messagePreview} numberOfLines={1}>
                        {msg.message_preview}
                      </Text>
                      <Text style={styles.messageDate}>
                        📅 {msg.received_at}
                      </Text>
                      <Text style={styles.messageTo}>
                        To: {msg.received_to}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#ea6118" />
                    <Text style={styles.loadingMoreText}>Loading more...</Text>
                  </View>
                )}

                {/* End of List Indicator */}
                {!hasMore && messages.length > 0 && (
                  <View style={styles.endOfListContainer}>
                    <Text style={styles.endOfListText}>— End of messages —</Text>
                  </View>
                )}
              </>
            )}
          </View>

        </ScrollView>
      )}

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
              {/* Search Input */}
              <View style={styles.filterSection}>
                <View style={styles.filterTitleRow}>
                  <Text style={styles.filterTitleIcon}>🔎</Text>
                  <Text style={styles.filterTitle}>Search</Text>
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by sender or message..."
                  placeholderTextColor="#94a3b8"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* Keyword & Virtual Number Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterTitleRow}>
                  <Text style={styles.filterTitleIcon}>📱</Text>
                  <Text style={styles.filterTitle}>Keyword & Virtual Number</Text>
                </View>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowKeywordDropdown(!showKeywordDropdown)}>
                  <Text style={styles.dropdownText}>
                    {getSelectedFilterLabel()}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {showKeywordDropdown && renderDropdown(
                  filterOptions,
                  selectedFilter,
                  setSelectedFilter,
                  () => setShowKeywordDropdown(false)
                )}
              </View>

              {/* Date Range Section */}
              <View style={styles.filterSection}>
                <View style={styles.filterTitleRow}>
                  <Text style={styles.filterTitleIcon}>📅</Text>
                  <Text style={styles.filterTitle}>Date Range</Text>
                </View>

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
              {isLoadingDetails ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#ea6118" />
                  <Text style={styles.loadingText}>Loading details...</Text>
                </View>
              ) : selectedMessage && (
                <>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailLabel}>Date Received:</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedMessage.received_at_formatted}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>👤</Text>
                      <Text style={styles.detailLabel}>Sender:</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedMessage.sender}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Text style={styles.detailIcon}>📱</Text>
                      <Text style={styles.detailLabel}>Sent to Number:</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedMessage.received_to}</Text>
                  </View>

                  {selectedMessage.keyword && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabelRow}>
                        <Text style={styles.detailIcon}>🏷️</Text>
                        <Text style={styles.detailLabel}>Keyword:</Text>
                      </View>
                      <Text style={styles.detailValue}>{selectedMessage.keyword}</Text>
                    </View>
                  )}
                  
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
                        {selectedMessage.auto_response.sent 
                          ? selectedMessage.auto_response.message 
                          : '(No auto-response SMS was sent)'}
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
  loadingFullScreen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },

  // Filter Button Card
  filterButtonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  statusText: {
    fontSize: 14,
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
    marginBottom: 2,
  },
  messageTo: {
    fontSize: 11,
    color: '#94a3b8',
  },
  // Loading More
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
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
  // Search Input
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
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
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
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
