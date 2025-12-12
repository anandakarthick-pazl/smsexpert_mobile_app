import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getSentSmsPageData,
  getSentSmsMessages,
  getSentMessageDetails,
  SentMessage,
  SentMessageDetails,
  SentSmsFilters,
  FilterOption,
  PaginationInfo,
  getStatusColor,
} from '../services/sentSmsService';

interface Props {
  navigation: any;
}

const SentSMSScreen: React.FC<Props> = ({ navigation }) => {
  // State
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filter options from API
  const [routeOptions, setRouteOptions] = useState<FilterOption[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<FilterOption[]>([]);

  // Date state
  const [startDate, setStartDate] = useState({day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear()});
  const [endDate, setEndDate] = useState({day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear()});

  // Active filters
  const [filters, setFilters] = useState<SentSmsFilters>({
    route: 'all',
    delivery_status: 'all',
    mobile: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  // Filter modal
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<SentSmsFilters>(filters);

  // Calendar modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start');

  // Message details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SentMessageDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

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
    try {
      setLoading(true);
      setError(null);

      // Load filter options
      const pageData = await getSentSmsPageData();
      if (pageData.success) {
        setRouteOptions(pageData.data.route_options);
        setDeliveryOptions(pageData.data.delivery_options);

        // Set default dates
        setFilters(prev => ({
          ...prev,
          start_date: pageData.data.default_start_date,
          end_date: pageData.data.default_end_date,
        }));
        setTempFilters(prev => ({
          ...prev,
          start_date: pageData.data.default_start_date,
          end_date: pageData.data.default_end_date,
        }));

        // Parse dates for calendar
        if (pageData.data.default_start_date) {
          const parts = pageData.data.default_start_date.split('-');
          if (parts.length === 3) {
            setStartDate({year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2])});
            setTempStartDate({year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2])});
          }
        }
        if (pageData.data.default_end_date) {
          const parts = pageData.data.default_end_date.split('-');
          if (parts.length === 3) {
            setEndDate({year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2])});
            setTempEndDate({year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2])});
          }
        }
      }

      // Load messages
      await loadMessages(1);
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getSentSmsMessages(filters, page, 20);

      if (response.success) {
        if (append) {
          setMessages(prev => [...prev, ...response.data.messages]);
        } else {
          setMessages(response.data.messages);
        }
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    loadMessages(1);
  }, [filters]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.has_more && !loadingMore) {
      loadMessages(pagination.current_page + 1, true);
    }
  }, [pagination, loadingMore, filters]);

  const formatDateForApi = (date: {day: number; month: number; year: number}): string => {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  };

  const formatDateDisplay = (date: {day: number; month: number; year: number}): string => {
    return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
  };

  const handleApplyFilters = () => {
    // Update filters with calendar dates
    const updatedFilters = {
      ...tempFilters,
      start_date: formatDateForApi(startDate),
      end_date: formatDateForApi(endDate),
    };
    setFilters(updatedFilters);
    setShowFilterModal(false);
    // Reload messages with new filters
    setTimeout(() => {
      loadMessages(1);
    }, 100);
  };

  const handleResetFilters = () => {
    const today = new Date();
    const resetDate = {day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear()};
    setStartDate(resetDate);
    setEndDate(resetDate);
    setTempStartDate(resetDate);
    setTempEndDate(resetDate);
    setTempFilters({
      route: 'all',
      delivery_status: 'all',
      mobile: '',
      start_date: formatDateForApi(resetDate),
      end_date: formatDateForApi(resetDate),
    });
  };

  const handleMessagePress = async (message: SentMessage) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);

      const response = await getSentMessageDetails(message.table_name, message.id);

      if (response.success && response.data) {
        setSelectedMessage(response.data);
      }
    } catch (err: any) {
      console.error('Error loading message details:', err);
      setSelectedMessage(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Calendar functions
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

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
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

  const getStatusEmoji = (statusCode: string): string => {
    switch (statusCode) {
      case 'delivered':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'scheduled':
        return '📅';
      default:
        return '❓';
    }
  };

  const renderMessageItem = ({ item }: { item: SentMessage }) => {
    const statusColor = getStatusColor(item.status_code);
    const statusEmoji = getStatusEmoji(item.status_code);

    return (
      <TouchableOpacity
        style={styles.messageCard}
        onPress={() => handleMessagePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.messageHeader}>
          <View style={styles.mobileContainer}>
            <Text style={styles.mobileIcon}>📱</Text>
            <Text style={styles.mobileNumber}>{item.mobile}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusEmoji}>{statusEmoji}</Text>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.messagePreview} numberOfLines={2}>
          {item.message_preview}
        </Text>

        <View style={styles.messageFooter}>
          <View style={styles.timeContainer}>
            <Text style={styles.footerIcon}>🕐</Text>
            <Text style={styles.timeText}>{item.sent_time}</Text>
          </View>
          <View style={styles.senderContainer}>
            <Text style={styles.footerIcon}>👤</Text>
            <Text style={styles.senderText}>{item.originator}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>🔍 Search & Filter</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScrollView}>
            {/* Routes Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>🔀 Routes</Text>
              <View style={styles.filterOptions}>
                {routeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      tempFilters.route === option.value && styles.filterOptionActive,
                    ]}
                    onPress={() => setTempFilters(prev => ({ ...prev, route: option.value }))}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.route === option.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Delivery Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>📊 Delivery Status</Text>
              <View style={styles.filterOptions}>
                {deliveryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      tempFilters.delivery_status === option.value && styles.filterOptionActive,
                    ]}
                    onPress={() => setTempFilters(prev => ({ ...prev, delivery_status: option.value }))}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.delivery_status === option.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mobile Number Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>📞 Mobile Number</Text>
              <TextInput
                style={styles.filterInput}
                value={tempFilters.mobile}
                onChangeText={(text) => setTempFilters(prev => ({ ...prev, mobile: text }))}
                placeholder="Enter mobile number..."
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>📅 Date Range</Text>
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

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>🔍 Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCalendarModal = () => (
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
              style={styles.calendarCloseBtn}
              onPress={() => setShowCalendarModal(false)}>
              <Text style={styles.calendarCloseBtnText}>✕</Text>
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
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModalContent}>
          <View style={styles.detailsModalHeader}>
            <Text style={styles.detailsModalTitle}>📋 Message Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Text style={styles.closeIconWhite}>✕</Text>
            </TouchableOpacity>
          </View>

          {loadingDetails ? (
            <View style={styles.detailsLoading}>
              <ActivityIndicator size="large" color="#ea6118" />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : selectedMessage ? (
            <ScrollView style={styles.detailsScrollView}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🕐 Date Submitted</Text>
                <Text style={styles.detailValue}>{selectedMessage.date_submitted}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📤 Send at Time</Text>
                <Text style={styles.detailValue}>{selectedMessage.send_at_time}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>✅ Delivery Time</Text>
                <Text style={styles.detailValue}>{selectedMessage.delivery_time}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>👤 Sender</Text>
                <Text style={styles.detailValue}>{selectedMessage.sender}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📱 Sent To</Text>
                <Text style={styles.detailValue}>{selectedMessage.sent_to}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🏢 Sent By</Text>
                <Text style={styles.detailValue}>{selectedMessage.sent_by}</Text>
              </View>

              <View style={styles.messageSection}>
                <Text style={styles.detailLabel}>💬 Message Content</Text>
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{selectedMessage.message}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>💰 Cost to You</Text>
                <Text style={styles.detailValue}>{selectedMessage.cost_to_you}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📊 Delivery Status</Text>
                <Text style={[styles.detailValue, styles.statusValue]}>
                  {selectedMessage.delivery_status}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ℹ️ Message Status</Text>
                <Text style={styles.detailValue}>{selectedMessage.message_status}</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.detailsLoading}>
              <Text style={styles.errorText}>Failed to load message details</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeDetailsButton}
            onPress={() => setShowDetailsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No Messages Found</Text>
      <Text style={styles.emptyText}>
        No sent SMS messages match your search criteria. Try adjusting your filters or date range.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ea6118" />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header title="Sent SMS" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading sent messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header title="Sent SMS" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header title="Sent SMS" onMenuPress={() => navigation.openDrawer()} />

      <View style={styles.content}>
        {/* Filter Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setTempFilters(filters);
            setShowFilterModal(true);
          }}
        >
          <Text style={styles.filterButtonIcon}>🔍</Text>
          <Text style={styles.filterButtonText}>Search & Filter</Text>
          {(filters.route !== 'all' ||
            filters.delivery_status !== 'all' ||
            filters.mobile) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>•</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Results count */}
        {pagination && (
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {pagination.total_records.toLocaleString()} message(s) found
            </Text>
          </View>
        )}

        {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => `${item.table_name}-${item.id}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#ea6118']}
              tintColor="#ea6118"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={renderFooter}
        />
      </View>

      {renderFilterModal()}
      {renderCalendarModal()}
      {renderDetailsModal()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#ea6118',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    margin: 16,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#ea6118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterButtonIcon: {
    fontSize: 18,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterBadge: {
    marginLeft: 8,
    backgroundColor: '#fff',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#ea6118',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mobileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  mobileNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293B50',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusEmoji: {
    fontSize: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  messagePreview: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 10,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderText: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
  },
  closeIcon: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '600',
  },
  closeIconWhite: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  filterScrollView: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#ea6118',
    borderColor: '#ea6118',
  },
  filterOptionText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#293B50',
    backgroundColor: '#f8fafc',
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
  filterActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ea6118',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Calendar Modal Styles
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
  calendarCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCloseBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
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

  // Details Modal Styles
  detailsModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#293B50',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  detailsLoading: {
    padding: 40,
    alignItems: 'center',
  },
  detailsScrollView: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#293B50',
    fontWeight: '500',
  },
  statusValue: {
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  messageSection: {
    marginBottom: 16,
  },
  messageBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#293B50',
    lineHeight: 22,
  },
  closeDetailsButton: {
    margin: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#293B50',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SentSMSScreen;
