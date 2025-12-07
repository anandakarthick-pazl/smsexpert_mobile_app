import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import Colors from '../theme/colors';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

const menuItems: MenuItem[] = [
  {name: 'Dashboard', icon: '🏠', route: 'Dashboard'},
  {name: 'SMS Wallet', icon: '💳', route: 'SMSWallet'},
  {name: 'Send New SMS', icon: '📤', route: 'SendSMS'},
  {name: 'Received SMS', icon: '📥', route: 'ReceivedSMS'},
  {name: 'Sent SMS', icon: '💬', route: 'SentSMS'},
  {name: 'Keywords', icon: '🔑', route: 'Keywords'},
  {name: 'Numbers', icon: '📋', route: 'Numbers'},
  {name: 'Groups', icon: '👥', route: 'Groups'},
  {name: 'Client Profile', icon: '👤', route: 'Profile'},
  {name: 'Contracts', icon: '📄', route: 'Contracts'},
  {name: 'Invoices', icon: '🧾', route: 'Invoices'},
  {name: 'Technical Docs', icon: '📚', route: 'TechDocs'},
  {name: 'Delivery Receipt', icon: '✅', route: 'DeliveryReceipt'},
  {name: 'STOPs/Optouts', icon: '🛑', route: 'Stops'},
  {name: 'Blacklist', icon: '⛔', route: 'Blacklist'},
];

interface CustomDrawerProps {
  navigation: any;
  state: any;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({navigation, state}) => {
  const currentRoute = state.routes[state.index].name;

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSMS}>SMS</Text>
          <Text style={styles.logoExpert}>Expert</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.closeDrawer()}>
          <Text style={styles.menuIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              currentRoute === item.route && styles.menuItemActive,
            ]}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.menuIconContainer,
                currentRoute === item.route && styles.menuIconContainerActive,
              ]}>
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
            </View>
            <Text
              style={[
                styles.menuItemText,
                currentRoute === item.route && styles.menuItemTextActive,
              ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoSMS: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  logoExpert: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 14,
    color: Colors.textWhite,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: Colors.primary,
  },
  menuIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(234, 97, 24, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemIcon: {
    fontSize: 12,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  menuItemTextActive: {
    color: Colors.textWhite,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  logoutIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc3545',
  },
});

export default CustomDrawer;
