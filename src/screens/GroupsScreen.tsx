import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getAvailableContacts,
  addMemberToGroup,
  removeMemberFromGroup,
  Group,
  GroupStatistics,
  GroupMember,
  GroupDetails,
} from '../services/groupsService';

interface GroupsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const GroupsScreen: React.FC<GroupsScreenProps> = ({navigation, onNotificationPress, notificationCount = 0}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAvailableContacts, setLoadingAvailableContacts] = useState(false);
  const [addingMember, setAddingMember] = useState<number | null>(null);
  const [removingMember, setRemovingMember] = useState<number | null>(null);

  const [groups, setGroups] = useState<Group[]>([]);
  const [statistics, setStatistics] = useState<GroupStatistics>({
    total_groups: 0,
    total_members: 0,
    active_groups: 0,
  });
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [availableContacts, setAvailableContacts] = useState<GroupMember[]>([]);

  // Form states
  const [formName, setFormName] = useState('');

  // Search debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGroups = useCallback(async (search?: string) => {
    try {
      const response = await getGroups(search);
      if (response.success && response.data) {
        setGroups(response.data.groups);
        setStatistics(response.data.statistics);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load groups');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups(searchQuery);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only search if no modal is open
    if (!showAddModal && !showEditModal && !showMembersModal && !showAddMemberModal) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchGroups(text);
      }, 500);
    }
  };


  const resetForm = () => {
    setFormName('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    Keyboard.dismiss();
    setShowAddModal(false);
    resetForm();
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setFormName(group.name);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    Keyboard.dismiss();
    setShowEditModal(false);
    setSelectedGroup(null);
    resetForm();
  };

  const openMembersModal = async (group: Group) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
    setLoadingMembers(true);

    try {
      const response = await getGroup(group.id);
      if (response.success && response.data) {
        setGroupDetails(response.data as GroupDetails);
      } else {
        Alert.alert('Error', response.message || 'Failed to load group members');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setSelectedGroup(null);
    setGroupDetails(null);
  };

  const openAddMemberModal = async () => {
    if (!selectedGroup) return;
    
    setShowAddMemberModal(true);
    setLoadingAvailableContacts(true);

    try {
      const response = await getAvailableContacts(selectedGroup.id);
      if (response.success && response.data) {
        setAvailableContacts(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load available contacts');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load available contacts');
    } finally {
      setLoadingAvailableContacts(false);
    }
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setAvailableContacts([]);
  };

  const handleAddGroup = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    Keyboard.dismiss();
    setSaving(true);
    try {
      const response = await createGroup(formName.trim());

      if (response.success) {
        Alert.alert('Success', 'Group created successfully');
        setShowAddModal(false);
        resetForm();
        fetchGroups(searchQuery);
      } else {
        Alert.alert('Error', response.message || 'Failed to create group');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;

    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    Keyboard.dismiss();
    setSaving(true);
    try {
      const response = await updateGroup(selectedGroup.id, formName.trim());

      if (response.success) {
        Alert.alert('Success', 'Group updated successfully');
        setShowEditModal(false);
        setSelectedGroup(null);
        resetForm();
        fetchGroups(searchQuery);
      } else {
        Alert.alert('Error', response.message || 'Failed to update group');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = (group: Group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteGroup(group.id);
              if (response.success) {
                Alert.alert('Success', 'Group deleted successfully');
                fetchGroups(searchQuery);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete group');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const handleAddMember = async (contact: GroupMember) => {
    if (!selectedGroup) return;

    setAddingMember(contact.id);
    try {
      const response = await addMemberToGroup(selectedGroup.id, contact.id);
      if (response.success) {
        // Remove from available contacts
        setAvailableContacts(prev => prev.filter(c => c.id !== contact.id));
        // Refresh group details
        const groupResponse = await getGroup(selectedGroup.id);
        if (groupResponse.success && groupResponse.data) {
          setGroupDetails(groupResponse.data as GroupDetails);
        }
        // Update groups list
        fetchGroups(searchQuery);
      } else {
        Alert.alert('Error', response.message || 'Failed to add member');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add member');
    } finally {
      setAddingMember(null);
    }
  };

  const handleRemoveMember = async (contact: GroupMember) => {
    if (!selectedGroup) return;

    Alert.alert(
      'Remove Member',
      `Remove "${contact.name}" from this group?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingMember(contact.id);
            try {
              const response = await removeMemberFromGroup(selectedGroup.id, contact.id);
              if (response.success) {
                // Refresh group details
                const groupResponse = await getGroup(selectedGroup.id);
                if (groupResponse.success && groupResponse.data) {
                  setGroupDetails(groupResponse.data as GroupDetails);
                }
                // Update groups list
                fetchGroups(searchQuery);
              } else {
                Alert.alert('Error', response.message || 'Failed to remove member');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove member');
            } finally {
              setRemovingMember(null);
            }
          },
        },
      ]
    );
  };

  // Render Add Group Modal Content
  const renderAddModalContent = () => (
    <View style={styles.formModalContainer}>
      <View style={styles.formModalHeader}>
        <View style={styles.formModalTitleRow}>
          <Text style={styles.formModalIcon}>➕</Text>
          <Text style={styles.formModalTitle}>Create New Group</Text>
        </View>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeAddModal}>
          <Text style={styles.modalCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.formModalBody}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Group Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            value={formName}
            onChangeText={setFormName}
            placeholder="Enter group name"
            placeholderTextColor="#94a3b8"
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.formButton, styles.cancelButton]}
          onPress={closeAddModal}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formButton, styles.saveButton]}
          onPress={handleAddGroup}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>Create</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Edit Group Modal Content
  const renderEditModalContent = () => (
    <View style={styles.formModalContainer}>
      <View style={styles.formModalHeader}>
        <View style={styles.formModalTitleRow}>
          <Text style={styles.formModalIcon}>✏️</Text>
          <Text style={styles.formModalTitle}>Edit Group</Text>
        </View>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeEditModal}>
          <Text style={styles.modalCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.formModalBody}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Group Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            value={formName}
            onChangeText={setFormName}
            placeholder="Enter group name"
            placeholderTextColor="#94a3b8"
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.formButton, styles.cancelButton]}
          onPress={closeEditModal}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formButton, styles.saveButton]}
          onPress={handleUpdateGroup}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>Update</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Members Modal Content
  const renderMembersModalContent = () => (
    <View style={styles.membersModalContainer}>
      <View style={styles.formModalHeader}>
        <View style={styles.formModalTitleRow}>
          <Text style={styles.formModalIcon}>👥</Text>
          <Text style={styles.formModalTitle}>
            {selectedGroup?.name || 'Group'} Members
          </Text>
        </View>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeMembersModal}>
          <Text style={styles.modalCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {loadingMembers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      ) : (
        <>
          <View style={styles.membersHeader}>
            <Text style={styles.membersCountText}>
              {groupDetails?.member_count || 0} member(s)
            </Text>
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={openAddMemberModal}>
              <Text style={styles.addMemberButtonIcon}>➕</Text>
              <Text style={styles.addMemberButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.membersListContainer}
            showsVerticalScrollIndicator={false}>
            {groupDetails?.members && groupDetails.members.length > 0 ? (
              groupDetails.members.map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberItem,
                    index === groupDetails.members.length - 1 &&
                      styles.lastMemberItem,
                  ]}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => handleRemoveMember(member)}
                    disabled={removingMember === member.id}>
                    {removingMember === member.id ? (
                      <ActivityIndicator size="small" color="#dc2626" />
                    ) : (
                      <Text style={styles.removeMemberIcon}>🗑️</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.noMembersContainer}>
                <Text style={styles.noMembersIcon}>👥</Text>
                <Text style={styles.noMembersTitle}>No Members</Text>
                <Text style={styles.noMembersText}>
                  This group has no members yet. Add contacts to this group.
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.formButton, styles.fullWidthButton]}
          onPress={closeMembersModal}>
          <Text style={styles.cancelButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Add Member Modal Content
  const renderAddMemberModalContent = () => (
    <View style={styles.membersModalContainer}>
      <View style={styles.formModalHeader}>
        <View style={styles.formModalTitleRow}>
          <Text style={styles.formModalIcon}>➕</Text>
          <Text style={styles.formModalTitle}>Add Members</Text>
        </View>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeAddMemberModal}>
          <Text style={styles.modalCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {loadingAvailableContacts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.membersListContainer}
          showsVerticalScrollIndicator={false}>
          {availableContacts.length > 0 ? (
            availableContacts.map((contact, index) => (
              <View
                key={contact.id}
                style={[
                  styles.memberItem,
                  index === availableContacts.length - 1 && styles.lastMemberItem,
                ]}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {contact.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{contact.name}</Text>
                  <Text style={styles.memberPhone}>{contact.phone}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addContactButton}
                  onPress={() => handleAddMember(contact)}
                  disabled={addingMember === contact.id}>
                  {addingMember === contact.id ? (
                    <ActivityIndicator size="small" color="#16a34a" />
                  ) : (
                    <Text style={styles.addContactIcon}>➕</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.noMembersContainer}>
              <Text style={styles.noMembersIcon}>📱</Text>
              <Text style={styles.noMembersTitle}>No Contacts Available</Text>
              <Text style={styles.noMembersText}>
                All your contacts are already members of this group, or you haven't
                added any contacts yet.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.formButton, styles.fullWidthButton]}
          onPress={closeAddMemberModal}>
          <Text style={styles.cancelButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header
          title="Groups"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
          walletBalance="£6859"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />

      <Header
        title="Groups"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={onNotificationPress}
        notificationCount={notificationCount}
        walletBalance="£6859"
      />

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ea6118']}
              tintColor="#ea6118"
            />
          }>
          {/* Statistics Summary */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statsNumber}>{statistics.total_groups}</Text>
                <Text style={styles.statsLabel}>Total Groups</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statsNumber}>{statistics.total_members}</Text>
                <Text style={styles.statsLabel}>Total Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statsNumber}>{statistics.active_groups}</Text>
                <Text style={styles.statsLabel}>Active Groups</Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchCard}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search groups..."
                placeholderTextColor="#94a3b8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    fetchGroups();
                  }}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Groups List Card */}
          <View style={styles.resultsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderIcon}>👥</Text>
              <Text style={styles.cardHeaderTitle}>Your Groups</Text>
              <TouchableOpacity
                style={styles.infoButtonSmall}
                onPress={() => setShowInfoSheet(true)}>
                <Text style={styles.infoButtonIcon}>ℹ️</Text>
              </TouchableOpacity>
            </View>

            {groups.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>👥</Text>
                <Text style={styles.noDataTitle}>No Groups Found</Text>
                <Text style={styles.noDataText}>
                  {searchQuery
                    ? 'No groups match your search. Try a different keyword.'
                    : "You haven't created any groups yet. Tap the + button to create one."}
                </Text>
              </View>
            ) : (
              <>
                {/* Groups Grid */}
                <View style={styles.groupsGrid}>
                  {groups.map(group => (
                    <View key={group.id} style={styles.groupCard}>
                      <View style={styles.groupCardHeader}>
                        <Text style={styles.groupIcon}>👥</Text>
                        <Text style={styles.groupName} numberOfLines={2}>
                          {group.name}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.memberCountBadge,
                          group.member_count === 0 && styles.zeroMembers,
                        ]}
                        onPress={() => openMembersModal(group)}>
                        <Text style={styles.memberCountIcon}>👤</Text>
                        <Text
                          style={[
                            styles.memberCountText,
                            group.member_count === 0 && styles.zeroMembersText,
                          ]}>
                          {group.member_count}{' '}
                          {group.member_count === 1 ? 'member' : 'members'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.groupActions}>
                        <TouchableOpacity
                          style={styles.actionBtnAdd}
                          onPress={() => openMembersModal(group)}>
                          <Text style={styles.actionBtnIcon}>👤➕</Text>
                          <Text style={styles.actionBtnText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtnEdit}
                          onPress={() => openEditModal(group)}>
                          <Text style={styles.actionBtnIcon}>✏️</Text>
                          <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtnDelete}
                          onPress={() => handleDeleteGroup(group)}>
                          <Text style={styles.actionBtnIcon}>🗑️</Text>
                          <Text style={styles.actionBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
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

        {/* Floating Action Button - Create New Group */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openAddModal}
          activeOpacity={0.8}>
          <View style={styles.fabContent}>
            <Text style={styles.fabIcon}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Add Group Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={closeAddModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>{renderAddModalContent()}</View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={closeEditModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>{renderEditModalContent()}</View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={closeMembersModal}>
        <View style={styles.modalOverlay}>{renderMembersModalContent()}</View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={closeAddMemberModal}>
        <View style={styles.modalOverlay}>{renderAddMemberModalContent()}</View>
      </Modal>

      {/* Info Bottom Sheet Modal */}
      <Modal
        visible={showInfoSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
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

            <ScrollView
              style={styles.bottomSheetBody}
              showsVerticalScrollIndicator={false}>
              {/* Manage Contact Groups Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>👥</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>
                    Manage Contact Groups
                  </Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Groups help you organize your contacts for easy bulk SMS
                    sending. Create groups for different categories like customers,
                    friends, or business contacts.
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
                    Tap the + button to add a new group. Give it a
                    descriptive name so you can easily find it later when sending
                    messages.
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
                    Tap on any group to view its members. Use the "Add" button to
                    add contacts from your address book to the group. Each contact
                    can be in multiple groups.
                  </Text>
                </View>
              </View>

              {/* Bulk SMS Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>📨</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Bulk SMS Sending</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    When sending SMS, select a group to message all its members at
                    once. This saves time when you need to send the same message
                    to multiple people.
                  </Text>
                </View>
              </View>
            </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  // Stats Card
  statsCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ea6118',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ea6118',
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  // Search Card
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#293B50',
  },
  clearIcon: {
    fontSize: 16,
    color: '#94a3b8',
    padding: 4,
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
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  cardHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  infoButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 16,
  },
  // No Data State
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 64,
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
    marginBottom: 20,
  },
  // Groups Grid
  groupsGrid: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 3,
    borderTopColor: '#ea6118',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  zeroMembers: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberCountIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  memberCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  zeroMembersText: {
    color: '#64748b',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnAdd: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnEdit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnDelete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnIcon: {
    fontSize: 14,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
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
  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    marginTop: -2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  // Form Modal
  formModalContainer: {
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
  formModalHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formModalIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  formModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  formModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#dc2626',
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#293B50',
  },
  formModalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  formButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    backgroundColor: '#ea6118',
  },
  saveButtonIcon: {
    fontSize: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  fullWidthButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  // Members Modal
  membersModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  membersCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  addMemberButtonIcon: {
    fontSize: 14,
  },
  addMemberButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  membersListContainer: {
    padding: 16,
    maxHeight: 350,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastMemberItem: {
    borderBottomWidth: 0,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  removeMemberButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMemberIcon: {
    fontSize: 16,
  },
  addContactButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContactIcon: {
    fontSize: 16,
  },
  noMembersContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noMembersIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noMembersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
  },
  noMembersText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Bottom Sheet Modal
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
    paddingBottom: 50,
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
});

export default GroupsScreen;
