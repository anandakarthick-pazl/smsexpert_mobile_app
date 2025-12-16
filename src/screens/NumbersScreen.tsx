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
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  Contact,
} from '../services/numbersService';

interface NumbersScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const NumbersScreen: React.FC<NumbersScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cleaningNumbers, setCleaningNumbers] = useState(false);
  const [togglingFavourite, setTogglingFavourite] = useState<number | null>(null);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formFavourite, setFormFavourite] = useState(false);

  // Search debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchContacts = useCallback(async (search?: string) => {
    try {
      const response = await getContacts(1, 100, search);
      if (response.success && response.data) {
        setContacts(response.data.items);
        setTotalContacts(response.data.pagination.total);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContacts(searchQuery);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if no modal is open
    if (!showAddModal && !showEditModal) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchContacts(text);
      }, 500);
    }
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
    setFormFavourite(false);
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

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setFormName(contact.name || '');
    setFormPhone(contact.phone || '');
    setFormEmail(contact.email || '');
    setFormNotes(contact.notes || '');
    setFormFavourite(contact.is_favourite || false);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    Keyboard.dismiss();
    setShowEditModal(false);
    setSelectedContact(null);
    resetForm();
  };

  const handleAddContact = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!formPhone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    Keyboard.dismiss();
    setSaving(true);
    try {
      const response = await createContact({
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
        is_favourite: formFavourite,
      });

      if (response.success) {
        Alert.alert('Success', 'Contact added successfully');
        setShowAddModal(false);
        resetForm();
        fetchContacts(searchQuery);
      } else {
        Alert.alert('Error', response.message || 'Failed to add contact');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;
    
    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    Keyboard.dismiss();
    setSaving(true);
    try {
      const response = await updateContact(selectedContact.id, {
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
        is_favourite: formFavourite,
      });

      if (response.success) {
        Alert.alert('Success', 'Contact updated successfully');
        setShowEditModal(false);
        setSelectedContact(null);
        resetForm();
        fetchContacts(searchQuery);
      } else {
        Alert.alert('Error', response.message || 'Failed to update contact');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${contact.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteContact(contact.id);
              if (response.success) {
                Alert.alert('Success', 'Contact deleted successfully');
                fetchContacts(searchQuery);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete contact');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  // Toggle Favourite directly from list
  const handleToggleFavourite = async (contact: Contact) => {
    setTogglingFavourite(contact.id);
    try {
      const newFavouriteStatus = !contact.is_favourite;
      const response = await updateContact(contact.id, {
        is_favourite: newFavouriteStatus,
      });

      if (response.success) {
        // Update local state immediately for better UX
        setContacts(prevContacts =>
          prevContacts.map(c =>
            c.id === contact.id ? {...c, is_favourite: newFavouriteStatus} : c
          )
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update favourite status');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update favourite status');
    } finally {
      setTogglingFavourite(null);
    }
  };

  // Clean Bad Numbers - removes contacts with invalid phone numbers
  const handleCleanBadNumbers = () => {
    // Find contacts with potentially bad numbers
    const badNumbers = contacts.filter(contact => {
      const phone = contact.phone || '';
      // Check for invalid patterns:
      // - Too short (less than 10 digits)
      // - Contains non-numeric characters (except + at start)
      // - All same digits
      // - Starts with invalid prefix
      const digitsOnly = phone.replace(/\D/g, '');
      
      if (digitsOnly.length < 10) return true;
      if (digitsOnly.length > 15) return true;
      if (/^(\d)\1+$/.test(digitsOnly)) return true; // All same digits like 0000000000
      if (/^0{5,}/.test(digitsOnly)) return true; // Starts with many zeros
      
      return false;
    });

    if (badNumbers.length === 0) {
      Alert.alert(
        '✅ All Numbers Valid',
        'Great news! All your contact numbers appear to be valid. No cleaning needed.',
        [{text: 'OK'}]
      );
      return;
    }

    Alert.alert(
      '🧹 Clean Bad Numbers',
      `Found ${badNumbers.length} contact(s) with potentially invalid phone numbers:\n\n${badNumbers
        .slice(0, 5)
        .map(c => `• ${c.name}: ${c.phone}`)
        .join('\n')}${badNumbers.length > 5 ? `\n... and ${badNumbers.length - 5} more` : ''}\n\nDo you want to remove these contacts?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: async () => {
            setCleaningNumbers(true);
            let deleted = 0;
            let failed = 0;

            for (const contact of badNumbers) {
              try {
                const response = await deleteContact(contact.id);
                if (response.success) {
                  deleted++;
                } else {
                  failed++;
                }
              } catch (error) {
                failed++;
              }
            }

            setCleaningNumbers(false);
            
            if (deleted > 0) {
              Alert.alert(
                '✅ Cleaning Complete',
                `Successfully removed ${deleted} contact(s) with bad numbers.${failed > 0 ? `\n${failed} contact(s) could not be removed.` : ''}`,
                [{text: 'OK', onPress: () => fetchContacts(searchQuery)}]
              );
            } else {
              Alert.alert('Error', 'Failed to remove contacts. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Render Add Modal Content
  const renderAddModalContent = () => (
    <View style={styles.formModalContainer}>
      {/* Modal Header */}
      <View style={styles.formModalHeader}>
        <View style={styles.formModalTitleRow}>
          <Text style={styles.formModalIcon}>➕</Text>
          <Text style={styles.formModalTitle}>Add New Contact</Text>
        </View>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeAddModal}>
          <Text style={styles.modalCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Body */}
      <ScrollView 
        style={styles.formModalBody} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}>
        {/* Name Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            value={formName}
            onChangeText={setFormName}
            placeholder="Enter contact name"
            placeholderTextColor="#94a3b8"
            autoCorrect={false}
          />
        </View>

        {/* Phone Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Phone Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            value={formPhone}
            onChangeText={setFormPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        {/* Email Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email (Optional)</Text>
          <TextInput
            style={styles.formInput}
            value={formEmail}
            onChangeText={setFormEmail}
            placeholder="Enter email address"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Notes Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Notes (Optional)</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={formNotes}
            onChangeText={setFormNotes}
            placeholder="Add notes about this contact"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Favourite Toggle */}
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchIcon}>⭐</Text>
            <Text style={styles.switchLabel}>Mark as Favourite</Text>
          </View>
          <Switch
            value={formFavourite}
            onValueChange={setFormFavourite}
            trackColor={{false: '#e2e8f0', true: '#ea6118'}}
            thumbColor={formFavourite ? '#fff' : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      {/* Modal Footer */}
      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.formButton, styles.cancelButton]}
          onPress={closeAddModal}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formButton, styles.saveButton]}
          onPress={handleAddContact}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Edit Modal Content
  const renderEditModalContent = () => (
    <View style={styles.formModalContainer}>
      {/* Modal Header */}
      <View style={styles.formModalHeader}>
        <View style={styles.formModalTitleRow}>
          <Text style={styles.formModalIcon}>✏️</Text>
          <Text style={styles.formModalTitle}>Edit Contact</Text>
        </View>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeEditModal}>
          <Text style={styles.modalCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Body */}
      <ScrollView 
        style={styles.formModalBody} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}>
        {/* Name Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            value={formName}
            onChangeText={setFormName}
            placeholder="Enter contact name"
            placeholderTextColor="#94a3b8"
            autoCorrect={false}
          />
        </View>

        {/* Phone Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Phone Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.formInput, styles.disabledInput]}
            value={formPhone}
            editable={false}
            placeholder="Enter phone number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
          <Text style={styles.helperText}>
            Phone number cannot be changed after creation
          </Text>
        </View>

        {/* Email Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email (Optional)</Text>
          <TextInput
            style={styles.formInput}
            value={formEmail}
            onChangeText={setFormEmail}
            placeholder="Enter email address"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Notes Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Notes (Optional)</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={formNotes}
            onChangeText={setFormNotes}
            placeholder="Add notes about this contact"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Favourite Toggle */}
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchIcon}>⭐</Text>
            <Text style={styles.switchLabel}>Mark as Favourite</Text>
          </View>
          <Switch
            value={formFavourite}
            onValueChange={setFormFavourite}
            trackColor={{false: '#e2e8f0', true: '#ea6118'}}
            thumbColor={formFavourite ? '#fff' : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      {/* Modal Footer */}
      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.formButton, styles.cancelButton]}
          onPress={closeEditModal}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formButton, styles.saveButton]}
          onPress={handleUpdateContact}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header
          title="Numbers"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
          walletBalance="£6859"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />

      <Header
        title="Numbers"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      {/* Cleaning Overlay */}
      {cleaningNumbers && (
        <View style={styles.cleaningOverlay}>
          <View style={styles.cleaningBox}>
            <ActivityIndicator size="large" color="#ea6118" />
            <Text style={styles.cleaningText}>Cleaning bad numbers...</Text>
          </View>
        </View>
      )}

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
            <Text style={styles.statsNumber}>{totalContacts}</Text>
            <Text style={styles.statsLabel}>Total Contacts</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchCard}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search contacts..."
                placeholderTextColor="#94a3b8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    fetchContacts();
                  }}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Contacts List Card */}
          <View style={styles.resultsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderIcon}>📱</Text>
              <Text style={styles.cardHeaderTitle}>Your Contacts</Text>
              <TouchableOpacity
                style={styles.infoButtonSmall}
                onPress={() => setShowInfoSheet(true)}>
                <Text style={styles.infoButtonIcon}>ℹ️</Text>
              </TouchableOpacity>
            </View>

            {contacts.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>📱</Text>
                <Text style={styles.noDataTitle}>No Contacts Found</Text>
                <Text style={styles.noDataText}>
                  {searchQuery
                    ? 'No contacts match your search. Try a different keyword.'
                    : 'Your address book is empty. Tap the + button to add contacts.'}
                </Text>
              </View>
            ) : (
              <>
                {/* Contacts List */}
                <View style={styles.contactsList}>
                  {contacts.map((contact, index) => (
                    <View
                      key={contact.id}
                      style={[
                        styles.contactItem,
                        index === contacts.length - 1 && styles.lastContactItem,
                      ]}>
                      {/* Row 1: Name and Favourite */}
                      <View style={styles.contactRow}>
                        <View style={styles.contactLeft}>
                          <View style={styles.contactAvatar}>
                            <Text style={styles.contactAvatarText}>
                              {contact.name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          </View>
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{contact.name}</Text>
                            <View style={styles.phoneRow}>
                              <Text style={styles.phoneIcon}>📱</Text>
                              <Text style={styles.phoneText}>{contact.phone}</Text>
                            </View>
                          </View>
                        </View>
                        {/* Tappable Favourite Badge */}
                        <TouchableOpacity
                          style={[
                            styles.favouriteBadge,
                            contact.is_favourite
                              ? styles.favouriteYes
                              : styles.favouriteNo,
                          ]}
                          onPress={() => handleToggleFavourite(contact)}
                          disabled={togglingFavourite === contact.id}>
                          {togglingFavourite === contact.id ? (
                            <ActivityIndicator size="small" color="#f59e0b" />
                          ) : (
                            <Text style={styles.favouriteText}>
                              {contact.is_favourite ? '⭐' : '☆'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Row 2: Network & Actions */}
                      <View style={styles.contactActionsRow}>
                        <View style={styles.networkBadge}>
                          <Text style={styles.networkIcon}>📶</Text>
                          <Text style={styles.networkText}>
                            {contact.network || 'Unknown'}
                          </Text>
                        </View>
                        <View style={styles.actionsRow}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal(contact)}>
                            <Text style={styles.actionIcon}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteContact(contact)}>
                            <Text style={styles.actionIcon}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* End of List Indicator */}
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>— End of contacts —</Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Buttons */}
        {/* Secondary FAB - Clean Bad Numbers */}
        <TouchableOpacity
          style={[styles.fabSecondary, (cleaningNumbers || contacts.length === 0) && styles.fabDisabled]}
          onPress={handleCleanBadNumbers}
          disabled={cleaningNumbers || contacts.length === 0}
          activeOpacity={0.8}>
          <View style={styles.fabContent}>
            <Text style={styles.fabIconEmoji}>🧹</Text>
          </View>
        </TouchableOpacity>

        {/* Primary FAB - Add Contact */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openAddModal}
          activeOpacity={0.8}>
          <View style={styles.fabContent}>
            <Text style={styles.fabIcon}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Add Contact Modal */}
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
            <View style={styles.modalOverlay}>
              {renderAddModalContent()}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Contact Modal */}
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
            <View style={styles.modalOverlay}>
              {renderEditModalContent()}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

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
                <Text style={styles.bottomSheetTitle}>Numbers Information</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.bottomSheetBody}
              showsVerticalScrollIndicator={false}>
              {/* Manage Your Contact Numbers Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>📱</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>
                    Manage Your Contact Numbers
                  </Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    This is your personal address book where you can store and
                    manage phone numbers for easy SMS sending. You can add
                    individual contacts and organize them by marking favourites.
                  </Text>
                </View>
              </View>

              {/* Add Contacts Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>➕</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Adding Contacts</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    Tap the + button to add new contacts to your address book.
                    You can store names and phone numbers for quick access when
                    sending SMS messages.
                  </Text>
                </View>
              </View>

              {/* Favourites Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>⭐</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Favourite Contacts</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Tap the star icon on any contact to mark them as favourite.
                    Favourite contacts are easier to find and select when sending messages.
                  </Text>
                </View>
              </View>

              {/* Clean Bad Numbers Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.redBg]}>
                    <Text style={styles.infoSectionIcon}>🧹</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Clean Bad Numbers</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.redBorder]}>
                  <Text style={styles.infoSectionText}>
                    Use the 🧹 button to automatically find and remove contacts
                    with invalid phone numbers (too short, invalid format, or
                    fake numbers like all zeros).
                  </Text>
                </View>
              </View>

              {/* Network Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>📶</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Network Information</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    Each contact shows their network provider information. This
                    helps you understand delivery routes and potential costs for
                    different networks.
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
    paddingBottom: 100, // Space for FABs
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
  // Cleaning Overlay
  cleaningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  cleaningBox: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cleaningText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
  },
  // Stats Card
  statsCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ea6118',
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ea6118',
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
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
  // Contacts List
  contactsList: {
    padding: 0,
  },
  contactItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastContactItem: {
    borderBottomWidth: 0,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  phoneText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  favouriteBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favouriteYes: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  favouriteNo: {
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  favouriteText: {
    fontSize: 20,
  },
  contactActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  networkIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0891b2',
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
  // Floating Action Button (FAB) - Gmail style like Campaign History
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
  fabSecondary: {
    position: 'absolute',
    bottom: 92,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabDisabled: {
    backgroundColor: '#cbd5e1',
    shadowColor: '#cbd5e1',
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
  fabIconEmoji: {
    fontSize: 22,
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
  disabledInput: {
    backgroundColor: '#e2e8f0',
    color: '#94a3b8',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  redBg: {
    backgroundColor: '#fee2e2',
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
  redBorder: {
    borderLeftColor: '#dc2626',
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

export default NumbersScreen;
