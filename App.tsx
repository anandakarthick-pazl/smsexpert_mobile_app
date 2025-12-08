/**
 * SMS Expert Mobile App
 */

import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SMSWalletScreen from './src/screens/SMSWalletScreen';
import SendNewSMSScreen from './src/screens/SendNewSMSScreen';
import ReceivedSMSScreen from './src/screens/ReceivedSMSScreen';
import SentSMSScreen from './src/screens/SentSMSScreen';
import KeywordsScreen from './src/screens/KeywordsScreen';
import NumbersScreen from './src/screens/NumbersScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import SidebarModal from './src/components/SidebarModal';

type ScreenName = 
  | 'Login' 
  | 'Dashboard' 
  | 'SMSWallet' 
  | 'SendSMS' 
  | 'ReceivedSMS'
  | 'SentSMS' 
  | 'Keywords' 
  | 'Numbers' 
  | 'Groups' 
  | 'Profile' 
  | 'Contracts'
  | 'Invoices' 
  | 'TechDocs' 
  | 'DeliveryReceipt' 
  | 'Stops' 
  | 'Blacklist';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Login');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // User info - this can be fetched from API after login
  const [userInfo] = useState({
    userName: 'Customer',
    companyName: 'Dashboard User',
  });

  const navigate = (screen: string) => {
    setCurrentScreen(screen as ScreenName);
    setSidebarVisible(false);
  };

  const openSidebar = () => {
    console.log('Opening sidebar');
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    console.log('Closing sidebar');
    setSidebarVisible(false);
  };

  const logout = () => {
    setCurrentScreen('Login');
    setSidebarVisible(false);
  };

  const navigation = {
    navigate,
    openDrawer: openSidebar,
    goBack: () => navigate('Dashboard'),
    reset: ({routes}: {index: number; routes: {name: string}[]}) => {
      setCurrentScreen(routes[0].name as ScreenName);
    },
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Dashboard':
        return <DashboardScreen navigation={navigation} />;
      case 'SMSWallet':
        return <SMSWalletScreen navigation={navigation} />;
      case 'SendSMS':
        return <SendNewSMSScreen navigation={navigation} />;
      case 'ReceivedSMS':
        return <ReceivedSMSScreen navigation={navigation} />;
      case 'SentSMS':
        return <SentSMSScreen navigation={navigation} />;
      case 'Keywords':
        return <KeywordsScreen navigation={navigation} />;
      case 'Numbers':
        return <NumbersScreen navigation={navigation} />;
      default:
        return (
          <PlaceholderScreen
            navigation={navigation}
            route={{name: currentScreen}}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      {renderScreen()}
      {currentScreen !== 'Login' && (
        <SidebarModal
          visible={sidebarVisible}
          onClose={closeSidebar}
          onNavigate={navigate}
          onLogout={logout}
          currentRoute={currentScreen}
          userName={userInfo.userName}
          companyName={userInfo.companyName}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
