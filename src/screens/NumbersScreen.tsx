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

interface NumbersScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

interface ContactItem {
  id: number;
  name: string;
  number: string;
  network: string;
  isFavourite: boolean;
}

const NumbersScreen: React.FC<NumbersScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  
  const [contacts] = useState<ContactItem[]>([
    {id: 4755, name: '447748154719', number: '447748154719', network: 'Other', isFavourite: false},
    {id: 4745, name: 'srf test contact', number: '01932710958', network: '3', isFavourite: false},
    {id: 4747, name: 'Mark', number: '447740673828', network: 'Other', isFavourite: false},
    {id: 4748, name: 'Office', number: '441932710710', network: 'Unknown', isFavourite: false},
    {id: 4756, name: '447407311128', number: '447407311128', network: 'Other', isFavourite: false},
    {id: 4757, name: 'MYBRANDNAME', number: 'MYBRANDNAME', network: 'Other', isFavourite: false},
  ]);

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleAddContact = () => {
    Alert.alert('Add Contact', 'Navigate to add new contact form');
  };

  const handleEditContact = (contact: ContactItem) => {
    Alert.alert('Edit Contact', `Edit contact: ${contact.name}`);
  };

  const handleDeleteContact = (contact: ContactItem) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${contact.name}"?`,
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
        title="Numbers"
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
            <Text style={styles.totalLabel}>Total Numbers:</Text>
            <Text style={styles.totalValue}>{contacts.length}</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Add Contact Button */}
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddContact}>
              <Text style={styles.addButtonIcon}>+</Text>
            </TouchableOpacity>
            {/* Info Button */}
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoSheet(true)}>
              <Text style={styles.infoButtonIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contacts List Card */}
        <View style={styles.resultsCard}>
          {contacts.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>📱</Text>
              <Text style={styles.noDataTitle}>No Contacts Found</Text>
              <Text style={styles.noDataText}>
                Your address book is empty. Add contacts to get started.
              </Text>
            </View>
          ) : (
            <>
              {/* Contacts List */}
              <View style={styles.contactsList}>
                {contacts.map((contact, index) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={[
                      styles.contactItem,
                      index === contacts.length - 1 && styles.lastContactItem
                    ]}
                    onPress={() => handleEditContact(contact)}>
                    {/* Row 1: Name and Favourite */}
                    <View style={styles.contactRow}>
                      <View style={styles.contactLeft}>
                        <Text style={styles.contactLabel}>Name:</Text>
                        <View style={styles.nameBadge}>
                          <Text style={styles.nameBadgeText}>{contact.name}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.favouriteBadge,
                        contact.isFavourite ? styles.favouriteYes : styles.favouriteNo
                      ]}>
                        <Text style={styles.favouriteText}>
                          {contact.isFavourite ? '⭐ Yes' : '☆ No'}
                        </Text>
                      </View>
                    </View>

                    {/* Row 2: Phone Number with Edit/Delete icons */}
                    <View style={styles.contactDetailRowWithActions}>
                      <View style={styles.contactDetailLeft}>
                        <Text style={styles.contactDetailIcon}>📱</Text>
                        <Text style={styles.contactDetailText}>{contact.number}</Text>
                      </View>
                      <View style={styles.actionsRow}>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => handleEditContact(contact)}>
                          <Text style={styles.actionIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteContact(contact)}>
                          <Text style={styles.actionIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Row 3: Network */}
                    <View style={styles.contactDetailRow}>
                      <Text style={styles.contactDetailIcon}>📶</Text>
                      <Text style={styles.contactDetailText}>{contact.network}</Text>
                    </View>
                  </TouchableOpacity>
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
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Manage Your Contact Numbers Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>📱</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Manage Your Contact Numbers</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    This is your personal address book where you can store and manage phone numbers for easy SMS sending. You can add individual contacts and organize them by marking favourites.
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
                    Tap the + button to add new contacts to your address book. You can store names and phone numbers for quick access when sending SMS messages.
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
                    Mark your frequently used contacts as favourites for quick access. Favourite contacts appear at the top of your contact list when sending messages.
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
                    Each contact shows their network provider information. This helps you understand delivery routes and potential costs for different networks.
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
  // Contacts List
  contactsList: {
    padding: 0,
  },
  contactItem: {
    padding: 14,
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
    marginBottom: 10,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  nameBadge: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nameBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  favouriteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favouriteYes: {
    backgroundColor: '#fef3c7',
  },
  favouriteNo: {
    backgroundColor: '#f1f5f9',
  },
  favouriteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactDetailRowWithActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactDetailIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  contactDetailText: {
    fontSize: 14,
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});

export default NumbersScreen;
