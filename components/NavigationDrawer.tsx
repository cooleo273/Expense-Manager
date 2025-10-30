import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

const DRAWER_WIDTH = 280;

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const router = useRouter();
  const { showToast } = useToast();
  const [isMounted, setIsMounted] = useState(visible);
  const animation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const navigationItems = [
    { label: 'Debts', route: '/reminders', icon: 'credit-card-clock' },
    { label: 'Budgets', route: '/analysis', icon: 'chart-pie' },
    { label: 'Accounts', route: '/accounts', icon: 'wallet-outline' },
    { label: 'Categories', route: '/analysis', icon: 'shape-outline' },
    { label: 'Settings', route: '/settings', icon: 'cog-outline' },
    { label: 'Templates', route: '/support', icon: 'file-document-edit-outline' },
    { label: 'Help', route: '/support', icon: 'help-circle-outline' },
  ];

  const handleNavigate = (route: string, label: string) => {
    onClose();

    // Show toast for features that are not available
    if (['Debts', 'Budgets', 'Accounts', 'Categories', 'Templates'].includes(label)) {
      showToast(`${label} feature is not available yet`);
      return;
    }

    // Navigate for available features
    if (route) {
      router.push(route as any);
    }
  };

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (isMounted) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [animation, isMounted, visible]);

  if (!isMounted) {
    return null;
  }

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: palette.card,
              transform: [{ translateX }],
              shadowColor: 'rgba(15,23,42,0.25)',
              paddingTop: Math.max(insets.top, 24),
            },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>J</Text>
            </View>
            <View>
              <Text style={[styles.profileName, { color: palette.text }]}>John Doe</Text>
              <Text style={[styles.profileHint, { color: palette.icon }]}>Premium Member</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.dismissButton}>
              <MaterialCommunityIcons name="close" size={20} color={palette.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.navItem, { borderBottomColor: palette.border }]}
                onPress={() => handleNavigate(item.route, item.label)}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={palette.icon}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ color: palette.text, fontSize: 16 }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footerSection}>
            <TouchableOpacity style={[styles.footerButton, { borderColor: palette.border }]} onPress={() => handleNavigate('/support', 'Legacy Mode')}>
              <Text style={{ color: palette.text }}>Legacy Mode</Text>
              <MaterialCommunityIcons name="toggle-switch-off-outline" size={22} color={palette.icon} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 12,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2933',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileHint: {
    marginTop: 4,
    fontSize: 13,
  },
  dismissButton: {
    marginLeft: 'auto',
    padding: 6,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,231,235,0.7)',
    paddingTop: 16,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
});