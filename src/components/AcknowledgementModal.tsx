/**
 * Acknowledgement Modal Component
 * Shows a popup for notifications that require acknowledgement
 * User must acknowledge before dismissing
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

const {width, height} = Dimensions.get('window');

interface AcknowledgementNotification {
  id: string;
  notification_id?: number;
  title: string;
  message: string;
  type: string;
  created_at?: string;
  time_ago?: string;
}

interface AcknowledgementModalProps {
  visible: boolean;
  notification: AcknowledgementNotification | null;
  onAcknowledge: (notificationId: string) => Promise<void>;
  onClose: () => void;
}

const AcknowledgementModal: React.FC<AcknowledgementModalProps> = ({
  visible,
  notification,
  onAcknowledge,
  onClose,
}) => {
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsAcknowledged(false);
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  const handleAcknowledge = async () => {
    if (!notification || isAcknowledging) return;

    setIsAcknowledging(true);
    try {
      await onAcknowledge(notification.id);
      setIsAcknowledged(true);
      
      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getIconForType = (type: string): string => {
    const icons: Record<string, string> = {
      wallet_low: '💰',
      wallet_insufficient: '⚠️',
      throughput_limit: '🚫',
      system: 'ℹ️',
      info: 'ℹ️',
      warning: '⚠️',
      urgent: '🚨',
      promo: '🎁',
      general: '🔔',
      campaign: '📤',
      delivery: '✅',
      success: '✅',
      danger: '🔴',
      announcement: '📢',
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      wallet_low: '#ffc107',
      wallet_insufficient: '#dc3545',
      throughput_limit: '#fd7e14',
      system: '#6c757d',
      info: '#0d6efd',
      warning: '#ffc107',
      urgent: '#dc3545',
      promo: '#6f42c1',
      general: '#293B50',
      campaign: '#20c997',
      delivery: '#198754',
      success: '#198754',
      danger: '#dc3545',
      announcement: '#0dcaf0',
    };
    return colors[type] || '#293B50';
  };

  if (!notification) return null;

  const typeColor = getTypeColor(notification.type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        // Don't allow closing without acknowledgement
        if (!isAcknowledged) {
          // Maybe shake the modal or show a hint
        }
      }}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {transform: [{scale: scaleAnim}]},
          ]}
        >
          {/* Header with Icon */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, {backgroundColor: `${typeColor}20`}]}>
              <Text style={styles.iconText}>{getIconForType(notification.type)}</Text>
            </View>
            
            {/* Acknowledgement Required Badge */}
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>⚡ Action Required</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{notification.title}</Text>

          {/* Time */}
          {notification.time_ago && (
            <Text style={styles.timeText}>{notification.time_ago}</Text>
          )}

          {/* Message */}
          <ScrollView style={styles.messageContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{notification.message}</Text>
          </ScrollView>

          {/* Acknowledgement Status / Button */}
          {isAcknowledged ? (
            <View style={styles.acknowledgedContainer}>
              <View style={styles.acknowledgedIcon}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.acknowledgedText}>Acknowledged Successfully</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.acknowledgeButton, isAcknowledging && styles.buttonDisabled]}
                onPress={handleAcknowledge}
                disabled={isAcknowledging}
                activeOpacity={0.8}
              >
                {isAcknowledging ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>✓</Text>
                    <Text style={styles.buttonText}>I Acknowledge</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text style={styles.hintText}>
                You must acknowledge this notification to continue
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.75,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 40,
  },
  requiredBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  requiredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  hintText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 12,
    textAlign: 'center',
  },
  acknowledgedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  acknowledgedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d4edda',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    fontSize: 32,
    color: '#155724',
  },
  acknowledgedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
  },
});

export default AcknowledgementModal;
