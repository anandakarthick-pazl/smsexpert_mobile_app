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
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface GroupsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

interface GroupItem {
  id: number;
  name: string;
  memberCount: number;
  members: string[];
}

const GroupsScreen: React.FC<GroupsScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showMembersSheet, setShowMembersSheet] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [groupNameFilter, setGroupNameFilter] = useState('');
  const [numberFilter, setNumberFilter] = useState('');
  
  const [groups] = useState<GroupItem[]>([
    {id: 80178, name: 'Test Group 1', memberCount: 1, members: ['447748154719']},
    {id: 80179, name: 'SRF Test Groups', memberCount: 1, members: ['01932710958']},
    {id: 80183, name: 'Storacall', memberCount: 3, members: ['447740673828', '441932710710', '447407311128']},
    {id: 80185, name: 'iTAGG incoming Reply to', memberCount: 0, members: []},
    {id: 80187, name: 'iTAGG incoming 228359', memberCount: 1, members: ['447748154719']},
    {id: 80188, name: 'iTAGG incoming Hi da', memberCount: 1, members: ['01932710958']},
    {id: 80189, name: 'iTAGG incoming 3 VN', memberCount: 1, members: ['447740673828']},
    {id: 80190, name: 'iTAGG incoming testing VN', memberCount: 1, members: ['441932710710']},
  ]);

  const totalMembers = groups.reduce((sum, group) => sum + group.memberCount, 0);

  // Filter groups based on search criteria
  const filteredGroups = groups.filter(group => {
    const matchesName = groupNameFilter === '' || 
      group.name.toLowerCase().includes(groupNameFilter.toLowerCase());
    const matchesNumber = numberFilter === '' || 
      group.members.some(member => member.includes(numberFilter));
    return matchesName && matchesNumber;
  });

  const clearFilters = () => {
    setGroupNameFilter('');
    setNumberFilter('');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleAddGroup = () => {
    Alert.alert('Add Group', 'Navigate to create new group form');
  };

  const handleViewMembers = (group: GroupItem) => {
    setSelectedGroup(group);
    setShowMembersSheet(true);
  };

  const handleAddMembers = (group: GroupItem) => {
    Alert.alert('Add Members', `Add numbers to group: ${group.name}`);
  };

  const handleEditGroup = (group: GroupItem) => {
    Alert.alert('Edit Group', `Edit group: ${group.name}`);
  };

  const handleDeleteGroup = (group: GroupItem) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive'},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Groups"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header Card with Total Count, Add Button and Info Button */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.totalLabel}>Total Groups:</Text>
            <Text style={styles.totalValue}>{groups.length}</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Add Group Button */}
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddGroup}>
              <Text style={styles.addButtonIcon}>+</Text>
            </TouchableOpacity>
            {/* Info Button */}
            <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
            </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterToggleButton}
                    onPress={() => setShowFilters(!showFilters)}>
                    <Text style={styles.filterToggleIcon}>🔍</Text>
                  </TouchableOpacity>
          </View>
        </View>

        {/* Filter Section */}
        {showFilters && (
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>🔍 Filter Groups</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFilterText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterInputsRow}>
              <View style={styles.filterInputContainer}>
                <Text style={styles.filterLabel}>Group Name</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Search by name..."
                  placeholderTextColor="#94a3b8"
                  value={groupNameFilter}
                  onChangeText={setGroupNameFilter}
                />
              </View>
              <View style={styles.filterInputContainer}>
                <Text style={styles.filterLabel}>Phone Number</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Search by number..."
                  placeholderTextColor="#94a3b8"
                  value={numberFilter}
                  onChangeText={setNumberFilter}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            {(groupNameFilter || numberFilter) && (
              <View style={styles.filterResultsInfo}>
                <Text style={styles.filterResultsText}>
                  Showing {filteredGroups.length} of {groups.length} groups
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Groups List Card */}
        <View style={styles.resultsCard}>
          {filteredGroups.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>{(groupNameFilter || numberFilter) ? '🔍' : '👥'}</Text>
              <Text style={styles.noDataTitle}>{(groupNameFilter || numberFilter) ? 'No Groups Found' : 'No Groups Yet'}</Text>
              <Text style={styles.noDataText}>
                {(groupNameFilter || numberFilter) 
                  ? 'Try adjusting your filter criteria'
                  : 'Create groups to organize your contacts for bulk SMS sending.'}
              </Text>
              {(groupNameFilter || numberFilter) && (
                <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
                  <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Groups List */}
              <View style={styles.groupsList}>
                {filteredGroups.map((group, index) => (
                  <View
                    key={group.id}
                    style={[
                      styles.groupItem,
                      index === filteredGroups.length - 1 && styles.lastGroupItem
                    ]}>
                    {/* Row 1: Group Name and Action Icons */}
                    <View style={styles.groupRow}>
                      <TouchableOpacity 
                        style={styles.groupLeft}
                        onPress={() => handleViewMembers(group)}>
                        <Text style={styles.groupLabel}>Group:</Text>
                        <View style={styles.nameBadge}>
                          <Text style={styles.nameBadgeText}>
                            {group.name.length > 10 
                              ? `${group.name.substring(0, 10)}...` 
                              : group.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.actionsRow}>
                        <TouchableOpacity 
                          style={styles.addMembersButton}
                          onPress={() => handleAddMembers(group)}>
                          <Text style={styles.actionIcon}>➕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => handleEditGroup(group)}>
                          <Text style={styles.actionIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteGroup(group)}>
                          <Text style={styles.actionIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Row 2: Members Info - Clickable */}
                    <TouchableOpacity 
                      style={styles.groupDetailRow}
                      onPress={() => handleViewMembers(group)}>
                      <Text style={styles.groupDetailIcon}>👤</Text>
                      <Text style={styles.groupDetailText}>
                        {group.memberCount === 0 
                          ? 'No members' 
                          : group.memberCount === 1 
                            ? '1 member' 
                            : `${group.memberCount} members`}
                      </Text>
                      <Text style={styles.viewMembersHint}> (tap to view)</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* End of List Indicator */}
              <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>— End of groups —</Text>
              </View>
            </>
          )}
        </View>

      </ScrollView>

      {/* Info Bottom Sheet Modal */}
      <Modal
        visible={showInfoSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            {/* Modal Header */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>ℹ️</Text>
                <Text style={styles.bottomSheetTitle}>Groups Information</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Manage Contact Groups Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>👥</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Manage Contact Groups</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Groups help you organize your contacts for easy bulk SMS sending. Create groups for different categories like customers, friends, or business contacts.
                  </Text>
                </View>
              </View>

              {/* Creating Groups Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>➕</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Creating Groups</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    Tap the + button to create a new group. Give your group a descriptive name so you can easily find it when sending bulk messages.
                  </Text>
                </View>
              </View>

              {/* Adding Members Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>👤</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Adding Members</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Tap on any group to view its members and add new contacts. You can add multiple phone numbers to each group for efficient bulk messaging.
                  </Text>
                </View>
              </View>

              {/* Bulk SMS Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>📨</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Sending Bulk SMS</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    Once you've created groups with members, you can send messages to all members at once from the Send SMS screen by selecting the group.
                  </Text>
                </View>
              </View>

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.closeSheetButtonIcon}>✕</Text>
                <Text style={styles.closeSheetButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Members Bottom Sheet Modal */}
      <Modal
        visible={showMembersSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMembersSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            {/* Modal Header */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>👥</Text>
                <Text style={styles.bottomSheetTitle}>
                  {selectedGroup?.name || 'Group Members'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowMembersSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Member Count Summary */}
              <View style={styles.memberSummary}>
                <Text style={styles.memberSummaryIcon}>📱</Text>
                <Text style={styles.memberSummaryText}>
                  {selectedGroup?.memberCount === 0
                    ? 'No numbers in this group'
                    : selectedGroup?.memberCount === 1
                      ? '1 number in this group'
                      : `${selectedGroup?.memberCount} numbers in this group`}
                </Text>
              </View>

              {/* Members List */}
              {selectedGroup?.members && selectedGroup.members.length > 0 ? (
                <View style={styles.membersList}>
                  {selectedGroup.members.map((member, index) => (
                    <View key={index} style={styles.memberItem}>
                      <View style={styles.memberIconBox}>
                        <Text style={styles.memberIcon}>📱</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberNumber}>{member}</Text>
                        <Text style={styles.memberLabel}>Phone Number</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noMembersContainer}>
                  <Text style={styles.noMembersIcon}>📵</Text>
                  <Text style={styles.noMembersTitle}>No Numbers Yet</Text>
                  <Text style={styles.noMembersText}>
                    This group doesn't have any numbers. Tap the + button to add members.
                  </Text>
                </View>
              )}

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.bottomSheetFooter}>
              <View style={styles.memberFooterButtons}>
                <TouchableOpacity
                  style={styles.addMemberFooterButton}
                  onPress={() => {
                    setShowMembersSheet(false);
                    if (selectedGroup) handleAddMembers(selectedGroup);
                  }}>
                  <Text style={styles.addMemberFooterIcon}>➕</Text>
                  <Text style={styles.addMemberFooterText}>Add Numbers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeSheetButton, {flex: 1}]}
                  onPress={() => setShowMembersSheet(false)}>
                  <Text style={styles.closeSheetButtonIcon}>✕</Text>
                  <Text style={styles.closeSheetButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
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
  // Header Card
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 6,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea6118',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '600',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 18,
  },
  filterToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleIcon: {
    fontSize: 16,
  },
  // Filter Card
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  clearFilterText: {
    fontSize: 12,
    color: '#ea6118',
    fontWeight: '600',
  },
  filterInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterInputContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#293B50',
  },
  filterResultsInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  filterResultsText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  clearFilterButton: {
    marginTop: 16,
    backgroundColor: '#ea6118',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearFilterButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  // Groups List
  groupsList: {
    padding: 0,
  },
  groupItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastGroupItem: {
    borderBottomWidth: 0,
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  nameBadge: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 1,
  },
  nameBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberCountBadge: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  zeroMembersBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  zeroMembersText: {
    color: '#64748b',
  },
  groupDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMembersHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  groupDetailRowWithActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupDetailIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  groupDetailText: {
    fontSize: 14,
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addMembersButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
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
  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSheetIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  bottomSheetTitle: {
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
  bottomSheetBody: {
    padding: 20,
    maxHeight: 450,
  },
  // Info Sections
  infoSection: {
    marginBottom: 16,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoSectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  blueBg: {
    backgroundColor: '#f0f9ff',
  },
  greenBg: {
    backgroundColor: '#dcfce7',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  purpleBg: {
    backgroundColor: '#ede9fe',
  },
  infoSectionIcon: {
    fontSize: 18,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  infoSectionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
  },
  blueBorder: {
    borderLeftColor: '#0891b2',
  },
  greenBorder: {
    borderLeftColor: '#16a34a',
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  purpleBorder: {
    borderLeftColor: '#8b5cf6',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  // Bottom Sheet Footer
  bottomSheetFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeSheetButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#ffffff',
  },
  closeSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Member Sheet Styles
  memberSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ea6118',
  },
  memberSummaryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  memberSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ea6118',
  },
  membersList: {
    gap: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberIcon: {
    fontSize: 20,
  },
  memberInfo: {
    flex: 1,
  },
  memberNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 2,
  },
  memberLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  noMembersContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noMembersIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noMembersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
  },
  noMembersText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  memberFooterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addMemberFooterButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  addMemberFooterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addMemberFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default GroupsScreen;
